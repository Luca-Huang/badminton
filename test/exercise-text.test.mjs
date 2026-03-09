import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeExerciseText } from '../exercise-text.js';

test('normalizeExerciseText replaces english tips with module chinese fallback', () => {
  const ex = {
    module: 'core',
    tips: [
      'Start in a side plank position',
      'Keep your body in a straight line',
    ],
    mistakes: ['Avoid rotating your torso'],
  };

  const out = normalizeExerciseText(ex);
  assert.equal(out.tips.length, 3);
  assert.ok(out.tips.every(line => !/[A-Za-z]{3,}/.test(line)));
  assert.ok(out.mistakes.every(line => !/[A-Za-z]{3,}/.test(line)));
});

test('normalizeExerciseText keeps chinese tips and mistakes', () => {
  const ex = {
    module: 'legs',
    tips: ['保持躯干稳定', '膝盖方向与脚尖一致'],
    mistakes: ['避免膝盖内扣'],
  };

  const out = normalizeExerciseText(ex);
  assert.deepEqual(out.tips, ex.tips);
  assert.deepEqual(out.mistakes, ex.mistakes);
});

test('normalizeExerciseText fills missing text with generic chinese fallback', () => {
  const ex = { module: 'unknown', tips: [], mistakes: [] };
  const out = normalizeExerciseText(ex);
  assert.equal(out.tips.length, 3);
  assert.equal(out.mistakes.length, 2);
});
