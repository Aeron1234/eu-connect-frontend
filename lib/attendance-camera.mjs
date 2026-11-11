// Match the centered object-cover preview, including its digital zoom, in the
// submitted photo. CSS scaling alone would leave the saved photo unzoomed.
export function attendanceCrop(width, height, zoom = 1) {
  const scale = Math.min(3, Math.max(1, Number(zoom) || 1));
  const cropWidth = Math.min(width, height * 4 / 3) / scale;
  const cropHeight = cropWidth * 3 / 4;
  return { x: (width - cropWidth) / 2, y: (height - cropHeight) / 2, width: cropWidth, height: cropHeight };
}

export async function prepareAttendancePhoto(source, zoom) {
  const image = document.createElement('img');
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error('Could not read the camera photo.'));
    image.src = source;
  });
  const crop = attendanceCrop(image.naturalWidth, image.naturalHeight, zoom);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(Math.min(1280, crop.width));
  canvas.height = Math.round(canvas.width * 3 / 4);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Photo capture is unavailable.');
  context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  if (!blob) throw new Error('Could not prepare the photo.');
  return { blob, preview: canvas.toDataURL('image/jpeg', 0.85) };
}
