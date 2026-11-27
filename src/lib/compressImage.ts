// Shrinks an image in the browser so it passes functions/api/upload.js (JPG, PNG, WEBP, 1MB max).
// 2000px on the long edge is wider than the post column at 2× density, so the loss does not show.

export const MAX_IMAGE_BYTES = 1024 * 1024
const MAX_EDGE = 2000
const KEEP_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))

// Safari cannot encode WEBP and quietly returns PNG, so fall back to JPEG there.
async function encode(canvas: HTMLCanvasElement, quality: number) {
  const webp = await toBlob(canvas, 'image/webp', quality)
  if (webp?.type === 'image/webp') return webp
  return toBlob(canvas, 'image/jpeg', quality)
}

/**
 * Returns a file the upload API accepts. Small JPG, PNG and WEBP files pass through unchanged.
 * Anything else is resized and re-encoded, with lower quality and size until it fits.
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) throw new Error('只支援圖片檔')
  if (KEEP_TYPES.includes(file.type) && file.size <= MAX_IMAGE_BYTES) return file

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('瀏覽器讀不了這個格式，請改用 JPG、PNG 或 WEBP')
  }
  try {
    let scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    let quality = 0.85
    while (scale * Math.max(bitmap.width, bitmap.height) >= 200) {
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(bitmap.width * scale)
      canvas.height = Math.round(bitmap.height * scale)
      canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      const blob = await encode(canvas, quality)
      if (blob && blob.size <= MAX_IMAGE_BYTES) {
        const name = file.name.replace(/\.[^.]*$/, '') || 'image'
        return new File([blob], `${name}.${blob.type === 'image/webp' ? 'webp' : 'jpg'}`, { type: blob.type })
      }
      if (quality > 0.6) quality -= 0.15
      else scale *= 0.75
    }
    throw new Error('圖片壓不到 1MB 以下')
  } finally {
    bitmap.close()
  }
}
