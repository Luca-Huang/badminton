import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizePublicVideoUrl, pickVideo, toExerciseId } from '../scripts/mw-library-utils.mjs';

test('pickVideo prefers male by angle, then falls back to female', () => {
  const videos = [
    { url: 'female-front.mp4', angle: 'front', gender: 'female' },
    { url: 'male-side.mp4', angle: 'side', gender: 'male' },
    { url: 'female-side.mp4', angle: 'side', gender: 'female' },
  ];

  assert.equal(pickVideo(videos, 'side').url, 'male-side.mp4');
  assert.equal(pickVideo(videos, 'front').url, 'female-front.mp4');
});

test('toExerciseId generates deterministic kebab-case ids', () => {
  assert.equal(toExerciseId('Barbell Squat'), 'barbell-squat');
  assert.equal(toExerciseId('  Hand Plank  '), 'hand-plank');
  assert.equal(toExerciseId('Depth Jump to Box Jump'), 'depth-jump-to-box-jump');
});

test('normalizePublicVideoUrl converts stream video URLs to public media host', () => {
  const stream =
    'https://api.musclewiki.com/stream/videos/branded/male-Barbell-barbell-curl-front.mp4';
  const normalized = normalizePublicVideoUrl(stream);
  assert.equal(
    normalized,
    'https://media.musclewiki.com/media/uploads/videos/branded/male-Barbell-barbell-curl-front.mp4'
  );

  const unchanged = 'https://example.com/video.mp4';
  assert.equal(normalizePublicVideoUrl(unchanged), unchanged);
});
