import { MODULES } from './exercises.js';
import { generatePlan, formatDate, estimateExerciseDuration } from './planner.js';
import { normalizeExerciseText } from './exercise-text.js';
import { getVideoSlots, hasVideoContent } from './video-presenter.js';

// ── 状态 ────────────────────────────────────────────────
const STORAGE_KEY = 'badminton-pwa-v1';
let currentPlan   = null;
let currentIndex  = 0;   // 当前显示的卡片索引（0=热身, 1..n=动作, n+1=拉伸）
let planOffset    = 0;   // 换一组的偏移量
let doneSet       = new Set(); // 已完成的卡片索引
let timerInterval = null;
let timerSec      = 0;
let timerRunning  = false;
let timerCardIdx  = null;

// ── 入口 ────────────────────────────────────────────────
init();

function init() {
  currentPlan = generatePlan(new Date(), planOffset);
  render();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

// ── 主渲染 ───────────────────────────────────────────────
function render() {
  const app = document.getElementById('app');
  app.innerHTML = currentPlan.isTrainingDay
    ? renderTrainingDay()
    : renderRestDay();
  attachEvents();
  showCard(currentIndex);
}

function renderRestDay() {
  const next = currentPlan.nextTrainingDay;
  return `
    <div class="nav-bar"><div class="settings-icon" id="btn-settings">⚙️</div></div>
    <div class="header" style="border:none">
      <div class="date">${formatDate(currentPlan.date)}</div>
      <div class="theme" style="font-size:16px;color:var(--text-secondary)">今天休息</div>
    </div>
    <div class="rest-day">
      <div class="rest-icon">😴</div>
      <h2>好好休息</h2>
      <p>肌肉在恢复中生长 💪</p>
      ${next ? `<p class="next">下次训练：${formatDate(next)}</p>` : ''}
    </div>`;
}

function renderTrainingDay() {
  const { theme, warmup, exercises, cooldown } = currentPlan;
  const totalCards = 1 + exercises.length + 1;
  const mainMin = exercises.reduce((s, e) => s + estimateExerciseDuration(e), 0);
  const totalMin = warmup.duration + mainMin + cooldown.duration;

  const dots = [
    `<div class="progress-dot ${currentIndex===0?'active':''} ${doneSet.has(0)?'done':''}" data-idx="0">热</div>`,
    ...exercises.map((_, i) => {
      const idx = i + 1;
      return `<div class="progress-dot ${currentIndex===idx?'active':''} ${doneSet.has(idx)?'done':''}" data-idx="${idx}">${idx}</div>`;
    }),
    `<div class="progress-dot ${currentIndex===totalCards-1?'active':''} ${doneSet.has(totalCards-1)?'done':''}" data-idx="${totalCards-1}">拉</div>`,
  ].join('');

  return `
    <div class="nav-bar"><div class="settings-icon" id="btn-settings">⚙️</div></div>
    <div class="header">
      <div class="date">${formatDate(currentPlan.date)} &nbsp;🔥 ${getStreak()}天连续</div>
      <div class="theme">${theme}</div>
      <div class="meta-row">
        <span>⏱ 约${totalMin}分钟</span>
        <button class="refresh-btn" id="btn-refresh">🔄 换一组</button>
      </div>
    </div>
    <div class="cards-container">
      ${renderWarmupCard(warmup)}
      ${exercises.map((e, i) => renderExerciseCard(e, i + 1, exercises.length)).join('')}
      ${renderCooldownCard(cooldown, totalCards - 1)}
    </div>
    <div class="progress-bar">${dots}</div>`;
}

// ── 卡片渲染 ─────────────────────────────────────────────
function renderWarmupCard(warmup) {
  const idx = 0;
  const done = doneSet.has(idx);
  return `
    <div class="simple-card card ${currentIndex===idx?'active':''}" data-idx="${idx}">
      <div class="simple-card-header" id="warmup-toggle">
        <h2>🔥 ${warmup.name}</h2>
        <div class="duration">${warmup.duration} 分钟 ▾</div>
      </div>
      <div class="simple-card-body" id="warmup-body">
        <ul class="step-list">
          ${warmup.steps.map(s => `<li>${s.name}<span class="step-duration">${s.duration}</span></li>`).join('')}
        </ul>
      </div>
      <button class="complete-btn ${done?'done':''}" data-complete="${idx}">
        ${done ? '✓ 已完成' : '完成热身 →'}
      </button>
    </div>`;
}

function renderCooldownCard(cooldown, idx) {
  const done = doneSet.has(idx);
  return `
    <div class="simple-card card ${currentIndex===idx?'active':''}" data-idx="${idx}">
      <div class="simple-card-header" id="cooldown-toggle">
        <h2>🧘 ${cooldown.name}</h2>
        <div class="duration">${cooldown.duration} 分钟 ▾</div>
      </div>
      <div class="simple-card-body" id="cooldown-body">
        <ul class="step-list">
          ${cooldown.steps.map(s => `<li>${s.name}<span class="step-duration">${s.duration}</span></li>`).join('')}
        </ul>
      </div>
      <button class="complete-btn ${done?'done':''}" data-complete="${idx}">
        ${done ? '✓ 已完成' : '完成拉伸 ✓'}
      </button>
    </div>`;
}

function renderExerciseCard(ex, idx, total) {
  const done = doneSet.has(idx);
  const mod  = MODULES[ex.module] || { name: '', color: '#666' };
  const slots = getVideoSlots(ex);
  const hasVideo = hasVideoContent(ex);
  const text = normalizeExerciseText(ex);

  const videoHtml = hasVideo
    ? `<div class="video-box">
        ${slots.map(slot => renderVideoSlot(slot, ex.name)).join('')}
      </div>`
    : `<div class="video-placeholder">
        <div class="icon">🏃</div>
        <div>无视频演示，请参考文字说明</div>
       </div>`;

  const restSec = ex.rest || 60;
  const isCurrent = timerCardIdx === idx;
  const displaySec = isCurrent ? timerSec : restSec;
  const mm = String(Math.floor(displaySec / 60)).padStart(2, '0');
  const ss = String(displaySec % 60).padStart(2, '0');
  const timerClass = isCurrent && timerRunning ? 'running' : (isCurrent && displaySec === 0 ? 'done' : '');

  return `
    <div class="card ${currentIndex===idx?'active':''}" data-idx="${idx}">
      <div class="card-header">
        <div>
          <div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">${idx} / ${total}</div>
          <h2>${ex.name}</h2>
          <div class="why">${ex.why}</div>
        </div>
      </div>

      ${videoHtml}

      <div class="exercise-meta">
        <div class="meta-chip">${ex.sets}组<span>组数</span></div>
        <div class="meta-chip">${ex.reps}<span>次数/时间</span></div>
        <div class="meta-chip">${ex.rest}秒<span>组间休息</span></div>
      </div>

      <div class="timer-section">
        <div class="timer-display ${timerClass}" id="timer-${idx}">${mm}:${ss}</div>
        <div class="timer-controls">
          <button class="timer-btn ${isCurrent && timerRunning ? 'pause' : 'start'}"
                  data-timer="${idx}" data-rest="${restSec}">
            ${isCurrent && timerRunning ? '⏸ 暂停' : '▶ 开始'}
          </button>
          <button class="timer-btn reset" data-reset="${idx}" data-rest="${restSec}">↺ 重置</button>
        </div>
      </div>

      <div class="tips-section">
        <h3>动作要领</h3>
        <ul class="tips-list">
          ${text.tips.map(t => `<li>${t}</li>`).join('')}
        </ul>
        <h3 style="margin-top:10px">常见错误</h3>
        <ul class="tips-list mistakes">
          ${text.mistakes.map(m => `<li>${m}</li>`).join('')}
        </ul>
      </div>

      <button class="complete-btn ${done?'done':''}" data-complete="${idx}">
        ${done ? '✓ 已完成' : `完成第${idx}个动作 →`}
      </button>
    </div>`;
}

// ── 卡片切换 ─────────────────────────────────────────────
function showCard(idx) {
  const totalCards = currentPlan.isTrainingDay
    ? 1 + currentPlan.exercises.length + 1 : 0;
  idx = Math.max(0, Math.min(idx, totalCards - 1));
  currentIndex = idx;

  document.querySelectorAll('.card, .simple-card').forEach(el => {
    el.classList.toggle('active', Number(el.dataset.idx) === idx);
  });
  document.querySelectorAll('.progress-dot').forEach(el => {
    const i = Number(el.dataset.idx);
    el.classList.toggle('active', i === idx);
    el.classList.toggle('done', doneSet.has(i) && i !== idx);
  });
}

// ── 事件绑定 ─────────────────────────────────────────────
function attachEvents() {
  bindVideoState();

  // 设置按钮
  document.getElementById('btn-settings')?.addEventListener('click', renderSettings);

  // 换一组
  document.getElementById('btn-refresh')?.addEventListener('click', () => {
    planOffset++;
    doneSet.clear();
    currentIndex = 0;
    stopTimer();
    currentPlan = generatePlan(new Date(), planOffset);
    render();
  });

  // 热身/拉伸展开
  document.getElementById('warmup-toggle')?.addEventListener('click', () => {
    document.getElementById('warmup-body')?.classList.toggle('open');
  });
  document.getElementById('cooldown-toggle')?.addEventListener('click', () => {
    document.getElementById('cooldown-body')?.classList.toggle('open');
  });

  // 进度圆点
  document.querySelectorAll('.progress-dot').forEach(el => {
    el.addEventListener('click', () => showCard(Number(el.dataset.idx)));
  });

  // 完成按钮
  document.querySelectorAll('[data-complete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.complete);
      doneSet.add(idx);
      btn.textContent = '✓ 已完成';
      btn.classList.add('done');

      const totalCards = 1 + currentPlan.exercises.length + 1;
      document.querySelectorAll('.progress-dot').forEach(el => {
        if (Number(el.dataset.idx) === idx) el.classList.add('done');
      });

      // 自动跳下一张
      const next = idx + 1;
      if (next < totalCards) {
        setTimeout(() => showCard(next), 400);
      }

      // 全部完成
      if (doneSet.size === totalCards) {
        setTimeout(() => showCompleteOverlay(), 600);
        markComplete(new Date());
      }
    });
  });

  // 计时器按钮
  document.querySelectorAll('[data-timer]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx  = Number(btn.dataset.timer);
      const rest = Number(btn.dataset.rest);
      toggleTimer(idx, rest);
    });
  });

  // 重置按钮
  document.querySelectorAll('[data-reset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx  = Number(btn.dataset.reset);
      const rest = Number(btn.dataset.rest);
      resetTimer(idx, rest);
    });
  });

  // 滑动手势
  initSwipe();
}

function renderVideoSlot(slot, exerciseName) {
  const posterAttr = slot.fallbackImage ? ` poster="${slot.fallbackImage}"` : '';
  return `
    <div class="video-frame" data-video-frame="${slot.key}">
      <div class="video-skeleton">
        <div class="pulse"></div>
        <span>${slot.label} 加载中</span>
      </div>
      <video autoplay loop muted playsinline preload="metadata"${posterAttr} data-video>
        <source src="${slot.src}" type="video/mp4">
      </video>
      <div class="video-fallback">
        <div class="icon">⚠️</div>
        <div>${slot.label}视频加载失败</div>
        <div class="hint">请参考下方动作要领：${exerciseName}</div>
      </div>
    </div>`;
}

function bindVideoState() {
  document.querySelectorAll('[data-video-frame]').forEach(frame => {
    const video = frame.querySelector('video');
    if (!video) return;

    const markReady = () => {
      frame.classList.remove('error');
      frame.classList.add('ready');
    };
    const markError = () => {
      frame.classList.remove('ready');
      frame.classList.add('error');
    };

    video.addEventListener('loadeddata', markReady, { once: true });
    video.addEventListener('canplay', markReady, { once: true });
    video.addEventListener('error', markError, { once: true });

    const source = video.querySelector('source');
    if (!source?.src) markError();
  });
}

// ── 计时器 ───────────────────────────────────────────────
function toggleTimer(cardIdx, restSec) {
  if (timerCardIdx === cardIdx && timerRunning) {
    stopTimer();
  } else {
    if (timerCardIdx !== cardIdx) {
      stopTimer();
      timerSec     = restSec;
      timerCardIdx = cardIdx;
    }
    startTimer(cardIdx);
  }
  updateTimerUI(cardIdx);
}

function startTimer(cardIdx) {
  timerRunning = true;
  timerInterval = setInterval(() => {
    timerSec--;
    updateTimerUI(cardIdx);
    if (timerSec <= 0) {
      stopTimer();
      playBeep();
      updateTimerUI(cardIdx);
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
}

function resetTimer(cardIdx, restSec) {
  stopTimer();
  timerSec     = restSec;
  timerCardIdx = cardIdx;
  updateTimerUI(cardIdx);
}

function updateTimerUI(cardIdx) {
  const el  = document.getElementById(`timer-${cardIdx}`);
  const btn = document.querySelector(`[data-timer="${cardIdx}"]`);
  if (!el) return;

  const mm = String(Math.floor(timerSec / 60)).padStart(2, '0');
  const ss = String(timerSec % 60).padStart(2, '0');
  el.textContent = `${mm}:${ss}`;
  el.className   = `timer-display${timerRunning ? ' running' : timerSec === 0 ? ' done' : ''}`;

  if (btn) {
    btn.textContent = timerRunning ? '⏸ 暂停' : '▶ 开始';
    btn.className   = `timer-btn ${timerRunning ? 'pause' : 'start'}`;
  }
}

function playBeep() {
  try {
    const ctx  = new AudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {}
}

// ── 滑动手势 ─────────────────────────────────────────────
function initSwipe() {
  const container = document.querySelector('.cards-container');
  if (!container) return;
  let sx = 0, sy = 0;
  container.addEventListener('touchstart', e => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  }, { passive: true });
  container.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
      showCard(dx < 0 ? currentIndex + 1 : currentIndex - 1);
    }
  }, { passive: true });
}

// ── 完成弹窗 ─────────────────────────────────────────────
function showCompleteOverlay() {
  const streak = getStreak();
  const overlay = document.createElement('div');
  overlay.className = 'complete-overlay';
  overlay.innerHTML = `
    <div class="emoji">🏸</div>
    <h2>训练完成！</h2>
    <p>连续打卡 ${streak} 天，继续保持！</p>
    <button id="btn-close-overlay">关闭</button>`;
  document.body.appendChild(overlay);
  document.getElementById('btn-close-overlay').addEventListener('click', () => {
    overlay.remove();
  });
}

// ── 设置页 ───────────────────────────────────────────────
function renderSettings() {
  const app = document.getElementById('app');
  const data = loadData();
  const reminderTime = data.settings?.reminderTime || '08:00';

  app.innerHTML = `
    <div class="settings-page">
      <button class="back-btn" id="btn-back">← 返回训练</button>
      <h1>⚙️ 设置</h1>

      <div class="settings-section">
        <h2>提醒</h2>
        <div class="settings-row">
          <label>每日提醒时间</label>
          <input type="time" id="reminder-time" value="${reminderTime}">
        </div>
      </div>

      <div class="settings-section">
        <h2>训练记录</h2>
        <div class="calendar">
          <div id="cal-container">${renderCalendar()}</div>
        </div>
      </div>

      <div class="settings-section">
        <h2>关于</h2>
        <div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:4px">
          <label style="font-weight:600">羽毛球专项体能训练</label>
          <span style="font-size:13px;color:var(--text-secondary)">基于运动科学论文设计 · 每周四练</span>
        </div>
      </div>
    </div>`;

  document.getElementById('btn-back').addEventListener('click', () => render());
  document.getElementById('reminder-time').addEventListener('change', e => {
    const data = loadData();
    data.settings = data.settings || {};
    data.settings.reminderTime = e.target.value;
    saveData(data);
    scheduleReminder(e.target.value);
  });
}

// ── 打卡日历 ─────────────────────────────────────────────
let calYear, calMonth;
function renderCalendar() {
  const now = new Date();
  if (!calYear)  calYear  = now.getFullYear();
  if (!calMonth) calMonth = now.getMonth();

  const data = loadData();
  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const monthName   = new Date(calYear, calMonth).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });

  const dayLabels = ['日','一','二','三','四','五','六']
    .map(d => `<div class="cal-day-label">${d}</div>`).join('');

  const emptyCells = Array(firstDay).fill('<div></div>').join('');

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day  = i + 1;
    const d    = new Date(calYear, calMonth, day);
    const key  = dateKey(d);
    const dow  = d.getDay();
    const isTraining = [1,3,4,6].includes(dow);
    const isCompleted = data.history?.[key]?.completed;
    const isToday = d.toDateString() === now.toDateString();

    let cls = 'cal-day';
    if (isTraining)  cls += ' training';
    if (isCompleted) cls += ' completed';
    if (isToday)     cls += ' today';

    return `<div class="${cls}">${day}</div>`;
  }).join('');

  return `
    <div class="calendar-header">
      <button class="cal-nav" id="cal-prev">‹</button>
      <h3>${monthName}</h3>
      <button class="cal-nav" id="cal-next">›</button>
    </div>
    <div class="calendar-grid">
      ${dayLabels}${emptyCells}${days}
    </div>`;
}

// ── localStorage ─────────────────────────────────────────
function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { history: {}, settings: {} }; }
  catch { return { history: {}, settings: {} }; }
}
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function markComplete(date) {
  const data = loadData();
  data.history = data.history || {};
  data.history[dateKey(date)] = { completed: true, timestamp: Date.now() };
  saveData(data);
}
function isCompleted(date) {
  return loadData().history?.[dateKey(date)]?.completed || false;
}
function getStreak() {
  const training = [1,3,4,6];
  let streak = 0;
  const d = new Date();
  // 若今天是训练日且未完成，从昨天开始算
  if (!training.includes(d.getDay()) || !isCompleted(d)) d.setDate(d.getDate() - 1);
  for (let i = 0; i < 365; i++) {
    if (training.includes(d.getDay())) {
      if (isCompleted(d)) streak++;
      else break;
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// ── 通知提醒 ─────────────────────────────────────────────
function scheduleReminder(timeStr) {
  if (!('Notification' in window)) return;
  Notification.requestPermission().then(perm => {
    if (perm !== 'granted') return;
    const [h, m] = timeStr.split(':').map(Number);
    const now  = new Date();
    const next = new Date();
    next.setHours(h, m, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    const delay = next - now;
    setTimeout(() => {
      new Notification('🏸 该训练了！', {
        body: '今天的羽毛球体能训练计划已准备好',
        icon: '/icons/icon-192.png',
      });
    }, delay);
  });
}
