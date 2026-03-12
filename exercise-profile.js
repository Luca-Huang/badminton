const HIP_KEYWORDS = ['deadlift', 'romanian'];
const HIGH_IAP_IDS = new Set(['barbell-squat', 'pull-ups', 'kettlebell-swing', 'burpee']);
const HIGH_IMPACT_IDS = new Set([
  'depth-jump',
  'box-jump',
  'bodyweight-lateral-lunge-jump',
  'bodyweight-alternating-jump-lunge',
  'jump-rope',
]);
const LOW_IMPACT_IDS = new Set([
  'cardio-lateral-shuffle',
  'cardio-assault-bike',
  'plow-back-rowing-preps',
  'mountain-climber',
]);

export const ROLE_LABELS = {
  knee: '膝主导',
  hip: '髋主导/后链',
  upper: '上肢/肩胛',
  core: '核心稳定',
  agility: '步法/敏捷',
};

export function getRole(ex) {
  if (ex.module === 'core') return 'core';
  if (ex.module === 'upper') return 'upper';
  if (ex.module === 'legs') {
    const id = ex.id || '';
    return HIP_KEYWORDS.some(k => id.includes(k)) ? 'hip' : 'knee';
  }
  return 'agility';
}

export function getSafetyTags(ex) {
  const id = ex.id || '';
  const tags = [];
  if (HIGH_IAP_IDS.has(id)) tags.push('highIap');
  if (HIGH_IMPACT_IDS.has(id)) tags.push('highImpact');
  if (LOW_IMPACT_IDS.has(id)) tags.push('lowImpact');
  return tags;
}

export function buildSelectionReason(ex, role, tags, profile) {
  const base = {
    knee: '单腿与膝对齐控制，降低关节剪切压力',
    hip: '后链发力与制动能力，帮助稳定膝关节',
    upper: '肩胛稳定与肩袖控制，降低膝负担',
    core: '抗旋/抗伸稳定，减少腰代偿',
    agility: '神经肌肉控制与步法协调',
  }[role] || '专项能力补足';

  const lowImpact = tags.includes('lowImpact') ? '低冲击更安全。' : '';
  const breathing = profile?.avoidHighIap ? '全程顺畅呼吸，避免憋气发力。' : '';
  return `${base}${lowImpact ? ` ${lowImpact}` : ''}${breathing ? ` ${breathing}` : ''}`.trim();
}
