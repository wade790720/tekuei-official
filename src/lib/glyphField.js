// Glyph rain behind a page header. Behaviour and numbers follow the MatrixRain header on aiforui.dev:
// a 1200 x 400 field, 25 rows of 16px, columns 1.7 glyphs wide, one step every 90 ms.
// Colours come from CSS: `color` for the rain, `--glyph-glow` for glyphs lit by the pointer.

const WIDTH = 1200
const HEIGHT = 400
const ROW_H = 16
const ROWS = HEIGHT / ROW_H
const GLYPHS = 'AISDPEL01<>=+*-#$'
const STEP_MS = 90
const HEAD_ALPHA = 0.8
const TRAIL_DECAY = 0.94 // a lit glyph keeps this share of its alpha each step, down to its floor
const GLOW_DECAY = 0.82
const REACH = 44 // pointer radius in px

const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
const fill = (make) => Array.from({ length: ROWS }, make)

/**
 * @param {HTMLCanvasElement} canvas  CSS size must be 1200 x 400
 * @returns {() => void} cleanup
 */
export function mountGlyphField(canvas) {
  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = WIDTH * dpr
  canvas.height = HEIGHT * dpr
  ctx.scale(dpr, dpr)
  const font = `12px ${getComputedStyle(canvas).fontFamily}`
  ctx.font = font
  const colW = ctx.measureText('0').width * 1.7
  const cols = Math.ceil(WIDTH / colW)

  // A drop falls down its column to maxRow, then starts again above the top.
  // Most restarts keep the column's depth and brightness, so columns hold their character.
  const restart = (col, first = false) => {
    col.head = first ? Math.random() * ROWS * 2 : -Math.random() * ROWS * 1.5
    col.speed = 0.25 + Math.random() * 0.75
    if (first || Math.random() < 0.2) {
      col.maxRow = Math.floor(ROWS * (0.35 + Math.random() * 0.65))
      col.brightness = 0.5 + Math.random() * 0.5
    }
  }
  const columns = Array.from({ length: cols }, () => {
    const col = {
      chars: fill(glyph),
      alphas: fill(() => 0),
      floors: fill(() => 0.04 + Math.random() * 0.08), // glyphs a drop has passed never go fully dark
      glows: fill(() => 0),
    }
    restart(col, true)
    return col
  })

  function step() {
    for (const col of columns) {
      col.head += col.speed
      const head = Math.floor(col.head)
      for (let r = 0; r <= col.maxRow; r++)
        if (col.alphas[r] > 0) col.alphas[r] = Math.max(col.alphas[r] * TRAIL_DECAY, col.floors[r])
      if (head >= 0 && head <= col.maxRow && head < ROWS) col.alphas[head] = HEAD_ALPHA
      for (let r = 0; r < ROWS; r++)
        if (col.glows[r] > 0) col.glows[r] = col.glows[r] < 0.03 ? 0 : col.glows[r] * GLOW_DECAY
      if (Math.random() < 0.4) col.chars[Math.floor(Math.random() * ROWS)] = glyph()
      if (head > col.maxRow + 4) restart(col)
    }
  }

  function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    ctx.font = font
    ctx.textBaseline = 'top'
    const style = getComputedStyle(canvas)
    const rain = style.color
    const glow = style.getPropertyValue('--glyph-glow').trim() || rain
    let current = rain
    ctx.fillStyle = rain
    for (let c = 0; c < cols; c++) {
      const col = columns[c]
      for (let r = 0; r < ROWS; r++) {
        const lit = col.alphas[r] * col.brightness
        const g = col.glows[r]
        const a = Math.max(lit, g)
        if (a < 0.02) continue
        const colour = g > lit ? glow : rain
        if (colour !== current) {
          ctx.fillStyle = colour
          current = colour
        }
        ctx.globalAlpha = a
        ctx.fillText(col.chars[r], c * colW, r * ROW_H)
      }
    }
    ctx.globalAlpha = 1
  }

  // Run ahead so the field is already full on the first frame.
  for (let i = 0; i < ROWS * 4; i++) step()
  draw()

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.fonts.ready.then(draw)
    return () => {}
  }

  let raf = 0
  let last = 0
  let onScreen = true
  const loop = (now) => {
    raf = requestAnimationFrame(loop)
    if (now - last < STEP_MS) return
    last = now
    step()
    draw()
  }
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !onScreen) raf = requestAnimationFrame(loop)
    if (!entry.isIntersecting) cancelAnimationFrame(raf)
    onScreen = entry.isIntersecting
  })

  // Glyphs within REACH of the pointer light up at once, then fade with GLOW_DECAY.
  let redraw = false
  const onMove = (e) => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (x < -REACH || x > WIDTH + REACH || y < -REACH || y > HEIGHT + REACH) return
    const c0 = Math.max(0, Math.floor((x - REACH) / colW))
    const c1 = Math.min(cols - 1, Math.ceil((x + REACH) / colW))
    const r0 = Math.max(0, Math.floor((y - REACH) / ROW_H))
    const r1 = Math.min(ROWS - 1, Math.ceil((y + REACH) / ROW_H))
    for (let c = c0; c <= c1; c++)
      for (let r = r0; r <= r1; r++) {
        const d = Math.hypot(c * colW + colW / 2 - x, r * ROW_H + ROW_H / 2 - y)
        if (d > REACH) continue
        columns[c].glows[r] = Math.max(columns[c].glows[r], 0.95 * (1 - d / REACH) ** 1.5)
      }
    if (redraw) return
    redraw = true
    requestAnimationFrame(() => {
      redraw = false
      draw()
    })
  }

  io.observe(canvas)
  window.addEventListener('pointermove', onMove, { passive: true })
  raf = requestAnimationFrame(loop)

  return () => {
    cancelAnimationFrame(raf)
    io.disconnect()
    window.removeEventListener('pointermove', onMove)
  }
}
