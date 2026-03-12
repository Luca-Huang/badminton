import test from 'node:test';
import assert from 'node:assert/strict';
import { EXERCISES } from '../exercises.js';

test('main exercise library excludes rowing machine moves', () => {
  const all = Object.values(EXERCISES).flat();
  assert.ok(!all.some(ex => ex.id === 'plow-back-rowing-preps'));
});
