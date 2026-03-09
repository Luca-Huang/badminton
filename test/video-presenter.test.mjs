import test from 'node:test';
import assert from 'node:assert/strict';

import { getVideoSlots, hasVideoContent } from '../video-presenter.js';

test('getVideoSlots returns side and front sources when both exist', () => {
  const ex = {
    videoSide: 'side.mp4',
    videoFront: 'front.mp4',
    fallbackImageSide: 'side.jpg',
    fallbackImageFront: 'front.jpg',
  };

  const slots = getVideoSlots(ex);
  assert.equal(slots.length, 2);
  assert.equal(slots[0].key, 'side');
  assert.equal(slots[0].src, 'side.mp4');
  assert.equal(slots[1].key, 'front');
  assert.equal(slots[1].src, 'front.mp4');
});

test('getVideoSlots falls back to available source when only one exists', () => {
  const ex = { videoSide: 'only-side.mp4' };
  const slots = getVideoSlots(ex);

  assert.equal(slots.length, 2);
  assert.equal(slots[0].src, 'only-side.mp4');
  assert.equal(slots[1].src, 'only-side.mp4');
});

test('hasVideoContent returns false when no valid source exists', () => {
  assert.equal(hasVideoContent({}), false);
  assert.equal(hasVideoContent({ videoSide: '' }), false);
  assert.equal(hasVideoContent({ videoFront: 'front.mp4' }), true);
});
