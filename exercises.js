import { EXERCISES_MW, WARMUP_MW, COOLDOWN_MW } from './data/exercises.mw.js';

export const MODULES = {
  core: { name: '核心旋转力量', icon: '🎯', color: '#f59e0b' },
  legs: { name: '下肢单侧爆发', icon: '🦵', color: '#3b82f6' },
  agility: { name: '多方向敏捷', icon: '⚡', color: '#8b5cf6' },
  cardio: { name: '体能耐力', icon: '❤️', color: '#ef4444' },
  upper: { name: '肩臂专项', icon: '💪', color: '#06b6d4' },
};

// 使用离线同步生成的动作库，避免运行时消耗 API 配额。
export const EXERCISES = EXERCISES_MW;
export const WARMUP_STEPS = WARMUP_MW;
export const COOLDOWN_STEPS = COOLDOWN_MW;

export const WARMUP = {
  name: '动态热身',
  duration: 6,
  steps: [
    { name: '慢跑/原地高抬腿', duration: '60秒' },
    { name: '肩部大绕环', duration: '30秒（前后各15秒）' },
    { name: '髋关节绕环', duration: '30秒/侧' },
    { name: '动态弓步+转体', duration: '60秒（交替）' },
    { name: '手腕脚踝转动', duration: '30秒' },
    { name: '挥拍模拟动作', duration: '30秒' },
  ],
};

export const COOLDOWN = {
  name: '静态拉伸',
  duration: 6,
  steps: [
    { name: '大腿前侧拉伸', duration: '30秒/侧' },
    { name: '大腿后侧拉伸', duration: '30秒/侧' },
    { name: '小腿拉伸', duration: '20秒/侧' },
    { name: '肩部横向拉伸', duration: '20秒/侧' },
    { name: '髋屈肌拉伸', duration: '30秒/侧' },
    { name: '手腕屈伸拉伸', duration: '20秒/侧' },
  ],
};

// 训练日安排：星期几 → 模块组合（0=周日, 1=周一...）
export const WEEKLY_SCHEDULE = {
  1: { modules: ['core', 'legs'], theme: '核心 + 下肢爆发' },
  3: { modules: ['agility', 'cardio'], theme: '敏捷 + 体能' },
  4: { modules: ['legs', 'upper'], theme: '下肢 + 肩臂' },
  6: { modules: ['core', 'agility', 'cardio'], theme: '综合训练' },
};
