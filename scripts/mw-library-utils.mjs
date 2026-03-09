export function toExerciseId(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function pickVideo(videos, angle) {
  if (!Array.isArray(videos) || videos.length === 0) return null;
  const byAngle = videos.filter(v => v.angle === angle);
  return (
    byAngle.find(v => v.gender === 'male') ||
    byAngle.find(v => v.gender === 'female') ||
    byAngle[0] ||
    null
  );
}

export function normalizePublicVideoUrl(url) {
  if (typeof url !== 'string' || !url) return '';
  return url.replace(
    'https://api.musclewiki.com/stream/videos/branded/',
    'https://media.musclewiki.com/media/uploads/videos/branded/'
  );
}
