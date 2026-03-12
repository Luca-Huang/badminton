function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function getVideoSlots(exercise = {}) {
  const side = clean(exercise.videoSide);
  const front = clean(exercise.videoFront);
  const sideImg = clean(exercise.fallbackImageSide);
  const frontImg = clean(exercise.fallbackImageFront);

  const sideSrc = side || front;
  const frontSrc = front || side;
  if (!sideSrc && !frontSrc) return [];

  return [
    {
      key: 'side',
      label: '侧视',
      src: sideSrc,
      fallbackImage: sideImg || frontImg,
    },
    {
      key: 'front',
      label: '正视',
      src: frontSrc,
      fallbackImage: frontImg || sideImg,
    },
  ];
}

export function getPrimaryVideoSlot(exercise = {}) {
  const slots = getVideoSlots(exercise);
  if (slots.length === 0) return null;
  return slots.find(slot => slot.key === 'front') ?? slots[0];
}

export function hasVideoContent(exercise = {}) {
  return getVideoSlots(exercise).length > 0;
}
