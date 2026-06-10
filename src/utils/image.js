/**
 * Read a photo file and return a data URL, downscaling large images so the
 * final JSON payload stays well under Vercel's ~4.5 MB request body limit.
 * Falls back to the raw data URL if the image can't be decoded (e.g. HEIC on
 * older browsers) — but rejects anything that would still be too large.
 */
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;
const MAX_RAW_BYTES = 3 * 1024 * 1024; // 3 MB cap for non-compressible fallback

export async function readPhotoFile(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('read-failed'));
    reader.readAsDataURL(file);
  });

  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('decode-failed'));
      i.src = dataUrl;
    });

    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    // Small file already at a reasonable size — keep as-is
    if (scale === 1 && file.size <= 1.5 * 1024 * 1024) return dataUrl;

    const canvas = document.createElement('canvas');
    canvas.width  = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } catch {
    // Couldn't decode (unsupported format) — only allow if small enough
    if (file.size > MAX_RAW_BYTES) {
      throw new Error('too-large');
    }
    return dataUrl;
  }
}
