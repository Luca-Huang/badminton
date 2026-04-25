# 羽毛球专项体能训练 PWA 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个移动端优先的 PWA，为羽毛球爱好者生成每日专项体能训练计划，配有 MuscleWiki 循环视频演示。

**Architecture:** 纯前端 PWA，无构建工具，ES Modules 组织代码。exercises.js 存放动作数据库，app.js 负责计划生成/UI渲染/计时器/进度追踪。部署到 GitHub Pages。

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES Modules), Service Worker, localStorage

---

## Task 1: 项目初始化

**Files:**
- Create: `.gitignore`
- Create: `index.html` (骨架)
- Create: `style.css` (设计系统基础)

**Step 1: 初始化 git 仓库**

```bash
cd ~/OneDrive/桌面/yumaoqiu
git init
```

**Step 2: 创建 .gitignore**

```
.DS_Store
Thumbs.db
*.swp
node_modules/
```

**Step 3: 创建 index.html 骨架**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="theme-color" content="#059669">
  <title>羽毛球体能训练</title>
  <link rel="stylesheet" href="style.css">
  <link rel="manifest" href="manifest.json">
  <link rel="apple-touch-icon" href="icons/icon-192.png">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="app.js"></script>
</body>
</html>
```

**Step 4: 创建 style.css 设计系统**

```css
:root {
  --primary: #059669;
  --primary-light: #d1fae5;
  --bg: #111827;
  --bg-card: #1f2937;
  --text: #f9fafb;
  --text-secondary: #9ca3af;
  --danger: #ef4444;
  --success: #10b981;
  --warning: #f59e0b;
  --radius: 16px;
  --safe-top: env(safe-area-inset-top);
  --safe-bottom: env(safe-area-inset-bottom);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100dvh;
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
  -webkit-font-smoothing: antialiased;
}

#app {
  max-width: 430px;
  margin: 0 auto;
  padding: 16px;
  padding-bottom: calc(16px + var(--safe-bottom));
}
```

**Step 5: 验证**

用浏览器打开 index.html，确认深色背景显示正常。

**Step 6: 提交**

```bash
git add .gitignore index.html style.css
git commit -m "chore: initialize project with HTML skeleton and CSS design system"
```

---

## Task 2: 创建动作数据库

**Files:**
- Create: `exercises.js`

**Step 1: 创建 exercises.js，定义数据结构和全部动作**

每个动作包含：id, name（中文）, module（所属模块）, why（羽毛球关联）, sets, reps, rest（秒）, tips（要领数组）, mistakes（常见错误数组）, videoSide/videoFront（MuscleWiki MP4 URL，无视频则为 null）。

```javascript
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
      id: 'med-ball-side-throw',
      name: '药球侧抛',
      why: '模拟杀球旋转发力链',
      sets: 3, reps: '10次/侧', rest: 60,
      tips: ['双脚与肩同宽，侧对墙壁', '旋转发力从髋部发起，不是手臂', '球出手瞬间核心收紧爆发'],
      mistakes: ['只用手臂甩，没有转髋', '脚步没有固定，身体晃动'],
      videoSide: `${MW}/male-Bodyweight-medicine-ball-rotational-throw-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-medicine-ball-rotational-throw-front.mp4`,
    },
    {
      id: 'side-plank',
      name: '侧平板支撑',
      why: '击球时躯干抗侧屈稳定',
      sets: 2, reps: '45秒/侧', rest: 30,
      tips: ['肘关节在肩正下方', '身体成一条直线，髋部不下沉', '收紧腹部和臀部'],
      mistakes: ['髋部下沉或翘起', '头部下垂'],
      videoSide: `${MW}/male-Bodyweight-side-plank-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-side-plank-front.mp4`,
    },
    {
      id: 'superman',
      name: '超人式',
      why: '后场起跳后仰时的背部支撑力',
      sets: 3, reps: '12次', rest: 45,
      tips: ['俯卧，同时抬起双臂和双腿', '顶端保持1-2秒', '不要过度后仰颈椎'],
      mistakes: ['靠惯性甩起来，没有控制', '憋气'],
      videoSide: `${MW}/male-Bodyweight-superman-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-superman-front.mp4`,
    },
    {
      id: 'clamshell',
      name: '蚌式开合',
      why: '弓步时髋关节稳定，防膝盖内扣',
      sets: 3, reps: '15次/侧', rest: 30,
      tips: ['侧卧，双膝弯曲90度', '脚跟并拢，膝盖向上打开', '可用弹力带增加阻力'],
      mistakes: ['骨盆跟着转动', '打开幅度不够'],
      videoSide: `${MW}/male-Bodyweight-side-lying-clam-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-side-lying-clam-front.mp4`,
    },
    {
      id: 'hanging-leg-raise',
      name: '悬挂举腿',
      why: '核心整体收缩力量，杀球鞭打发力',
      sets: 3, reps: '10次', rest: 60,
      tips: ['悬挂于单杠，身体稳定不晃', '靠腹肌发力抬腿至90度', '下放时控制速度'],
      mistakes: ['靠摆动借力', '只抬到一半'],
      videoSide: `${MW}/male-Bodyweight-hanging-leg-raise-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-hanging-leg-raise-front.mp4`,
    },
    {
      id: 'plank-rotation',
      name: '平板支撑转体',
      why: '动态核心稳定 + 旋转控制',
      sets: 3, reps: '10次/侧', rest: 45,
      tips: ['从标准平板开始', '一手撑地，另一手向天花板伸展', '转体时保持髋部稳定'],
      mistakes: ['髋部跟着大幅扭转', '支撑手肘超伸'],
      videoSide: `${MW}/male-Bodyweight-plank-rotation-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-plank-rotation-front.mp4`,
    },
  ],

  legs: [
    {
      id: 'bulgarian-split-squat',
      name: '保加利亚分腿蹲',
      why: '模拟弓步接球的单腿发力模式',
      sets: 3, reps: '8次/腿', rest: 90,
      tips: ['后脚放在凳子上', '前腿膝盖不超过脚尖太多', '躯干保持直立，核心收紧'],
      mistakes: ['重心太前导致膝盖压力大', '后脚承重太多'],
      videoSide: `${MW}/male-Dumbbell-dumbbell-bulgarian-split-squat-side.mp4`,
      videoFront: `${MW}/male-Dumbbell-dumbbell-bulgarian-split-squat-front.mp4`,
    },
    {
      id: 'split-jump',
      name: '分腿蹲跳',
      why: '弓步后爆发回位的能力',
      sets: 3, reps: '8次', rest: 90,
      tips: ['从弓步姿势起跳', '空中换腿，落地缓冲', '落地时膝盖微屈吸收冲击'],
      mistakes: ['落地膝盖内扣', '跳得太高忽略控制'],
      videoSide: `${MW}/male-Bodyweight-split-squat-jump-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-split-squat-jump-front.mp4`,
    },
    {
      id: 'box-jump',
      name: '箱式跳',
      why: '起跳杀球的力量发展速率(RFD)',
      sets: 4, reps: '6次', rest: 90,
      tips: ['双脚与肩同宽站在箱前', '摆臂起跳，双脚同时落在箱上', '站直后再走下来，不要跳下'],
      mistakes: ['用过高的箱子导致落地不稳', '跳下箱子增加受伤风险'],
      videoSide: `${MW}/male-Bodyweight-box-jump-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-box-jump-front.mp4`,
    },
    {
      id: 'single-leg-deadlift',
      name: '单腿硬拉',
      why: '单腿稳定 + 后链力量，防伤',
      sets: 3, reps: '10次/腿', rest: 60,
      tips: ['单腿站立，另一腿向后伸', '哑铃沿支撑腿下放', '背部保持平直'],
      mistakes: ['弓背', '支撑腿膝盖锁死'],
      videoSide: `${MW}/male-Dumbbell-dumbbell-single-leg-deadlift-side.mp4`,
      videoFront: `${MW}/male-Dumbbell-dumbbell-single-leg-deadlift-front.mp4`,
    },
    {
      id: 'lateral-bound',
      name: '侧向跳',
      why: '防守接杀时的横向蹬地爆发',
      sets: 3, reps: '8次/侧', rest: 60,
      tips: ['单脚起跳，向侧方跳出', '对侧脚落地，保持平衡1秒', '落地时膝盖微屈缓冲'],
      mistakes: ['落地不稳就急着跳回', '上半身前倾太多'],
      videoSide: `${MW}/male-Bodyweight-lateral-bound-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-lateral-bound-front.mp4`,
    },
    {
      id: 'barbell-squat',
      name: '杠铃深蹲',
      why: '整体下肢力量基础',
      sets: 4, reps: '8次', rest: 120,
      tips: ['双脚与肩同宽，脚尖略外展', '杠铃置于斜方肌上', '蹲至大腿平行或略低'],
      mistakes: ['膝盖内扣', '起身时弓背', '重心前移到脚尖'],
      videoSide: `${MW}/male-Barbell-barbell-squat-side.mp4`,
      videoFront: `${MW}/male-Barbell-barbell-squat-front.mp4`,
    },
  ],

  agility: [
    {
      id: 'lateral-shuffle',
      name: '侧向滑步',
      why: '场上横向移动的核心步法模式',
      sets: 4, reps: '20秒', rest: 40,
      tips: ['低重心，膝盖微屈', '脚步不要交叉', '用前脚掌推蹬'],
      mistakes: ['身体直立重心太高', '双脚并拢'],
      videoSide: null, videoFront: null,
    },
    {
      id: 'low-hurdle-hops',
      name: '低栏连续跨跳',
      why: '快速起跳落地的协调性和节奏感',
      sets: 3, reps: '8次', rest: 60,
      tips: ['连续双脚跳过低栏', '落地立刻起跳，减少触地时间', '手臂配合摆动'],
      mistakes: ['每次落地停顿太久', '跳得过高浪费时间'],
      videoSide: null, videoFront: null,
    },
    {
      id: 't-drill',
      name: 'T字跑',
      why: '前后左右多方向快速变向',
      sets: 4, reps: '1趟', rest: 60,
      tips: ['前冲→侧滑→侧滑→后退', '变向时降低重心', '每次触碰标志物'],
      mistakes: ['变向时减速不够', '交叉步代替滑步'],
      videoSide: null, videoFront: null,
    },
    {
      id: 'depth-jump',
      name: '反应性着地跳',
      why: '空中姿态控制 + 落地缓冲能力',
      sets: 3, reps: '6次', rest: 90,
      tips: ['从低台阶走下（非跳下）', '落地瞬间立即起跳', '追求最短触地时间'],
      mistakes: ['台阶太高', '落地后蹲太深才起跳'],
      videoSide: `${MW}/male-Bodyweight-depth-jump-to-box-jump-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-depth-jump-to-box-jump-front.mp4`,
    },
    {
      id: 'carioca-step',
      name: '交叉步移动',
      why: '后场移动的专项步法模式',
      sets: 4, reps: '20秒', rest: 40,
      tips: ['侧向移动，双脚交替前后交叉', '髋部保持朝前', '逐渐加速'],
      mistakes: ['上半身转向移动方向', '步幅太大失去节奏'],
      videoSide: null, videoFront: null,
    },
    {
      id: 'multi-direction-hops',
      name: '多方向跳格',
      why: '快速脚步灵活性和反应',
      sets: 3, reps: '30秒', rest: 45,
      tips: ['想象地面4格，双脚快速跳入各格', '前后左右+对角线', '尽量轻盈快速'],
      mistakes: ['追求速度忽略准确性', '身体僵硬不协调'],
      videoSide: null, videoFront: null,
    },
  ],

  cardio: [
    {
      id: 'jump-rope-hiit',
      name: 'HIIT跳绳间歇',
      why: '模拟比赛节奏的高低强度交替',
      sets: 8, reps: '30秒快+30秒慢', rest: 0,
      tips: ['快速阶段全力双摇或快速单摇', '慢速阶段轻松单摇恢复', '保持节奏不要停'],
      mistakes: ['快速阶段不够全力', '慢速阶段完全停下'],
      videoSide: `${MW}/male-Bodyweight-jump-rope-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-jump-rope-front.mp4`,
    },
    {
      id: 'kettlebell-swing',
      name: '壶铃摆荡',
      why: '髋关节爆发力 + 心肺耐力',
      sets: 4, reps: '15次', rest: 60,
      tips: ['髋部铰链动作，不是深蹲', '手臂只是挂钩，力量来自臀部', '顶端夹紧臀部'],
      mistakes: ['用手臂举壶铃', '腰部过度后仰'],
      videoSide: `${MW}/male-Kettlebell-kettlebell-swing-side.mp4`,
      videoFront: `${MW}/male-Kettlebell-kettlebell-swing-front.mp4`,
    },
    {
      id: 'burpee',
      name: '波比跳',
      why: '全身爆发 + 心肺极限挑战',
      sets: 3, reps: '10次', rest: 90,
      tips: ['下蹲→后跳→俯卧撑→收腿→跳起', '每个动作做完整', '跳起时手过头顶'],
      mistakes: ['省略俯卧撑', '跳起高度不够'],
      videoSide: `${MW}/male-Bodyweight-burpee-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-burpee-front.mp4`,
    },
    {
      id: 'rowing-intervals',
      name: '划船机间歇',
      why: '低冲击有氧耐力，保护关节',
      sets: 5, reps: '1分钟全力+1分钟慢', rest: 0,
      tips: ['全力阶段阻力调高，拉到最大幅度', '恢复阶段轻拉保持节奏', '注意先蹬腿再拉手'],
      mistakes: ['只用手拉没有蹬腿', '弓背'],
      videoSide: null, videoFront: null,
    },
    {
      id: 'battle-rope',
      name: '战绳交替甩',
      why: '上肢耐力 + 核心稳定',
      sets: 4, reps: '30秒', rest: 45,
      tips: ['双脚与肩同宽，微蹲', '双手交替上下甩动', '核心收紧，身体不要晃'],
      mistakes: ['只动手臂不动肩膀', '站太直没有屈膝'],
      videoSide: `${MW}/male-Bodyweight-battle-ropes-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-battle-ropes-front.mp4`,
    },
    {
      id: 'jumping-jack',
      name: '开合跳',
      why: '协调性 + 基础心肺热身',
      sets: 3, reps: '40秒', rest: 30,
      tips: ['跳开时双手过头击掌', '跳回时双手放体侧', '用前脚掌着地'],
      mistakes: ['手臂动作不完整', '跳跃幅度太小'],
      videoSide: `${MW}/male-Bodyweight-jumping-jack-side.mp4`,
      videoFront: `${MW}/male-Bodyweight-jumping-jack-front.mp4`,
    },
  ],

  upper: [
    {
      id: 'face-pull',
      name: '面拉',
      why: '肩袖保护，预防羽毛球肩伤',
      sets: 3, reps: '15次', rest: 45,
      tips: ['绳索调到面部高度', '双手拉向脸两侧，外旋', '顶峰收缩2秒'],
      mistakes: ['重量太大借力', '没有外旋'],
      videoSide: `${MW}/male-Cable-cable-face-pull-side.mp4`,
      videoFront: `${MW}/male-Cable-cable-face-pull-front.mp4`,
    },
    {
      id: 'band-external-rotation',
      name: '弹力带外旋',
      why: '肩关节稳定性，杀球后减速制动',
      sets: 3, reps: '15次/侧', rest: 30,
      tips: ['上臂夹紧身体', '前臂向外旋转90度', '控制回放速度'],
      mistakes: ['手肘离开身体', '用身体转动代替'],
      videoSide: `${MW}/male-Band-band-external-rotation-side.mp4`,
      videoFront: `${MW}/male-Band-band-external-rotation-front.mp4`,
    },
    {
      id: 'dumbbell-shoulder-press',
      name: '哑铃肩推',
      why: '杀球时头顶发力的基础力量',
      sets: 3, reps: '10次', rest: 60,
      tips: ['坐姿或站姿，哑铃在耳朵两侧', '向上推至手臂伸直', '下放到耳朵高度'],
      mistakes: ['腰部过度反弓', '推的轨迹不垂直'],
      videoSide: `${MW}/male-Dumbbell-dumbbell-shoulder-press-side.mp4`,
      videoFront: `${MW}/male-Dumbbell-dumbbell-shoulder-press-front.mp4`,
    },
    {
      id: 'dumbbell-row',
      name: '哑铃划船',
      why: '后拉挥拍力量和上背稳定',
      sets: 3, reps: '10次/侧', rest: 60,
      tips: ['一手一脚撑凳子', '哑铃从下方拉向髋部', '顶峰挤压肩胛骨'],
      mistakes: ['用手臂拉而非背部', '身体旋转借力'],
      videoSide: `${MW}/male-Dumbbell-dumbbell-row-unilateral-side.mp4`,
      videoFront: `${MW}/male-Dumbbell-dumbbell-row-unilateral-front.mp4`,
    },
    {
      id: 'wrist-curl',
      name: '手腕正反弯举',
      why: '手腕控拍力量，发力和减速',
      sets: 3, reps: '15次', rest: 30,
      tips: ['前臂平放在大腿上，手腕悬空', '正握弯举+反握弯举各一组', '动作缓慢控制'],
      mistakes: ['重量太大导致前臂参与', '幅度太小'],
      videoSide: `${MW}/male-Dumbbell-dumbbell-wrist-curl-side.mp4`,
      videoFront: `${MW}/male-Dumbbell-dumbbell-wrist-curl-front.mp4`,
    },
    {
      id: 'pull-up',
      name: '引体向上',
      why: '拉系整体力量，挥拍加速基础',
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

// 每周训练日安排：星期几 → 模块组合
// 0=周日, 1=周一, ..., 6=周六
export const WEEKLY_SCHEDULE = {
  1: { modules: ['core', 'legs'],    theme: '核心 + 下肢爆发' },
  3: { modules: ['agility', 'cardio'], theme: '敏捷 + 体能' },
  4: { modules: ['legs', 'upper'],   theme: '下肢 + 肩臂' },
  6: { modules: ['core', 'agility', 'cardio'], theme: '综合训练' },
};
```

**Step 2: 验证模块导入**

在 app.js 中添加临时测试：
```javascript
import { EXERCISES, MODULES } from './exercises.js';
console.log('模块数:', Object.keys(MODULES).length);
console.log('总动作数:', Object.values(EXERCISES).flat().length);
```

用本地服务器（`npx serve`）打开，控制台应输出 `模块数: 5` 和 `总动作数: 30`。

**Step 3: 提交**

```bash
git add exercises.js
git commit -m "feat: add exercise database with 30 badminton-specific exercises"
```

---

## Task 3: 计划生成算法

**Files:**
- Create: `planner.js`

**Step 1: 创建 planner.js**

```javascript
import { EXERCISES, WEEKLY_SCHEDULE, WARMUP, COOLDOWN } from './exercises.js';

// 基于日期的确定性随机数（同一天刷新不变）
function seededRandom(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function dateSeed(date) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

// 获取当年第几周
function getWeekNumber(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date - start;
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

/**
 * 生成指定日期的训练计划
 * @param {Date} date
 * @param {number} offset - 换一组时的偏移量
 * @returns {{ isTrainingDay, theme, warmup, exercises, cooldown, date }}
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
  const seed = dateSeed(date) + offset;
  const exercises = [];

  if (schedule.modules.length <= 2) {
    // 普通训练日：每个模块选1-2个，凑3个动作
    const perModule = schedule.modules.length === 1 ? 3 : [2, 1];
    schedule.modules.forEach((mod, i) => {
      const pool = EXERCISES[mod];
      const count = Array.isArray(perModule) ? perModule[i] : perModule;
      const picked = pickExercises(pool, count, weekNum, seed + i);
      exercises.push(...picked);
    });
  } else {
    // 综合日：每个模块选1个
    schedule.modules.forEach((mod, i) => {
      const pool = EXERCISES[mod];
      const picked = pickExercises(pool, 1, weekNum, seed + i);
      exercises.push(...picked);
    });
  }

  return {
    isTrainingDay: true,
    theme: schedule.theme,
    modules: schedule.modules,
    warmup: WARMUP,
    exercises,
    cooldown: COOLDOWN,
    date,
  };
}

function pickExercises(pool, count, weekNum, seed) {
  const result = [];
  const poolSize = pool.length;
  for (let i = 0; i < count; i++) {
    const index = (weekNum + i + Math.floor(seededRandom(seed + i) * poolSize)) % poolSize;
    // 避免重复
    let pick = pool[index];
    if (result.find(e => e.id === pick.id)) {
      pick = pool[(index + 1) % poolSize];
    }
    result.push(pick);
  }
  return result;
}

function findNextTrainingDay(date) {
  const trainingDays = Object.keys(WEEKLY_SCHEDULE).map(Number);
  let d = new Date(date);
  for (let i = 1; i <= 7; i++) {
    d.setDate(d.getDate() + 1);
    if (trainingDays.includes(d.getDay())) {
      return d;
    }
  }
  return null;
}

export function formatDate(date) {
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${m}月${d}日 ${weekDays[date.getDay()]}`;
}
```

**Step 2: 验证**

在 app.js 中测试：
```javascript
import { generatePlan, formatDate } from './planner.js';
const today = new Date();
const plan = generatePlan(today);
console.log(formatDate(today), plan);
```

确认：训练日输出3个动作 + 主题，非训练日输出下次训练日期。

**Step 3: 提交**

```bash
git add planner.js
git commit -m "feat: add deterministic daily plan generation algorithm"
```

---

## Task 4: 主界面 HTML + CSS

**Files:**
- Modify: `style.css` (添加完整组件样式)
- Modify: `index.html` (如需添加字体等)

**Step 1: 在 style.css 中添加完整组件样式**

在已有内容后追加：头部栏、动作卡片、视频容器、计时器、按钮、进度指示器、热身/拉伸卡片、设置页、打卡日历、动画等完整样式。

关键样式要点：
- `.header` - 顶部固定栏，日期+主题+打卡天数
- `.card` - 圆角卡片，深色背景
- `.video-box` - 视频容器，宽高比固定
- `.video-box video` - autoplay loop muted playsinline
- `.timer` - 大字体计时器（48px+），2米可见
- `.timer-btn` - 大按钮（最小 48px 触摸区域）
- `.tips-list` - 动作要领列表
- `.progress-dots` - 底部进度圆点
- `.swipe-container` - 左右滑动容器
- `.rest-day` - 休息日提示
- `.settings-page` - 设置页
- `.calendar` - 打卡日历

**Step 2: 提交**

```bash
git add style.css
git commit -m "feat: add complete mobile-first dark mode CSS"
```

---

## Task 5: 主应用逻辑 - 渲染今日计划

**Files:**
- Modify: `app.js`

**Step 1: 实现 app.js 主渲染逻辑**

```javascript
import { MODULES } from './exercises.js';
import { generatePlan, formatDate } from './planner.js';

const app = document.getElementById('app');
let currentPlan = null;
let currentExerciseIndex = 0;
let planOffset = 0;

function init() {
  currentPlan = generatePlan(new Date(), planOffset);
  render();
}

function render() {
  if (!currentPlan.isTrainingDay) {
    renderRestDay();
    return;
  }
  renderTrainingDay();
}

function renderRestDay() {
  const next = currentPlan.nextTrainingDay;
  app.innerHTML = `
    <div class="header">
      <div class="date">${formatDate(currentPlan.date)}</div>
      <div class="streak">🔥 ${getStreak()} 天连续</div>
    </div>
    <div class="rest-day">
      <div class="rest-icon">😴</div>
      <h2>今天休息</h2>
      <p>下次训练：${next ? formatDate(next) : ''}</p>
      <p class="rest-tip">好好恢复，肌肉在休息时生长</p>
    </div>`;
}

function renderTrainingDay() {
  const { theme, warmup, exercises, cooldown } = currentPlan;
  const totalMin = warmup.duration + cooldown.duration +
    exercises.reduce((sum, e) => sum + estimateExerciseDuration(e), 0);

  app.innerHTML = `
    <div class="header">
      <div class="date">${formatDate(currentPlan.date)}</div>
      <div class="theme">${theme}</div>
      <div class="meta-row">
        <span>⏱ 约${totalMin}分钟</span>
        <span>🔥 ${getStreak()} 天连续</span>
        <button class="refresh-btn" onclick="window.refreshPlan()">🔄 换一组</button>
      </div>
    </div>
    <div class="cards-container">
      ${renderWarmupCard(warmup)}
      ${exercises.map((e, i) => renderExerciseCard(e, i)).join('')}
      ${renderCooldownCard(cooldown)}
    </div>
    <div class="progress-dots">
      ${['热身', ...exercises.map((_, i) => i + 1), '拉伸'].map((label, i) =>
        `<div class="dot ${i === currentExerciseIndex ? 'active' : ''}"
              onclick="window.goToCard(${i})">${label}</div>`
      ).join('')}
    </div>`;

  showCard(currentExerciseIndex);
}
// ... (更多渲染函数)
```

包含以下子函数：
- `renderExerciseCard(exercise, index)` - 渲染单个动作卡片（视频+要领+计时器+完成按钮）
- `renderWarmupCard(warmup)` - 渲染热身卡片
- `renderCooldownCard(cooldown)` - 渲染拉伸卡片
- `showCard(index)` - 显示指定卡片，隐藏其他
- `goToCard(index)` - 导航到指定卡片
- `estimateExerciseDuration(exercise)` - 估算单个动作耗时
- `completeExercise(index)` - 标记完成，自动跳转下一个
- `refreshPlan()` - 换一组（offset+1 重新生成）

**Step 2: 验证**

用本地服务器打开，确认：
- 训练日显示主题、3个动作卡片
- 非训练日显示休息提示
- 视频自动循环播放
- 进度圆点可点击切换

**Step 3: 提交**

```bash
git add app.js
git commit -m "feat: implement main training day UI rendering"
```

---

## Task 6: 触摸滑动切换卡片

**Files:**
- Modify: `app.js` (添加 touch 事件处理)

**Step 1: 添加滑动手势支持**

```javascript
function initSwipe() {
  let startX = 0;
  let startY = 0;
  const container = document.querySelector('.cards-container');
  if (!container) return;

  container.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  container.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) goToCard(currentExerciseIndex + 1); // 左滑 → 下一个
      else goToCard(currentExerciseIndex - 1);         // 右滑 → 上一个
    }
  }, { passive: true });
}
```

**Step 2: 验证**

手机端测试滑动切换。

**Step 3: 提交**

```bash
git add app.js
git commit -m "feat: add swipe gesture for card navigation"
```

---

## Task 7: 倒计时器

**Files:**
- Modify: `app.js` (添加计时器逻辑)

**Step 1: 实现计时器**

```javascript
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;
let currentTimerExercise = null;

function startTimer(exerciseId, totalSeconds) {
  stopTimer();
  currentTimerExercise = exerciseId;
  timerSeconds = totalSeconds;
  timerRunning = true;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerDisplay();
    if (timerSeconds <= 0) {
      stopTimer();
      playBeep();
      // 如果是组间休息结束，提示开始下一组
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
}

function toggleTimer(exerciseId, totalSeconds) {
  if (timerRunning && currentTimerExercise === exerciseId) {
    stopTimer();
  } else {
    startTimer(exerciseId, totalSeconds);
  }
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const el = document.getElementById(`timer-${currentTimerExercise}`);
  if (!el) return;
  const min = Math.floor(timerSeconds / 60);
  const sec = timerSeconds % 60;
  el.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.3;
    osc.start();
    setTimeout(() => { osc.stop(); ctx.close(); }, 300);
  } catch (e) { /* iOS 可能阻止自动播放音频 */ }
}
```

**Step 2: 验证**

点击计时器按钮，确认倒计时正常、归零时有声音提示。

**Step 3: 提交**

```bash
git add app.js
git commit -m "feat: add countdown timer with audio alert"
```

---

## Task 8: 完成追踪 + 打卡记录

**Files:**
- Modify: `app.js` (添加 localStorage 持久化)

**Step 1: 实现进度追踪**

```javascript
const STORAGE_KEY = 'badminton-training';

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { history: {}, settings: {} };
  } catch { return { history: {}, settings: {} }; }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function markComplete(date) {
  const data = loadData();
  data.history[dateKey(date)] = { completed: true, timestamp: Date.now() };
  saveData(data);
}

function isCompleted(date) {
  const data = loadData();
  return data.history[dateKey(date)]?.completed || false;
}

function getStreak() {
  const data = loadData();
  const trainingDays = [1, 3, 4, 6]; // 周一三四六
  let streak = 0;
  let d = new Date();

  // 如果今天是训练日且已完成，从今天开始算
  // 否则从上一个训练日开始算
  if (!trainingDays.includes(d.getDay()) || !isCompleted(d)) {
    d.setDate(d.getDate() - 1);
  }

  while (true) {
    if (trainingDays.includes(d.getDay())) {
      if (isCompleted(d)) {
        streak++;
      } else {
        break;
      }
    }
    d.setDate(d.getDate() - 1);
    if (streak > 365) break; // 安全上限
  }
  return streak;
}
```

**Step 2: 完成所有动作后触发打卡**

全部动作标记完成 → 显示打卡成功动画 → 调用 `markComplete(today)` → 更新连续天数显示。

**Step 3: 提交**

```bash
git add app.js
git commit -m "feat: add completion tracking and streak counter"
```

---

## Task 9: 设置页

**Files:**
- Modify: `app.js` (添加设置页渲染和交互)

**Step 1: 实现设置页**

包含：
- 提醒时间选择器（保存到 localStorage）
- 训练日勾选（默认周一三四六）
- 打卡日历（月视图，已完成的日期标绿）
- 返回按钮

**Step 2: 实现打卡日历组件**

```javascript
function renderCalendar(year, month) {
  const data = loadData();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // ... 生成日历网格，已完成标绿，训练日标记
}
```

**Step 3: 验证**

设置页可正常打开、修改设置、查看日历。

**Step 4: 提交**

```bash
git add app.js
git commit -m "feat: add settings page with calendar and reminder config"
```

---

## Task 10: PWA 支持

**Files:**
- Create: `manifest.json`
- Create: `sw.js`
- Create: `icons/icon-192.png` (可用占位图)
- Create: `icons/icon-512.png` (可用占位图)

**Step 1: 创建 manifest.json**

```json
{
  "name": "羽毛球体能训练",
  "short_name": "羽球训练",
  "description": "基于运动科学的羽毛球专项体能训练计划",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#111827",
  "theme_color": "#059669",
  "orientation": "portrait",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Step 2: 创建 sw.js**

```javascript
const CACHE_NAME = 'badminton-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/exercises.js',
  '/planner.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  // 视频走网络（太大不缓存），其他走缓存优先
  if (e.request.url.includes('musclewiki.com')) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
```

**Step 3: 在 app.js 中注册 Service Worker**

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

**Step 4: 生成简易 PWA 图标**

使用 canvas 或 SVG 生成带羽毛球元素的简易图标。

**Step 5: 验证**

用 Chrome DevTools → Application → Manifest 确认 PWA 安装提示可用。

**Step 6: 提交**

```bash
git add manifest.json sw.js icons/
git commit -m "feat: add PWA support with service worker and manifest"
```

---

## Task 11: MuscleWiki 视频 URL 验证

**Files:**
- Modify: `exercises.js` (修正无效 URL)

**Step 1: 批量验证每个视频 URL 是否可访问**

用脚本或手动检查所有 `videoSide` 和 `videoFront` URL。对于返回 404 的 URL，尝试修正命名或设为 null。

**Step 2: 对无视频的动作添加 fallback**

无视频的动作（如 T字跑、侧向滑步等）在卡片中显示文字说明 + 简笔画示意图（CSS 绘制或 SVG）。

**Step 3: 提交**

```bash
git add exercises.js
git commit -m "fix: verify and correct all MuscleWiki video URLs"
```

---

## Task 12: 部署到 GitHub Pages

**Step 1: 创建 GitHub 仓库**

```bash
gh repo create yumaoqiu --public --source=. --push
```

**Step 2: 启用 GitHub Pages**

```bash
gh api repos/{owner}/yumaoqiu/pages -X POST -f source.branch=main -f source.path=/
```

或在 GitHub Settings → Pages → Source 选 main 分支。

**Step 3: 验证部署**

访问 `https://<username>.github.io/yumaoqiu/`，确认页面正常加载。

**Step 4: iOS 安装测试**

手机 Safari 打开 → 分享 → 添加到主屏幕 → 从图标启动确认全屏模式。

---

## 执行顺序总结

| 序号 | 任务 | 预估 |
|------|------|------|
| 1 | 项目初始化 | 5 min |
| 2 | 动作数据库 | 15 min |
| 3 | 计划生成算法 | 10 min |
| 4 | CSS 样式系统 | 15 min |
| 5 | 主 UI 渲染 | 20 min |
| 6 | 滑动切换 | 5 min |
| 7 | 倒计时器 | 10 min |
| 8 | 完成追踪 | 10 min |
| 9 | 设置页 | 15 min |
| 10 | PWA 支持 | 10 min |
| 11 | 视频 URL 验证 | 15 min |
| 12 | 部署 | 5 min |
