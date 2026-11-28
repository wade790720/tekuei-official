// An engraving that assembles from fragments, left to right, then holds still.
// Every STEP px of the image becomes one 2x2 fragment that flies in from the right.
// Brightness becomes alpha (black = transparent), so the sea sits on any dark background.

const STEP = 2
const SWEEP = 1.9
const FLY = 0.9
const FADE = 0.35
const DARK = 75
const SLOT = 0.05

interface Fragment {
  x: number
  y: number
  rgb: number
  alpha: number
  sx: number
  sy: number
  /** Start time in s. */
  d: number
  /** Flight time in s. */
  dur: number
}

export interface ShatterImageOptions {
  src: string
  /** [x, y, w, h] in source pixels. */
  crop: readonly [number, number, number, number]
  onPlay?: () => void
}

function rng(seed: number) {
  return () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296
}

const ease = (t: number) => 1 - Math.pow(1 - t, 3)
const pack = (r: number, g: number, b: number, a: number) => ((a << 24) | (b << 16) | (g << 8) | r) >>> 0 // little-endian RGBA

/** `canvas` is sized by CSS. Returns the cleanup. */
export function mountShatterImage(canvas: HTMLCanvasElement, { src, crop, onPlay }: ShatterImageOptions): () => void {
  const maybeCtx = canvas.getContext('2d')
  if (!maybeCtx) {
    onPlay?.()
    return () => {}
  }
  const ctx: CanvasRenderingContext2D = maybeCtx
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const source = new Image()
  source.src = src
  let W = 0
  let H = 0
  let final = document.createElement('canvas')
  let slots: Fragment[][] = []
  let buf = new ImageData(1, 1)
  let data32 = new Uint32Array(0)
  let last = 0
  let raf = 0
  let start = 0
  let played = false
  let pausedAt = 0
  let disposed = false

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    W = canvas.width = Math.round(canvas.clientWidth * dpr)
    H = canvas.height = Math.round(canvas.clientHeight * dpr)

    final = document.createElement('canvas')
    final.width = W
    final.height = H
    const g = final.getContext('2d', { willReadFrequently: true })
    if (!g) return
    g.drawImage(source, ...crop, 0, 0, W, H)
    const img = g.getImageData(0, 0, W, H)
    const px = img.data
    for (let i = 0; i < px.length; i += 4) {
      const m = Math.max(px[i], px[i + 1], px[i + 2])
      if (px[i] + px[i + 1] + px[i + 2] < DARK) {
        px[i + 3] = 0
        continue
      }
      px[i] = (px[i] * 255) / m
      px[i + 1] = (px[i + 1] * 255) / m
      px[i + 2] = (px[i + 2] * 255) / m
      px[i + 3] = m
    }
    g.putImageData(img, 0, 0)

    const R = rng(42)
    slots = []
    last = 0
    for (let y = 0; y < H; y += STEP)
      for (let x = 0; x < W; x += STEP) {
        const i = (y * W + x) * 4
        if (px[i + 3] === 0) continue
        const ragged = Math.sin(y * 0.045) * 0.05 + Math.sin(y * 0.13 + 2) * 0.03
        const p: Fragment = {
          x,
          y,
          rgb: pack(px[i], px[i + 1], px[i + 2], 0),
          alpha: px[i + 3],
          sx: x + (60 + R() * 260) * dpr,
          sy: y + (R() - 0.5) * 160 * dpr,
          d: Math.max(0, (x / W + ragged) * SWEEP + (R() - 0.5) * 0.35),
          dur: FLY * (0.6 + R() * 0.6),
        }
        ;(slots[Math.floor(p.d / SLOT)] ??= []).push(p)
        last = Math.max(last, p.d + p.dur)
      }
    buf = ctx.createImageData(W, H)
    data32 = new Uint32Array(buf.data.buffer)
  }

  const showFinal = () => ctx.drawImage(final, 0, 0)

  function frame(now: number) {
    const t = (now - start) / 1000
    data32.fill(0)
    for (let s = 0; s < slots.length && s * SLOT < t; s++)
      for (const p of slots[s] ?? []) {
        let k = (t - p.d) / p.dur
        if (k <= 0) continue
        if (k > 1) k = 1
        const e = ease(k)
        const x = Math.round(p.sx + (p.x - p.sx) * e)
        const y = Math.round(p.sy + (p.y - p.sy) * e)
        if (x < 0 || y < 0 || x >= W - 1 || y >= H - 1) continue
        const a = Math.min(1, k * 1.6)
        const col = (p.rgb | (((p.alpha * a) | 0) << 24)) >>> 0
        const i = y * W + x
        data32[i] = data32[i + 1] = data32[i + W] = data32[i + W + 1] = col
      }
    ctx.putImageData(buf, 0, 0)
    const f = (t - last) / FADE
    if (f > 0) {
      ctx.globalAlpha = Math.min(1, f)
      showFinal()
      ctx.globalAlpha = 1
      if (f >= 1) {
        raf = 0
        return
      }
    }
    raf = requestAnimationFrame(frame)
  }

  function play() {
    played = true
    onPlay?.()
    if (reduce) return showFinal()
    start = performance.now()
    raf = requestAnimationFrame(frame)
  }

  const io = new IntersectionObserver(
    (entries) => {
      const e = entries[0]
      if (!e) return
      if (!played) {
        if (e.isIntersecting) play()
      } else if (!e.isIntersecting && raf) {
        cancelAnimationFrame(raf)
        raf = 0
        pausedAt = performance.now()
      } else if (e.isIntersecting && pausedAt) {
        start += performance.now() - pausedAt
        pausedAt = 0
        raf = requestAnimationFrame(frame)
      }
    },
    { threshold: 0.35 },
  )

  let rt: ReturnType<typeof setTimeout> | undefined
  const onResize = () => {
    clearTimeout(rt)
    rt = setTimeout(() => {
      build()
      if (played && !raf) {
        pausedAt = 0
        showFinal()
      }
    }, 200)
  }

  source
    .decode()
    .then(() => {
      if (disposed) return
      build()
      io.observe(canvas)
      window.addEventListener('resize', onResize)
    })
    .catch(() => onPlay?.())

  return () => {
    disposed = true
    io.disconnect()
    cancelAnimationFrame(raf)
    clearTimeout(rt)
    window.removeEventListener('resize', onResize)
  }
}
