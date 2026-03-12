import test from 'node:test';
import assert from 'node:assert/strict';
import { WARMUP_STEPS, COOLDOWN_STEPS } from '../exercises.js';

test('warmup/cooldown steps exported', () => {
  assert.ok(Array.isArray(WARMUP_STEPS));
  assert.ok(Array.isArray(COOLDOWN_STEPS));
});
