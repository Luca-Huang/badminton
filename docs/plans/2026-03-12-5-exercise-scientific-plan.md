# 5-Exercise Scientific Plan Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade daily training to 5 exercises (45–55 min) with injury-prevention constraints, role-based selection, and clear “why this exercise” reasons in the UI.

**Architecture:** Add a lightweight exercise profile layer (role + safety tags + selection reason), update planner to select 5 roles per day with a 4-week microcycle (3 build + 1 deload), and extend UI to show role + selection reason + breathing cue.

**Tech Stack:** Vanilla ES Modules (HTML/CSS/JS), Node test runner (`node --test`).

---

### Task 1: Add Exercise Profile Helpers

**Files:**
- Create: `exercise-profile.js`
- Test: `test/exercise-profile.test.mjs`

**Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { getRole, getSafetyTags, buildSelectionReason } from '../exercise-profile.js';

const makeEx = (id, module) => ({ id, module, name: id, sets: 3, reps: '8次', rest: 60 });

test('getRole classifies core/upper/legs/agility correctly', () => {
  assert.equal(getRole(makeEx('dead-bug', 'core')), 'core');
  assert.equal(getRole(makeEx('band-face-pull', 'upper')), 'upper');
  assert.equal(getRole(makeEx('landmine-single-leg-romanian-deadlift', 'legs')), 'hip');
  assert.equal(getRole(makeEx('bulgarian-split-squat', 'legs')), 'knee');
  assert.equal(getRole(makeEx('cardio-lateral-shuffle', 'agility')), 'agility');
});

test('getSafetyTags marks highIap and highImpact', () => {
  const squat = getSafetyTags(makeEx('barbell-squat', 'legs'));
  assert.ok(squat.includes('highIap'));

  const jump = getSafetyTags(makeEx('box-jump', 'agility'));
  assert.ok(jump.includes('highImpact'));
});

test('buildSelectionReason includes low-impact or breathing cue when configured', () => {
  const profile = { avoidHighIap: true };
  const tags = ['lowImpact'];
  const reason = buildSelectionReason({ id: 'cardio-lateral-shuffle', module: 'agility' }, 'agility', tags, profile);
  assert.ok(reason.includes('低冲击'));
  assert.ok(reason.includes('顺畅呼吸'));
});
```

**Step 2: Run test to verify it fails**

Run: `node --test test/exercise-profile.test.mjs`
Expected: FAIL (module not found or functions missing)

**Step 3: Write minimal implementation**

```js
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
```

**Step 4: Run test to verify it passes**

Run: `node --test test/exercise-profile.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add exercise-profile.js test/exercise-profile.test.mjs
git commit -m "feat: add exercise role and safety profiling"
```

---

### Task 2: Role-Based 5-Exercise Planner With Microcycle

**Files:**
- Modify: `planner.js`
- Test: `test/planner.test.mjs`

**Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePlan } from '../planner.js';

const date = new Date('2026-03-12T12:00:00+08:00'); // Thu

test('generatePlan returns 5 exercises with unique roles', () => {
  const plan = generatePlan(date, 0);
  assert.equal(plan.isTrainingDay, true);
  assert.equal(plan.exercises.length, 5);
  const roles = new Set(plan.exercises.map(e => e.role));
  assert.equal(roles.size, 5);
});

test('generatePlan avoids high IAP exercises by default', () => {
  const plan = generatePlan(date, 0);
  const ids = new Set(plan.exercises.map(e => e.id));
  assert.ok(!ids.has('barbell-squat'));
  assert.ok(!ids.has('pull-ups'));
  assert.ok(!ids.has('kettlebell-swing'));
});

test('generatePlan applies deload on week 4 (sets reduced)', () => {
  const base = generatePlan(new Date('2026-03-12T12:00:00+08:00'), 0);
  const deload = generatePlan(new Date('2026-04-02T12:00:00+08:00'), 0); // +3 weeks
  const baseMain = base.exercises.filter(e => e.role === 'knee' || e.role === 'hip');
  const deloadMain = deload.exercises.filter(e => e.role === 'knee' || e.role === 'hip');
  assert.ok(deloadMain.every((e, i) => e.sets <= baseMain[i].sets));
});
```

**Step 2: Run test to verify it fails**

Run: `node --test test/planner.test.mjs`
Expected: FAIL (roles not present / 3 exercises only)

**Step 3: Write minimal implementation**

Key changes in `planner.js`:

```js
import { getRole, getSafetyTags, buildSelectionReason, ROLE_LABELS } from './exercise-profile.js';

const TRAINING_PROFILE = {
  avoidHighIap: true,
  avoidHighImpact: true,
};

const ROLE_ORDER = ['knee', 'hip', 'upper', 'core', 'agility'];

function getWeekPhase(date) {
  const weekNum = getWeekNumber(date);
  return weekNum % 4; // 0 base, 1-2 build, 3 deload
}

function applyProgression(ex, role, phase) {
  const next = { ...ex };
  if (role === 'knee' || role === 'hip' || role === 'upper') {
    if (phase === 1 || phase === 2) next.sets = ex.sets + 1;
    if (phase === 3) next.sets = Math.max(2, ex.sets - 1);
  }
  return next;
}

function filterByProfile(list, profile) {
  const filtered = list.filter(ex => {
    const tags = getSafetyTags(ex);
    if (profile.avoidHighIap && tags.includes('highIap')) return false;
    if (profile.avoidHighImpact && tags.includes('highImpact')) return false;
    return true;
  });
  return filtered.length > 0 ? filtered : list;
}

function pickByRole(pool, role, count, weekNum, seed, already) {
  return pickExercises(pool.filter(ex => getRole(ex) === role), count, weekNum, seed, already);
}
```

Then inside `generatePlan` replace the old 3-exercise logic with:

```js
const weekNum = getWeekNumber(date);
const phase = getWeekPhase(date);
const seed = dateSeed(date) + offset * 100;
const pickedExercises = [];

const byRole = role => filterByProfile(EXERCISES.flatMap(mod => mod), TRAINING_PROFILE);

const all = Object.values(EXERCISES).flat();
const safeAll = filterByProfile(all, TRAINING_PROFILE);

ROLE_ORDER.forEach((role, i) => {
  const pool = safeAll.filter(ex => getRole(ex) === role);
  pickedExercises.push(...pickExercises(pool, 1, weekNum, seed + i, pickedExercises));
});

const finalized = pickedExercises.map(ex => {
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
```

Also update `estimateExerciseDuration` to reflect longer plan by increasing `setTime` to 70 seconds if needed.

**Step 4: Run test to verify it passes**

Run: `node --test test/planner.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add planner.js test/planner.test.mjs
git commit -m "feat: generate 5-exercise plans with role safety and microcycle"
```

---

### Task 3: UI For Role + Selection Reason + Breathing Cue

**Files:**
- Modify: `app.js`
- Modify: `style.css`

**Step 1: Write the failing test**

Skip UI snapshot tests (not present). Instead add a small logic test in `test/planner.test.mjs`:

```js
assert.ok(plan.exercises.every(e => e.selectionReason && e.roleLabel));
```

**Step 2: Run test to verify it fails**

Run: `node --test test/planner.test.mjs`
Expected: FAIL before implementation

**Step 3: Write minimal implementation**

In `app.js` `renderExerciseCard`, add role chip and reason section:

```js
<div class="role-chip">${ex.roleLabel}</div>
...
<div class="reason-box">
  <div class="reason-title">选择理由</div>
  <div class="reason-text">${ex.selectionReason}</div>
</div>
```

Add a global note near the header or inside card:

```js
<div class="safety-note">顺畅呼吸，避免憋气发力</div>
```

In `style.css` add styles for `.role-chip`, `.reason-box`, `.safety-note`.

**Step 4: Run test to verify it passes**

Run: `node --test test/planner.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add app.js style.css test/planner.test.mjs
git commit -m "feat: show exercise role and selection reason"
```

---

### Task 4: Update Training Durations and README

**Files:**
- Modify: `exercises.js`
- Modify: `README.md`

**Step 1: Write failing test**

Add to `test/planner.test.mjs`:

```js
assert.ok(plan.exercises.length === 5);
assert.ok(plan.estimatedTotalMinutes >= 45);
```

**Step 2: Run test to verify it fails**

Run: `node --test test/planner.test.mjs`
Expected: FAIL until plan exposes estimate or durations adjusted

**Step 3: Implement**

- Update `WARMUP.duration` and `COOLDOWN.duration` to 6–8 minutes
- Optionally expose `estimatedTotalMinutes` in `generatePlan` to make testable
- Update README “训练日/时长/结构” to reflect 5 动作、45–55 分钟

**Step 4: Run tests**

Run: `node --test test/*.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add exercises.js planner.js README.md test/planner.test.mjs
git commit -m "docs: update plan structure and duration"
```

---

### Task 5: Full Verification

**Step 1: Run full test suite**

Run: `node --test test/*.mjs`
Expected: PASS

**Step 2: Manual smoke check**

Run: `npx serve .` and verify:
- Header shows ~45–55 minutes
- Each card shows role + selection reason
- No high-impact or high-IAP exercises in plan

**Step 3: Commit if needed**

```bash
git status -sb
```
