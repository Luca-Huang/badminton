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
