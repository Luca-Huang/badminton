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
    assert.equal(step.stepType, 'warmup');
    assert.ok(step.focus);
    assert.ok(step.name);
    assert.ok(step.duration);
    assert.ok(hasVideo(step));
  });
  COOLDOWN_MW.forEach(step => {
    assert.equal(step.stepType, 'cooldown');
    assert.ok(step.focus);
    assert.ok(step.name);
    assert.ok(step.duration);
    assert.ok(hasVideo(step));
  });
});

test('warmup pool excludes rowing machine steps', () => {
  const ids = new Set(WARMUP_MW.map(step => step.id));
  assert.ok(!ids.has('plow-back-rowing-preps'));
});
