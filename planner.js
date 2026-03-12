import { EXERCISES, WEEKLY_SCHEDULE, WARMUP, COOLDOWN, WARMUP_STEPS, COOLDOWN_STEPS } from './exercises.js';
import { getRole, getSafetyTags, buildSelectionReason, ROLE_LABELS } from './exercise-profile.js';

const TRAINING_PROFILE = {
  avoidHighIap: true,
  avoidHighImpact: true,
};

const ROLE_ORDER = ['knee', 'hip', 'upper', 'core', 'agility'];

// 基于日期的确定性随机数（同一天刷新结果不变）
function seededRandom(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function dateSeed(date) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

function getWeekNumber(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.floor((date - start) / (7 * 24 * 60 * 60 * 1000));
}

function getWeekPhase(date) {
  const weekNum = getWeekNumber(date);
  return weekNum % 4; // 0 base, 1-2 build, 3 deload
}

function applyProgression(exercise, role, phase) {
  const next = { ...exercise };
  if (role === 'knee' || role === 'hip' || role === 'upper') {
    if (phase === 1 || phase === 2) next.sets = exercise.sets + 1;
    if (phase === 3) next.sets = Math.max(2, exercise.sets - 1);
  }
  return next;
}

function filterByProfile(list, profile) {
  const filtered = list.filter(ex => {
    const tags = getSafetyTags(ex);
    if (profile?.avoidHighIap && tags.includes('highIap')) return false;
    if (profile?.avoidHighImpact && tags.includes('highImpact')) return false;
    return true;
  });
  return filtered.length > 0 ? filtered : list;
}

function getRolePool(role, list) {
  switch (role) {
    case 'knee':
      return list.filter(ex => ex.module === 'legs' && getRole(ex) === 'knee');
    case 'hip':
      return list.filter(ex => ex.module === 'legs' && getRole(ex) === 'hip');
    case 'upper':
      return list.filter(ex => ex.module === 'upper');
    case 'core':
      return list.filter(ex => ex.module === 'core');
    case 'agility':
      return list.filter(ex => ex.module === 'agility' || ex.module === 'cardio');
    default:
      return list;
  }
}

function focusFromRole(role) {
  if (role === 'knee' || role === 'hip') return 'legs';
  if (role === 'core') return 'core';
  if (role === 'upper') return 'upper';
  return 'agility';
}

function buildFocusSteps(exercises) {
  const focuses = exercises.map(ex => focusFromRole(ex.role));
  const unique = focuses.filter((item, idx) => focuses.indexOf(item) === idx);
  if (unique.length === 1) return [unique[0], unique[0], unique[0]];
  if (unique.length === 2) return [unique[0], unique[0], unique[1]];
  return unique.slice(0, 3);
}

function pickSteps(pool, focusList, seed) {
  const result = [];
  const used = new Set();
  const byFocus = focus => pool.filter(step => step.focus === focus);

  focusList.forEach((focus, i) => {
    const list = byFocus(focus);
    if (list.length === 0) return;
    let idx = Math.floor(seededRandom(seed + i * 13) * list.length);
    let attempts = 0;
    while (used.has(list[idx].id) && attempts < list.length) {
      idx = (idx + 1) % list.length;
      attempts++;
    }
    if (!used.has(list[idx].id)) {
      result.push(list[idx]);
      used.add(list[idx].id);
    }
  });

  const general = byFocus('general');
  if (general.length > 0) {
    let idx = Math.floor(seededRandom(seed + 77) * general.length);
    let attempts = 0;
    while (used.has(general[idx].id) && attempts < general.length) {
      idx = (idx + 1) % general.length;
      attempts++;
    }
    if (!used.has(general[idx].id)) {
      result.push(general[idx]);
      used.add(general[idx].id);
    }
  }

  while (result.length < 4 && pool.length > 0) {
    const idx = Math.floor(seededRandom(seed + result.length * 17) * pool.length);
    const fallback = pool[idx];
    if (!used.has(fallback.id)) {
      result.push(fallback);
      used.add(fallback.id);
    }
  }

  return result.slice(0, 4);
}

/**
 * 生成指定日期的训练计划
 * @param {Date} date
 * @param {number} offset - 换一组时的偏移量，默认 0
 */
export function generatePlan(date, offset = 0) {
  const dayOfWeek = date.getDay();
  const schedule = WEEKLY_SCHEDULE[dayOfWeek];

  if (!schedule) {
    return {
      isTrainingDay: false,
      date,
      nextTrainingDay: findNextTrainingDay(date),
    };
  }

  const weekNum = getWeekNumber(date);
  const phase = getWeekPhase(date);
  const seed = dateSeed(date) + offset * 100;
  const pickedExercises = [];
  const all = Object.values(EXERCISES).flat();
  const safeAll = filterByProfile(all, TRAINING_PROFILE);

  ROLE_ORDER.forEach((role, i) => {
    const safePool = getRolePool(role, safeAll);
    const fallbackPool = getRolePool(role, all);
    const pool = safePool.length > 0 ? safePool : fallbackPool;
    pickedExercises.push(...pickExercises(pool, 1, weekNum, seed + i, pickedExercises));
  });

  const finalizedExercises = pickedExercises.map(ex => {
    const role = getRole(ex);
    const tags = getSafetyTags(ex);
    const tuned = applyProgression(ex, role, phase);
    return {
      ...tuned,
      role,
      roleLabel: ROLE_LABELS[role],
      selectionReason: buildSelectionReason(ex, role, tags, TRAINING_PROFILE),
    };
  });

  const focusSteps = buildFocusSteps(finalizedExercises);
  const warmupSteps = pickSteps(WARMUP_STEPS, focusSteps, seed + 200);
  const cooldownSteps = pickSteps(COOLDOWN_STEPS, focusSteps, seed + 300);
  const warmup = { ...WARMUP, steps: warmupSteps };
  const cooldown = { ...COOLDOWN, steps: cooldownSteps };
  const mainMin = finalizedExercises.reduce((sum, ex) => sum + estimateExerciseDuration(ex), 0);
  const transitionMin = 4;
  const estimatedTotalMinutes = WARMUP.duration + mainMin + COOLDOWN.duration + transitionMin;

  return {
    isTrainingDay: true,
    theme: schedule.theme,
    modules: schedule.modules,
    warmup,
    exercises: finalizedExercises,
    cooldown,
    estimatedTotalMinutes,
    date,
  };
}

function pickExercises(pool, count, weekNum, seed, already = []) {
  const result = [];
  const usedIds = new Set(already.map(e => e.id));
  const poolSize = pool.length;

  for (let i = 0; i < count; i++) {
    let idx = Math.floor(seededRandom(seed + i + weekNum * 37) * poolSize);
    // 避免重复
    let attempts = 0;
    while (usedIds.has(pool[idx].id) && attempts < poolSize) {
      idx = (idx + 1) % poolSize;
      attempts++;
    }
    result.push(pool[idx]);
    usedIds.add(pool[idx].id);
  }
  return result;
}

function findNextTrainingDay(date) {
  const trainingDays = Object.keys(WEEKLY_SCHEDULE).map(Number);
  const d = new Date(date);
  for (let i = 1; i <= 7; i++) {
    d.setDate(d.getDate() + 1);
    if (trainingDays.includes(d.getDay())) return new Date(d);
  }
  return null;
}

export function formatDate(date) {
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${m}月${d}日 ${weekDays[date.getDay()]}`;
}

/** 估算单个动作的训练时长（分钟） */
export function estimateExerciseDuration(exercise) {
  const { sets, rest } = exercise;
  const setTime = 70; // 每组约 70 秒（含动作与小幅调整）
  const restTime = rest || 60;
  return Math.round((sets * setTime + (sets - 1) * restTime) / 60);
}
