import { EXERCISES, WEEKLY_SCHEDULE, WARMUP, COOLDOWN } from './exercises.js';

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
  const seed = dateSeed(date) + offset * 100;
  const pickedExercises = [];

  if (schedule.modules.length >= 3) {
    // 综合日：每个模块选 1 个，共 3 个
    schedule.modules.forEach((mod, i) => {
      const pool = EXERCISES[mod];
      pickedExercises.push(...pickExercises(pool, 1, weekNum, seed + i, pickedExercises));
    });
  } else {
    // 普通训练日（2个模块）：第一个模块选 2 个，第二个选 1 个
    const counts = [2, 1];
    schedule.modules.forEach((mod, i) => {
      const pool = EXERCISES[mod];
      pickedExercises.push(...pickExercises(pool, counts[i], weekNum, seed + i, pickedExercises));
    });
  }

  return {
    isTrainingDay: true,
    theme: schedule.theme,
    modules: schedule.modules,
    warmup: WARMUP,
    exercises: pickedExercises,
    cooldown: COOLDOWN,
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
  const setTime = 60; // 每组约 60 秒
  const restTime = rest || 60;
  return Math.round((sets * setTime + (sets - 1) * restTime) / 60);
}
