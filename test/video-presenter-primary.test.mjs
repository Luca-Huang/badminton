import test from 'node:test';
import assert from 'node:assert/strict';
import { getPrimaryVideoSlot } from '../video-presenter.js';

test('getPrimaryVideoSlot prefers front when available', () => {
  const slot = getPrimaryVideoSlot({
    videoFront: 'https://example.com/front.mp4',
    videoSide: 'https://example.com/side.mp4',
  });

  assert.ok(slot, 'expected a primary slot');
  assert.equal(slot.key, 'front');
  assert.equal(slot.src, 'https://example.com/front.mp4');
});

test('getPrimaryVideoSlot falls back when only one angle exists', () => {
  const slot = getPrimaryVideoSlot({
    videoFront: 'https://example.com/front.mp4',
  });

  assert.ok(slot, 'expected a primary slot');
  assert.equal(slot.src, 'https://example.com/front.mp4');
});

test('getPrimaryVideoSlot returns null when no media exists', () => {
  const slot = getPrimaryVideoSlot({});
  assert.equal(slot, null);
});
