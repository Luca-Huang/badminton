const TIP_FALLBACK = {
  core: [
    '动作全程收紧核心，避免塌腰和耸肩',
    '发力时呼气，还原时吸气，保持节奏稳定',
    '每次重复都要可控，不要借力摆动',
  ],
  legs: [
    '膝盖方向与脚尖一致，重心保持稳定',
    '下放控制速度，起身时主动蹬地发力',
    '保持躯干中立，避免塌腰或弓背',
  ],
  agility: [
    '落地先稳再起动，减少关节冲击',
    '保持前脚掌轻快触地，提高步频效率',
    '动作质量优先，不盲目追求速度',
  ],
  cardio: [
    '保持呼吸节奏，避免憋气导致过早疲劳',
    '冲刺阶段保证动作幅度，恢复阶段主动放松',
    '根据体能调整节奏，保持稳定输出',
  ],
  upper: [
    '肩胛先稳定再发力，避免耸肩代偿',
    '保持肘腕轨迹自然，动作全程可控',
    '重量选择以标准动作为前提，不追求硬拉次数',
  ],
  generic: [
    '保持动作标准，优先控制再追求速度',
    '注意呼吸节奏，发力时呼气',
    '全程避免借力和明显代偿',
  ],
};

const MISTAKE_FALLBACK = {
  core: ['避免塌腰或耸肩导致核心失稳', '不要靠惯性摆动完成动作'],
  legs: ['避免膝盖内扣或重心过度前移', '不要用腰背代偿下肢发力'],
  agility: ['避免落地不稳就急于下一次起跳', '不要触地过久导致节奏变慢'],
  cardio: ['避免一开始冲太快导致后程掉速', '不要动作变形仍强行提速'],
  upper: ['避免耸肩、耸颈等上斜方代偿', '不要使用超出控制能力的重量'],
  generic: ['避免动作代偿和节奏失控', '动作质量下降时及时降强度'],
};

function containsLikelyEnglish(text) {
  return /[A-Za-z]{2,}/.test(text || '');
}

function sanitizeList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(item => String(item || '').trim()).filter(Boolean);
}

function fallbackFor(module, map) {
  return map[module] || map.generic;
}

export function normalizeExerciseText(exercise) {
  const module = exercise?.module || 'generic';
  const rawTips = sanitizeList(exercise?.tips);
  const rawMistakes = sanitizeList(exercise?.mistakes);

  const tipsNeedFallback =
    rawTips.length < 2 || rawTips.some(containsLikelyEnglish);
  const mistakesNeedFallback =
    rawMistakes.length < 1 || rawMistakes.some(containsLikelyEnglish);

  return {
    tips: tipsNeedFallback ? fallbackFor(module, TIP_FALLBACK) : rawTips,
    mistakes: mistakesNeedFallback
      ? fallbackFor(module, MISTAKE_FALLBACK)
      : rawMistakes,
  };
}
