# Warmup/Cooldown Video Steps Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add MuscleWiki video steps to warmup and cooldown with dynamic focus-matching (3 focus + 1 general), and render them in the UI.

**Architecture:** Extend the MW sync pipeline to produce `WARMUP_MW` and `COOLDOWN_MW` pools tagged with `stepType`/`focus`, update planner selection to produce 4 steps per section based on daily training focus, and render each step with the existing dual-video component and fallback.

**Tech Stack:** Vanilla ES Modules (HTML/CSS/JS), Node test runner (`node --test`).

---

### Task 1: Extend MW Data Pipeline For Warmup/Cooldown

**Files:**
- Modify: `scripts/mw-library-blueprint.mjs`
- Modify: `scripts/sync-mw-library.mjs`
- Modify: `data/exercises.mw.json` (generated)
- Modify: `data/exercises.mw.js` (generated)
- Test: `test/warmup-cooldown-data.test.mjs`

**Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { WARMUP_MW, COOLDOWN_MW } from '../data/exercises.mw.js';

function hasVideo(step) {
  return Boolean(step.videoSide || step.videoFront);
}

test('warmup and cooldown pools exist with required fields', () => {
  assert.ok(Array.isArray(WARMUP_MW));
  assert.ok(Array.isArray(COOLDOWN_MW));
  assert.ok(WARMUP_MW.length >= 8);
  assert.ok(COOLDOWN_MW.length >= 8);
  WARMUP_MW.forEach(step => {
    assert.ok(step.stepType === 'warmup');
    assert.ok(step.focus);
    assert.ok(step.name);
    assert.ok(step.duration);
    assert.ok(hasVideo(step));
  });
  COOLDOWN_MW.forEach(step => {
    assert.ok(step.stepType === 'cooldown');
    assert.ok(step.focus);
    assert.ok(step.name);
    assert.ok(step.duration);
    assert.ok(hasVideo(step));
  });
});
```

**Step 2: Run test to verify it fails**

Run: `node --test test/warmup-cooldown-data.test.mjs`
Expected: FAIL (exports missing)

**Step 3: Write minimal implementation**

In `scripts/mw-library-blueprint.mjs`, add warmup/cooldown definitions with MW IDs and metadata:

```js
export const WARMUP_BLUEPRINT = [
  { id: 901, focus: 'legs', name: '动态弓步', duration: '45秒', stepType: 'warmup' },
  { id: 902, focus: 'legs', name: '髋屈伸动态拉伸', duration: '40秒', stepType: 'warmup' },
  { id: 903, focus: 'core', name: '死虫', duration: '40秒', stepType: 'warmup' },
  { id: 904, focus: 'upper', name: '肩胛推', duration: '40秒', stepType: 'warmup' },
  { id: 905, focus: 'agility', name: '侧向移动', duration: '40秒', stepType: 'warmup' },
  { id: 906, focus: 'general', name: '踝关节活动', duration: '40秒', stepType: 'warmup' },
  // ...补到 >= 8 条（每个 focus 至少 2 条）
];

export const COOLDOWN_BLUEPRINT = [
  { id: 951, focus: 'legs', name: '股四头肌拉伸', duration: '30秒/侧', stepType: 'cooldown' },
  { id: 952, focus: 'legs', name: '腘绳肌拉伸', duration: '30秒/侧', stepType: 'cooldown' },
  { id: 953, focus: 'core', name: '猫牛式', duration: '40秒', stepType: 'cooldown' },
  { id: 954, focus: 'upper', name: '胸大肌拉伸', duration: '30秒/侧', stepType: 'cooldown' },
  { id: 955, focus: 'upper', name: '肩后侧拉伸', duration: '30秒/侧', stepType: 'cooldown' },
  { id: 956, focus: 'general', name: '髋屈肌拉伸', duration: '30秒/侧', stepType: 'cooldown' },
  // ...补到 >= 8 条（每个 focus 至少 2 条）
];
```

In `scripts/sync-mw-library.mjs`, after the main exercise mapping, generate two arrays:

```js
const warmup = await fetchBlueprintSteps(WARMUP_BLUEPRINT, client);
const cooldown = await fetchBlueprintSteps(COOLDOWN_BLUEPRINT, client);

// write to output
export const WARMUP_MW = ${JSON.stringify(warmup, null, 2)};
export const COOLDOWN_MW = ${JSON.stringify(cooldown, null, 2)};
```

You will need to implement `fetchBlueprintSteps` similarly to existing exercise fetch: resolve MW source + normalize video URLs.

**Step 4: Run test to verify it passes**

Run: `MW_API_KEY=... node scripts/sync-mw-library.mjs --out data/exercises.mw.json`
Then: `node --test test/warmup-cooldown-data.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/mw-library-blueprint.mjs scripts/sync-mw-library.mjs data/exercises.mw.json data/exercises.mw.js test/warmup-cooldown-data.test.mjs
git commit -m "feat: add warmup and cooldown pools to MW library"
```

---

### Task 2: Expose Warmup/Cooldown Pools In Runtime

**Files:**
- Modify: `exercises.js`
- Test: `test/warmup-cooldown-select.test.mjs`

**Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { WARMUP_STEPS, COOLDOWN_STEPS } from '../exercises.js';

test('warmup/cooldown steps exported', () => {
  assert.ok(Array.isArray(WARMUP_STEPS));
  assert.ok(Array.isArray(COOLDOWN_STEPS));
});
```

**Step 2: Run test to verify it fails**

Run: `node --test test/warmup-cooldown-select.test.mjs`
Expected: FAIL

**Step 3: Write minimal implementation**

```js
import { EXERCISES_MW, WARMUP_MW, COOLDOWN_MW } from './data/exercises.mw.js';
export const WARMUP_STEPS = WARMUP_MW;
export const COOLDOWN_STEPS = COOLDOWN_MW;
```

**Step 4: Run test to verify it passes**

Run: `node --test test/warmup-cooldown-select.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add exercises.js test/warmup-cooldown-select.test.mjs
git commit -m "feat: export warmup and cooldown step pools"
```

---

### Task 3: Planner Selection Logic (3 Focus + 1 General)

**Files:**
- Modify: `planner.js`
- Test: `test/warmup-cooldown-select.test.mjs`

**Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePlan } from '../planner.js';

const date = new Date('2026-03-12T12:00:00+08:00');

test('warmup and cooldown steps are 4 each with 3 focus + 1 general', () => {
  const plan = generatePlan(date, 0);
  assert.equal(plan.warmup.steps.length, 4);
  assert.equal(plan.cooldown.steps.length, 4);
  const warmupGeneral = plan.warmup.steps.filter(s => s.focus === 'general').length;
  const cooldownGeneral = plan.cooldown.steps.filter(s => s.focus === 'general').length;
  assert.equal(warmupGeneral, 1);
  assert.equal(cooldownGeneral, 1);
});

test('warmup/cooldown selection is deterministic per day', () => {
  const a = generatePlan(date, 0);
  const b = generatePlan(date, 0);
  assert.deepEqual(a.warmup.steps.map(s => s.id), b.warmup.steps.map(s => s.id));
  assert.deepEqual(a.cooldown.steps.map(s => s.id), b.cooldown.steps.map(s => s.id));
});
```

**Step 2: Run test to verify it fails**

Run: `node --test test/warmup-cooldown-select.test.mjs`
Expected: FAIL

**Step 3: Write minimal implementation**

In `planner.js`:

```js
import { WARMUP_STEPS, COOLDOWN_STEPS } from './exercises.js';

function focusFromRole(role) {
  if (role === 'knee' || role === 'hip') return 'legs';
  if (role === 'core') return 'core';
  if (role === 'upper') return 'upper';
  return 'agility';
}

function pickSteps(pool, focusList, seed, already = []) {
  const result = [];
  const used = new Set(already.map(s => s.id));
  const poolByFocus = focus => pool.filter(s => s.focus === focus);

  focusList.forEach((focus, i) => {
    const list = poolByFocus(focus);
    if (list.length === 0) return;
    const idx = Math.floor(seededRandom(seed + i * 13) * list.length);
    const item = list[idx];
    if (!used.has(item.id)) {
      result.push(item);
      used.add(item.id);
    }
  });

  const general = poolByFocus('general');
  if (general.length > 0) {
    const idx = Math.floor(seededRandom(seed + 77) * general.length);
    const item = general[idx];
    if (!used.has(item.id)) result.push(item);
  }

  while (result.length < 4) {
    const fallback = pool[Math.floor(seededRandom(seed + result.length * 17) * pool.length)];
    if (!used.has(fallback.id)) {
      result.push(fallback);
      used.add(fallback.id);
    }
  }

  return result.slice(0, 4);
}
```

Inside `generatePlan`, after `finalizedExercises`:

```js
const focusList = finalizedExercises.map(e => focusFromRole(e.role));
const dominant = focusList.filter((v, i, arr) => arr.indexOf(v) === i);
const focusSteps = dominant.length === 1 ? [dominant[0], dominant[0], dominant[0]]
  : dominant.length === 2 ? [dominant[0], dominant[0], dominant[1]]
  : [dominant[0], dominant[1], dominant[2]];

const warmupSteps = pickSteps(WARMUP_STEPS, focusSteps, seed + 200);
const cooldownSteps = pickSteps(COOLDOWN_STEPS, focusSteps, seed + 300);

const warmup = { ...WARMUP, steps: warmupSteps };
const cooldown = { ...COOLDOWN, steps: cooldownSteps };
```

**Step 4: Run test to verify it passes**

Run: `node --test test/warmup-cooldown-select.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add planner.js test/warmup-cooldown-select.test.mjs
git commit -m "feat: select warmup/cooldown steps by daily focus"
```

---

### Task 4: Render Warmup/Cooldown Steps With Videos

**Files:**
- Modify: `app.js`
- Modify: `style.css`

**Step 1: Write the failing test**

Skip UI test (no UI harness). User has approved manual UI verification.

**Step 2: Implement**

In `renderWarmupCard` and `renderCooldownCard`, render each step as:

```js
<div class="step-row">
  <div class="step-info">
    <div class="step-name">${step.name}</div>
    <div class="step-duration">${step.duration}</div>
  </div>
  <div class="step-videos">
    ${renderVideoSlot({
      angle: '侧视',
      src: step.videoSide,
      fallbackImage: step.fallbackImageSide,
      label: step.name,
    }, step.name)}
    ${renderVideoSlot({
      angle: '正视',
      src: step.videoFront,
      fallbackImage: step.fallbackImageFront,
      label: step.name,
    }, step.name)}
  </div>
</div>
```

Add compact styles for `.step-row`, `.step-info`, `.step-videos` with small video height.

**Step 3: Manual check**

Run: `npx serve .` and verify warmup/cooldown steps show videos.

**Step 4: Commit**

```bash
git add app.js style.css
git commit -m "feat: render warmup and cooldown steps with videos"
```

---

### Task 5: Docs Update + Full Verification

**Files:**
- Modify: `README.md`

**Step 1: Update docs**
- Add note: warmup/cooldown steps are video-based and dynamically matched to daily focus.

**Step 2: Run full tests**

Run: `node --test test/*.mjs`
Expected: PASS

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: note warmup/cooldown video steps"
```
