import fs from 'node:fs';

const raw = fs.readFileSync('data/exercises.mw.json', 'utf8');
const payload = JSON.parse(raw);

const allVideos = {};
for (const mod of Object.values(payload.modules)) {
  for (const ex of mod) {
    allVideos[ex.source.name] = { side: ex.videoSide, front: ex.videoFront };
  }
}
for (const step of payload.warmup) allVideos[step.source.name] = { side: step.videoSide, front: step.videoFront };
for (const step of payload.cooldown) allVideos[step.source.name] = { side: step.videoSide, front: step.videoFront };

function getVid(name) {
  return allVideos[name] || { side: '', front: '' };
}

const badmintonWarmup = [
  {
    id: 'high-knees', stepType: 'warmup', focus: 'general', name: '原地高抬腿', duration: '40秒',
    tips: ['上体挺直，目视前方', '大腿交替高抬，尽量与地面平行'], mistakes: ['弯腰驼背', '脚跟重重落地'],
    videoSide: 'https://blog.ohiohealth.com/wp-content/uploads/2019/05/Outdoor-Workout-Intermediate-High-Knees.mp4',
    videoFront: 'https://blog.ohiohealth.com/wp-content/uploads/2019/05/Outdoor-Workout-Intermediate-High-Knees.mp4',
    source: { name: 'High Knees' }
  },
  {
    id: 'arm-circles', stepType: 'warmup', focus: 'upper', name: '肩部大绕环', duration: '40秒',
    tips: ['双臂伸直，以肩关节为轴', '前后交替划大圆'], mistakes: ['耸肩', '速度过快导致拉伤'],
    videoSide: 'https://azopt.net/wp-content/uploads/2022/04/Arm-Circles.mp4',
    videoFront: 'https://azopt.net/wp-content/uploads/2022/04/Arm-Circles.mp4',
    source: { name: 'Arm Circles' }
  },
  {
    id: 'leg-swings', stepType: 'warmup', focus: 'legs', name: '站姿腿部前后摆动', duration: '30秒/侧',
    tips: ['单手扶墙保持平衡，支撑腿微屈保护半月板', '前后摆动另一条腿，感受髋关节和大腿后侧的舒展'], mistakes: ['骨盆跟着前后翻转', '动作完全失控'],
    videoSide: 'https://video.wixstatic.com/video/2d30c3_0482cf2d55984b27b82e483c309c7e20/1080p/mp4/file.mp4',
    videoFront: 'https://video.wixstatic.com/video/2d30c3_0482cf2d55984b27b82e483c309c7e20/1080p/mp4/file.mp4',
    source: { name: 'Leg Swings' }
  },
  {
    id: 'clock-taps', stepType: 'warmup', focus: 'legs', name: '单腿钟面触地 (半月板特供)', duration: '40秒/侧',
    tips: ['单腿站立，支撑腿膝盖微微弯曲（极佳的膝关节稳定训练）', '另一只脚分别向正前、侧面、正后方轻触地面，核心全程收紧'], mistakes: ['支撑腿膝盖内扣', '重心不稳晃动过大'],
    videoSide: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6489397/bin/pone.0215572.s001.mp4',
    videoFront: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6489397/bin/pone.0215572.s001.mp4',
    source: { name: 'Single Leg Clock Taps' }
  },
  {
    id: 'worlds-greatest-stretch', stepType: 'warmup', focus: 'core', name: '世界上最伟大的拉伸', duration: '40秒/侧',
    tips: ['深蹲弓步，同侧肘触地', '躯干向出腿侧旋转指天，最后拉伸大腿后侧'], mistakes: ['动作过快没拉开', '后背过度弯曲'],
    videoSide: getVid('Bodyweight Thoracic Spine Rotation').side,
    videoFront: getVid('Bodyweight Thoracic Spine Rotation').front,
    source: { name: 'Worlds Greatest Stretch' }
  },
  {
    id: 'cable-wood-chop', stepType: 'warmup', focus: 'upper', name: '挥拍发力模拟', duration: '40秒/侧',
    tips: ['模拟杀球/高远球发力链', '利用核心转动带动上肢'], mistakes: ['仅用手臂发力', '核心未收紧'],
    videoSide: getVid('Cable Wood Chopper').side,
    videoFront: getVid('Cable Wood Chopper').front,
    source: { name: 'Cable Wood Chop' }
  },
  {
    id: 'lateral-shuffle', stepType: 'warmup', focus: 'agility', name: '交叉防守滑步', duration: '40秒',
    tips: ['保持低重心，膝盖微屈', '向侧方滑步，脚不交叉'], mistakes: ['重心起伏过大', '脚尖向外撇'],
    videoSide: getVid('Cardio Lateral Shuffle').side,
    videoFront: getVid('Cardio Lateral Shuffle').front,
    source: { name: 'Lateral Shuffle' }
  }
];

const badmintonCooldown = [
  {
    id: 'calf-stretch', stepType: 'cooldown', focus: 'legs', name: '小腿静态拉伸', duration: '30秒',
    tips: ['后腿伸直，脚跟踩实地面', '身体重心前移感受拉伸'], mistakes: ['后脚跟抬起', '脚尖未朝前'],
    videoSide: getVid('Calf Stretch On Box Bilateral').side,
    videoFront: getVid('Calf Stretch On Box Bilateral').front,
    source: { name: 'Calf Stretch On Box Bilateral' }
  },
  {
    id: 'soleus-stretch', stepType: 'cooldown', focus: 'legs', name: '跟腱与比目鱼肌放松', duration: '30秒/侧',
    tips: ['微屈后侧膝盖，脚跟踩实', '感受跟腱和脚踝上方的拉伸'], mistakes: ['后腿完全伸直', '脚跟离地'],
    videoSide: getVid('Gastrocnemius Stretch Unilateral On Wall').side,
    videoFront: getVid('Gastrocnemius Stretch Unilateral On Wall').front,
    source: { name: 'Soleus Stretch' }
  },
  {
    id: 'hamstring-stretch', stepType: 'cooldown', focus: 'legs', name: '大腿后侧拉伸', duration: '30秒/侧',
    tips: ['保持拉伸腿伸直', '用手或毛巾辅助拉向躯干'], mistakes: ['骨盆离开垫子', '过度拉扯引起疼痛'],
    videoSide: getVid('Hamstring Stretch Supine Static').side,
    videoFront: getVid('Hamstring Stretch Supine Static').front,
    source: { name: 'Hamstring Stretch Supine Static' }
  },
  {
    id: 'wrist-stretch', stepType: 'cooldown', focus: 'upper', name: '手腕及前臂舒缓', duration: '30秒/侧',
    tips: ['手臂向前伸直', '用另一只手轻压手背或手心'], mistakes: ['肩部未放松', '用力过猛'],
    videoSide: getVid('Band Face Pull').side,
    videoFront: getVid('Band Face Pull').front,
    source: { name: 'Wrist Flexor Stretch' }
  },
  {
    id: 'chest-stretch', stepType: 'cooldown', focus: 'upper', name: '肩胸前侧放松', duration: '30秒/侧',
    tips: ['利用墙面或门框固定单手', '身体向反方向缓慢扭转'], mistakes: ['肩关节过度顶出', '过度牵拉导致刺痛'],
    videoSide: getVid('Chest Stretch Variation Two').side,
    videoFront: getVid('Chest Stretch Variation Two').front,
    source: { name: 'Chest Stretch Variation Two' }
  }
];

payload.badmintonWarmup = badmintonWarmup;
payload.badmintonCooldown = badmintonCooldown;

fs.writeFileSync('data/exercises.mw.json', JSON.stringify(payload, null, 2) + '\n', 'utf8');

const jsModule = '// Auto-generated (Fallback With Real Video Links)\n' +
  'export const EXERCISES_MW = ' + JSON.stringify(payload.modules, null, 2) + ';\n' +
  'export const WARMUP_MW = ' + JSON.stringify(payload.warmup, null, 2) + ';\n' +
  'export const COOLDOWN_MW = ' + JSON.stringify(payload.cooldown, null, 2) + ';\n' +
  'export const BADMINTON_WARMUP_MW = ' + JSON.stringify(badmintonWarmup, null, 2) + ';\n' +
  'export const BADMINTON_COOLDOWN_MW = ' + JSON.stringify(badmintonCooldown, null, 2) + ';\n';
  
fs.writeFileSync('data/exercises.mw.js', jsModule, 'utf8');
console.log('Fixed data with real videos!');
