const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const MAX_DIMENSION = 900;
const JPEG_QUALITY = 0.6;

export const MAX_PAYLOAD_BYTES = 3.8 * 1024 * 1024;

export function estimatePayloadSize(value) {
  return new Blob([JSON.stringify(value)]).size;
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo procesar la imagen'));
    img.src = src;
  });
}

export async function fileToDataUrl(file) {
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('La imagen no debe superar 20MB');
  }

  const original = await readAsDataUrl(file);
  const img = await loadImage(original);

  let { width, height } = img;
  if (width > height && width > MAX_DIMENSION) {
    height = Math.round((height * MAX_DIMENSION) / width);
    width = MAX_DIMENSION;
  } else if (height > MAX_DIMENSION) {
    width = Math.round((width * MAX_DIMENSION) / height);
    height = MAX_DIMENSION;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}
