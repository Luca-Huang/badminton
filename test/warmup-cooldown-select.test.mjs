import test from 'node:test';
import assert from 'node:assert/strict';
import { WARMUP_STEPS, COOLDOWN_STEPS } from '../exercises.js';
import { generatePlan } from '../planner.js';

const date = new Date('2026-03-12T12:00:00+08:00');

test('warmup/cooldown steps exported', () => {
  assert.ok(Array.isArray(WARMUP_STEPS));
  assert.ok(Array.isArray(COOLDOWN_STEPS));
});

test('warmup and cooldown steps are 4 each with 1 general', () => {
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
