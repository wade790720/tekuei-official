/**
 * Any CSS colour string (hex, rgb(), oklab(), color(srgb …)) as [r, g, b] in 0–255.
 * Canvas and WebGL cannot read CSS variables, and a computed colour is not always rgb(),
 * so the browser paints it into one pixel and the pixel is read back.
 * @param {string} color  e.g. getComputedStyle(el).color
 */
export function cssRgb(color) {
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}
