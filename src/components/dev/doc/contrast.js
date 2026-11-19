// Live colour values and WCAG 2 contrast for the Color page.

/**
 * Resolve colour tokens to [r, g, b, a] (0–255, alpha 0–1). Aliases and color-mix() only resolve
 * on a painted element, and their computed form can be oklab(); a 1×1 canvas turns any of them into bytes.
 */
export function readColors(tokens) {
  const el = document.createElement('span')
  document.body.append(el)
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  const out = {}
  for (const t of tokens) {
    el.style.color = `var(${t})`
    const css = getComputedStyle(el).color
    const m = css.match(/^rgba?\(([^)]+)\)$/)
    if (m) {
      const [r, g, b, a = 1] = m[1].split(/[,\s/]+/).filter(Boolean).map(Number)
      out[t] = { rgba: [r, g, b, a], css }
      continue
    }
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = css
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
    out[t] = { rgba: [r, g, b, a / 255], css }
  }
  el.remove()
  return out
}

const over = ([r, g, b, a], [br, bg, bb]) => [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a)]

const lum = (rgb) =>
  rgb
    .map((v) => v / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0)

/** Contrast of a (possibly translucent) colour over an opaque background. */
export function ratio(fg, bg) {
  const base = bg.slice(0, 3)
  const [a, b] = [lum(over(fg, base)), lum(base)].sort((x, y) => y - x)
  return (a + 0.05) / (b + 0.05)
}

/** #rrggbb, plus the alpha as a percentage when it is not opaque. */
export function hex([r, g, b, a]) {
  const h = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
  return a < 0.995 ? `${h} · ${Math.round(a * 100)}%` : h
}
