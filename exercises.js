const MW = 'https://media.musclewiki.com/media/uploads/videos/branded';

export const MODULES = {
  core:    { name: '核心旋转力量', icon: '🎯', color: '#f59e0b' },
  legs:    { name: '下肢单侧爆发', icon: '🦵', color: '#3b82f6' },
  agility: { name: '多方向敏捷',   icon: '⚡', color: '#8b5cf6' },
  cardio:  { name: '体能耐力',     icon: '❤️', color: '#ef4444' },
  upper:   { name: '肩臂专项',     icon: '💪', color: '#06b6d4' },
};

export const EXERCISES = {
  core: [
    {
      id: 'side-plank',
      name: '侧平板支撑',
      why: '击球时躯干抗侧屈稳定，提升杀球稳定性',
      sets: 2, reps: '45秒/侧', rest: 30,
      tips: ['肘关节在肩正下方', '身体成一条直线，髋部不下沉', '收紧腹部和臀部'],
      mistakes: ['髋部下沉或翘起', '头部下垂'],
      videoSide: `${MW}/male-Bodyweight-side-plank-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-side-plank-front.mp4`,
    },
    {
      id: 'hanging-leg-raise',
      name: '悬挂举腿',
      why: '核心整体收缩力量，杀球鞭打发力基础',
      sets: 3, reps: '10次', rest: 60,
      tips: ['悬挂于单杠，身体稳定不晃', '靠腹肌发力抬腿至90度', '下放时控制速度'],
      mistakes: ['靠摆动借力', '只抬到一半'],
      videoSide: `${MW}/male-Bodyweight-hanging-leg-raise-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-hanging-leg-raise-front.mp4`,
    },
  ],

  legs: [
    {
      id: 'bulgarian-split-squat',
      name: '保加利亚分腿蹲',
      why: '模拟弓步接球的单腿发力模式，直接提升场上弓步力量',
      sets: 3, reps: '8次/腿', rest: 90,
      tips: ['后脚放在凳子上', '前腿膝盖不超过脚尖太多', '躯干保持直立，核心收紧'],
      mistakes: ['重心太前导致膝盖压力大', '后脚承重太多'],
      videoSide: `${MW}/male-Dumbbell-dumbbell-bulgarian-split-squat-side.mp4`,
      videoFront: `${MW}/male-Dumbbell-dumbbell-bulgarian-split-squat-front.mp4`,
    },
    {
      id: 'barbell-squat',
      name: '杠铃深蹲',
      why: '整体下肢力量基础，为起跳杀球提供爆发力储备',
      sets: 4, reps: '8次', rest: 120,
      tips: ['双脚与肩同宽，脚尖略外展', '杠铃置于斜方肌上', '蹲至大腿平行或略低'],
      mistakes: ['膝盖内扣', '起身时弓背', '重心前移到脚尖'],
      videoSide: `${MW}/male-Barbell-barbell-squat-side.mp4`,
      videoFront: `${MW}/male-Barbell-barbell-squat-front.mp4`,
    },
  ],

  agility: [
    {
      id: 'lateral-bound',
      name: '侧向跳',
      why: '防守接杀时的横向蹬地爆发，提升横向移动速度',
      sets: 3, reps: '8次/侧', rest: 60,
      tips: ['单脚起跳，向侧方跳出', '对侧脚落地，保持平衡1秒', '落地时膝盖微屈缓冲'],
      mistakes: ['落地不稳就急着跳回', '上半身前倾太多'],
      videoSide: `${MW}/male-Bodyweight-lateral-bound-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-lateral-bound-front.mp4`,
    },
    {
      id: 'depth-jump',
      name: '反应性着地跳',
      why: '空中姿态控制和落地缓冲能力，减少落地受伤风险',
      sets: 3, reps: '6次', rest: 90,
      tips: ['从低台阶走下（非跳下）', '落地瞬间立即起跳', '追求最短触地时间'],
      mistakes: ['台阶太高', '落地后蹲太深才起跳'],
      videoSide: `${MW}/male-Bodyweight-depth-jump-to-box-jump-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-depth-jump-to-box-jump-front.mp4`,
    },
  ],

  cardio: [
    {
      id: 'kettlebell-swing',
      name: '壶铃摆荡',
      why: '髋关节爆发力结合心肺耐力，直接强化杀球髋部发力',
      sets: 4, reps: '15次', rest: 60,
      tips: ['髋部铰链动作，不是深蹲', '手臂只是挂钩，力量来自臀部', '顶端夹紧臀部'],
      mistakes: ['用手臂举壶铃', '腰部过度后仰'],
      videoSide: `${MW}/male-Kettlebell-kettlebell-swing-side.mp4`,
      videoFront: `${MW}/male-Kettlebell-kettlebell-swing-front.mp4`,
    },
    {
      id: 'burpee',
      name: '波比跳',
      why: '全身爆发结合心肺极限，模拟比赛高强度间歇节奏',
      sets: 3, reps: '10次', rest: 90,
      tips: ['下蹲→后跳→俯卧撑→收腿→跳起', '每个动作做完整', '跳起时手过头顶'],
      mistakes: ['省略俯卧撑', '跳起高度不够'],
      videoSide: `${MW}/male-Bodyweight-burpee-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-burpee-front.mp4`,
    },
  ],

  upper: [
    {
      id: 'face-pull',
      name: '面拉',
      why: '肩袖保护，预防羽毛球肩伤，维持肩关节长期健康',
      sets: 3, reps: '15次', rest: 45,
      tips: ['绳索调到面部高度', '双手拉向脸两侧，外旋', '顶峰收缩2秒'],
      mistakes: ['重量太大借力', '没有外旋'],
      videoSide: `${MW}/male-Cable-cable-face-pull-side.mp4`,
      videoFront: `${MW}/male-Cable-cable-face-pull-front.mp4`,
    },
    {
      id: 'pull-up',
      name: '引体向上',
      why: '拉系整体力量，强化挥拍加速所需的背部和手臂力量',
      sets: 3, reps: '力竭', rest: 90,
      tips: ['正握略宽于肩', '从死悬挂开始拉', '下巴过杆后控制下放'],
      mistakes: ['半程动作', '身体摆荡借力'],
      videoSide: `${MW}/male-Bodyweight-pull-up-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-pull-up-front.mp4`,
    },
  ],
};

export const WARMUP = {
  name: '动态热身',
  duration: 5,
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
  duration: 5,
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
  1: { modules: ['core', 'legs'],          theme: '核心 + 下肢爆发' },
  3: { modules: ['agility', 'cardio'],     theme: '敏捷 + 体能' },
  4: { modules: ['legs', 'upper'],         theme: '下肢 + 肩臂' },
  6: { modules: ['core', 'agility', 'cardio'], theme: '综合训练' },
};
