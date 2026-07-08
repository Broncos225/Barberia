export interface CompressedImage {
  base64: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
}

const TARGET_MAX_WIDTH = 1024;
const TARGET_MAX_BYTES = 600 * 1024; // 600 KB binary → ~800 KB base64
const MIN_QUALITY = 0.5;
const INITIAL_QUALITY = 0.8;

export async function compressImage(file: File): Promise<CompressedImage> {
  const img = await loadImage(file);
  const { canvas, width, height } = drawToCanvas(img);
  let quality = INITIAL_QUALITY;
  let blob = await canvasToBlob(canvas, 'image/jpeg', quality);

  // Iteratively reduce quality (and then dimensions) until under target size
  while (blob && blob.size > TARGET_MAX_BYTES && quality > MIN_QUALITY) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, 'image/jpeg', quality);
  }

  if (!blob || blob.size > TARGET_MAX_BYTES) {
    // Fall back to smaller dimensions
    const scale = 0.75;
    const w2 = Math.round(width * scale);
    const h2 = Math.round(height * scale);
    const c2 = document.createElement('canvas');
    c2.width = w2;
    c2.height = h2;
    c2.getContext('2d')!.drawImage(img, 0, 0, w2, h2);
    blob = await canvasToBlob(c2, 'image/jpeg', 0.75);
    if (!blob) throw new Error('No se pudo comprimir la imagen');
    return {
      base64: await blobToBase64(blob),
      mimeType: 'image/jpeg',
      sizeBytes: blob.size,
      width: w2,
      height: h2,
    };
  }

  return {
    base64: await blobToBase64(blob!),
    mimeType: 'image/jpeg',
    sizeBytes: blob.size,
    width,
    height,
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Imagen inválida'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });
}

function drawToCanvas(img: HTMLImageElement): { canvas: HTMLCanvasElement; width: number; height: number } {
  const ratio = Math.min(1, TARGET_MAX_WIDTH / img.width);
  const width = Math.round(img.width * ratio);
  const height = Math.round(img.height * ratio);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas no soportado');
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, width, height };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const idx = result.indexOf(',');
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(new Error('No se pudo codificar la imagen'));
    reader.readAsDataURL(blob);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}