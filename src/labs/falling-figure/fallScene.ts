// About page scene: a figure made of particles falls through the page.
// Each act is a stone slab with its text carved on it. The figure breaks through the slab when the act begins.
// Behaviour and numbers follow the scroll piece "Palindrome of a Fall" (github.com/0xkev21/palindrome-of-a-fall).
import Lenis from 'lenis'
import shatterSrc from './stone_shatter.mp3'

const SAMPLE_W = 420 // the figure picture is read at this width
const WAVE_SECONDS = 1.6
const NEAR_BLACK = '#0B0B0D'

const subFont = (s) => `700 ${s}px ui-monospace, "Cascadia Mono", Consolas, "Noto Sans TC", monospace`
const titleFont = (s) => `400 ${s}px "Instrument Serif", "Noto Serif TC", "Source Han Serif TC", serif`

// Smooth noise in 0..1, three layers. It shapes the impact dust into tall clouds.
const hash2 = (x, y) => {
  const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return v - Math.floor(v)
}
const noise = (x, y) => {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const u = x - xi
  const v = y - yi
  const a = u * u * (3 - 2 * u)
  const b = v * v * (3 - 2 * v)
  return (hash2(xi, yi) * (1 - a) + hash2(xi + 1, yi) * a) * (1 - b) + (hash2(xi, yi + 1) * (1 - a) + hash2(xi + 1, yi + 1) * a) * b
}
const fbm = (x, y) => noise(x, y) * 0.55 + noise(x * 2.1, y * 2.1) * 0.3 + noise(x * 4.3, y * 4.3) * 0.15

/**
 * @param {{
 *   canvas: HTMLCanvasElement,    fixed, covers the viewport
 *   figure: HTMLImageElement,     cutout of the falling figure (transparent background)
 *   sections: HTMLElement[],      one per act; the slab meets the figure when the section's top reaches it
 *   acts: { sub: string, title: string, side: number }[],   text carved on each slab; side shifts it by that share of the width
 *   progressDot?: HTMLElement,    its `top` is set to the scroll progress in percent
 *   onAct?: (index: number) => void,   index of the last slab the figure went through, or -1
 * }} options
 * @returns {{ destroy: () => void, setSound: (on: boolean) => void }}
 */
export function mountFallScene({ canvas, figure, sections, acts, progressDot, onAct }) {
  const ctx = canvas.getContext('2d')
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  const touch = matchMedia('(pointer: coarse)').matches || innerWidth <= 768
  let W, H, cx, cy, bx, by, S
  let fill = 0.88 // how much of the picture square the figure covers; measured in sample()
  let nx = 0
  let parts = []
  let sparks = []
  let streaks = []
  let walls = []
  let chips = []
  let dust = []
  let cloud = []
  let vel = 0
  let lastY = scrollY
  let shake = 0
  let waveStart = -1
  let shown = -2
  let raf = 0
  let dead = false

  // Slow, weighted scrolling: low lerp, calmer wheel.
  const lenis = reduce
    ? null
    : new Lenis({ lerp: touch ? 0.08 : 0.05, wheelMultiplier: 0.65, touchMultiplier: 1.6, syncTouch: true, smoothWheel: true })

  // Impact sound: a recording of stone breaking.
  // Browsers reject play() until the visitor clicks, taps or presses a key. Before that, impacts are silent.
  const crack = new Audio(shatterSrc)
  crack.preload = 'auto'
  crack.volume = 0.75
  let soundOn = true
  let lastCrack = 0
  function stoneCrack() {
    const now = performance.now()
    if (!soundOn || now - lastCrack < 280) return // never two hits on top of each other
    lastCrack = now
    crack.currentTime = 0
    crack.play().catch(() => {})
  }

  function resize() {
    W = canvas.clientWidth
    H = canvas.clientHeight
    const dpr = Math.min(devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    // The picture square is 52% of the width (380 to 620px); on phones 70% (220 to 320px).
    const square = W < 768 ? Math.min(320, Math.max(220, W * 0.7)) : Math.min(620, Math.max(380, W * 0.52))
    bx = W / 2
    by = H * 0.52
    cx = bx
    cy = by
    S = square * fill
    // Slipstream: 42 lines, each 30 to 115px long, rising 2.2 to 6.7px a frame even when the page is still.
    streaks = Array.from({ length: 42 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      len: 30 + Math.random() * 85,
      speed: 2.2 + Math.random() * 4.5,
      a: 0.08 + Math.random() * 0.22,
    }))
    buildWalls()
    buildBackground()
  }

  // Each slab is a wide stone tablet, cut into 4 x 2 fragments along a jittered grid.
  function buildWalls() {
    const mobile = W < 640
    const w = mobile ? Math.min(460, Math.max(280, W * 0.9)) : Math.min(980, Math.max(360, W * 0.82))
    const h = mobile ? Math.min(185, Math.max(130, w * 0.28)) : Math.min(210, Math.max(165, w * 0.22))
    const cols = 4
    const rows = 2
    const cw = w / cols
    const ch = h / rows
    const maxText = w - 70
    const fit = (font, size, text, spacing) => {
      ctx.font = font(size)
      const m = ctx.measureText(text).width + text.length * size * spacing
      return m > maxText ? Math.floor((size * maxText) / m) : size
    }
    walls = sections.map((section, n) => {
      const P = []
      for (let r = 0; r <= rows; r++)
        for (let c = 0; c <= cols; c++)
          P.push([
            -w / 2 + c * cw + (c === 0 || c === cols ? 0 : (Math.random() - 0.5) * cw * 0.45),
            -h / 2 + r * ch + (r === 0 || r === rows ? 0 : (Math.random() - 0.5) * ch * 0.45),
          ])
      const chunks = []
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const k = r * (cols + 1) + c
          const poly = [P[k], P[k + 1], P[k + cols + 2], P[k + cols + 1]]
          const mx = (poly[0][0] + poly[1][0] + poly[2][0] + poly[3][0]) / 4
          const my = (poly[0][1] + poly[1][1] + poly[2][1] + poly[3][1]) / 4
          const d = Math.hypot(mx, my) || 1
          chunks.push({ poly, mx, my, dx: mx / d, dy: my / d, rot: (Math.random() - 0.5) * 0.6, dist: 80 + Math.random() * 120 })
        }
      const act = acts[n]
      return {
        ...act,
        top: section.offsetTop,
        w,
        h,
        chunks,
        hit: false,
        subSize: Math.max(8, fit(subFont, Math.round(Math.min(12, Math.max(9, w * 0.014))), act.sub, 0.3)),
        titleSize: Math.max(14, fit(titleFont, Math.round(Math.min(42, Math.max(20, w * 0.046))), act.title, 0.03)),
      }
    })
  }

  // Background, at rest: a few faint points that drift up slowly. They wrap around at the top.
  // Background, on impact: a hidden field of cloud-shaped dust. It shows only while a wave is crossing the screen.
  function buildBackground() {
    dust = Array.from({ length: Math.round((W * H) / 1700) }, () => {
      const a = 0.1 + Math.random() * 0.3
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        seed: Math.random(),
        a,
        rise: 0.12 + Math.random() * 0.4,
        size: 1 + Math.random() * 1.4,
        col: `rgba(120,150,210,${a.toFixed(2)})`,
      }
    })
    dust.sort((p, o) => (p.col < o.col ? -1 : p.col > o.col ? 1 : 0))
    const gap = W < 768 ? 9 : 7
    const scale = W < 768 ? 0.72 : 1
    cloud = []
    for (let y = gap / 2; y < H; y += gap)
      for (let x = gap / 2; x < W; x += gap) {
        // darker near the figure, so the figure stays clear
        const away = Math.hypot((x - W / 2) / (W * 0.5), (y - H * 0.52) / (H * 0.6))
        const lum = fbm(x * 0.0045, y * 0.0016) * Math.min(1, 0.2 + away * 0.8)
        const k = Math.max(0, Math.min(1, (lum - 0.34) / 0.3))
        if (k < 0.05) continue
        const seed = Math.random()
        cloud.push({
          x,
          y,
          seed,
          a: k * k * (3 - 2 * k) * (0.45 + lum * 0.55) * 0.55,
          r: Math.round(40 + lum * 70),
          g: Math.round(62 + lum * 90),
          b: Math.round(110 + lum * 120),
          size: (1.5 + lum * 1.8 + seed * 0.6) * scale,
        })
      }
  }

  // Turn the cutout into particles. The picture's own colour, under a cool light, with a blue rim.
  function sample() {
    const SH = Math.round((SAMPLE_W * figure.naturalHeight) / figure.naturalWidth)
    const c = document.createElement('canvas')
    c.width = SAMPLE_W
    c.height = SH
    const x = c.getContext('2d')
    x.drawImage(figure, 0, 0, SAMPLE_W, SH)
    const d = x.getImageData(0, 0, SAMPLE_W, SH).data
    const A = (px, py) => (px < 0 || py < 0 || px >= SAMPLE_W || py >= SH ? 0 : d[(py * SAMPLE_W + px) * 4 + 3])
    const pool = []
    let x0 = SAMPLE_W
    let x1 = 0
    let y0 = SH
    let y1 = 0
    for (let py = 0; py < SH; py++)
      for (let px = 0; px < SAMPLE_W; px++) {
        if (A(px, py) < 90) continue
        pool.push(py * SAMPLE_W + px)
        x0 = Math.min(x0, px)
        x1 = Math.max(x1, px)
        y0 = Math.min(y0, py)
        y1 = Math.max(y1, py)
      }
    const span = Math.max(x1 - x0, y1 - y0)
    const mx = (x0 + x1) / 2
    const my = (y0 + y1) / 2
    fill = span / SAMPLE_W
    const q = (v) => Math.min(255, Math.round(v / 12) * 12) // fewer distinct colours, so drawing changes style less often
    const count = W < 900 ? 9000 : 20000
    parts = []
    for (let n = 0; n < count; n++) {
      const i = pool[Math.floor(Math.random() * pool.length)]
      const px = i % SAMPLE_W
      const py = (i / SAMPLE_W) | 0
      const k = i * 4
      const edge = A(px - 5, py) < 90 || A(px + 5, py) < 90 || A(px, py - 5) < 90 || A(px, py + 5) < 90 ? 1 : 0
      const lum = (d[k] * 0.3 + d[k + 1] * 0.59 + d[k + 2] * 0.11) / 255
      const lift = 34 * (1 - lum)
      const rim = edge * 0.25 * 255
      const r = q(d[k] * 0.85 + lift * 0.7 + rim * 0.18)
      const g = q(d[k + 1] * 0.94 + lift * 0.95 + rim * 0.28)
      const b = q(d[k + 2] * 1.08 + lift * 1.5 + rim * 0.45)
      parts.push({ bx: (px - mx) / span, by: (py - my) / span, seed: Math.random(), edge, size: 1.3 + lum * 1.5, col: `rgb(${r},${g},${b})` })
    }
    parts.sort((p, o) => (p.col < o.col ? -1 : p.col > o.col ? 1 : 0))
  }

  // The carved face of a slab: stone, an inset frame, a small line and a large line.
  function slabFace(wall) {
    const g = ctx.createLinearGradient(-wall.w / 2, -wall.h / 2, wall.w / 2, wall.h / 2)
    g.addColorStop(0, '#1c1f26')
    g.addColorStop(0.5, '#15171d')
    g.addColorStop(1, '#0e1014')
    ctx.fillStyle = g
    ctx.fillRect(-wall.w / 2, -wall.h / 2, wall.w, wall.h)
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1.5
    ctx.strokeRect(-wall.w / 2 + 14, -wall.h / 2 + 14, wall.w - 28, wall.h - 28)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0,0,0,0.95)'
    ctx.font = subFont(wall.subSize)
    ctx.letterSpacing = '0.3em'
    ctx.fillStyle = 'rgba(186,215,255,0.92)'
    ctx.shadowBlur = 6
    ctx.fillText(wall.sub, 0, -wall.h * 0.24)
    ctx.font = titleFont(wall.titleSize)
    ctx.letterSpacing = '0.03em'
    ctx.fillStyle = '#ffffff'
    ctx.shadowBlur = 12
    ctx.fillText(wall.title, 0, wall.h * 0.1)
    ctx.shadowBlur = 0
    ctx.letterSpacing = '0px'
  }
  const tracePoly = (poly) => {
    ctx.beginPath()
    poly.forEach((p, i) => ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1]))
    ctx.closePath()
  }

  function drawWalls(now) {
    let passed = -1
    walls.forEach((wall, n) => {
      const sy = wall.top + by - scrollY // the slab is level with the figure when its act begins
      // Contact starts when the top edge of the slab reaches the lower body. Nothing breaks before that.
      const dist = sy - (wall.h * 0.48 + 25) - by
      if (dist <= 0) passed = n
      if (sy < -300 || sy > H + 300) return
      const wx = W * 0.5 + wall.side * W + nx * 10
      let shatter = 0
      if (dist <= 0) shatter = Math.pow(Math.min(1, -dist / 220), 1.4) // speeds up outward after contact
      if (dist <= 0 && dist >= -45 && !wall.hit) {
        wall.hit = true
        for (let i = 0; i < 24; i++) {
          const a = Math.random() * Math.PI * 2
          const sp = 2 + Math.random() * 6
          chips.push({
            x: wx + (Math.random() - 0.5) * 80,
            y: by + 30 + (Math.random() - 0.5) * 40,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp + 2,
            size: 2 + Math.random() * 4,
            rot: Math.random() * 6.28,
            spin: (Math.random() - 0.5) * 0.2,
            alpha: 1,
          })
        }
        if (!reduce) shake = Math.max(shake, 0.55)
        waveStart = now
        stoneCrack()
      } else if (dist > 60 && wall.hit) wall.hit = false
      // Broken fragments fade to dust, so they do not pile up at the screen edges.
      const alpha = Math.max(0, 1 - Math.pow(shatter, 1.5) * 0.94)
      if (alpha < 0.02) return
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(wx, sy)
      if (shatter < 0.005) {
        slabFace(wall)
        ctx.restore()
        return
      }
      for (const c of wall.chunks) {
        const ox = c.dx * c.dist * shatter
        const oy = c.dy * c.dist * 0.6 * shatter + shatter * 45
        const rot = c.rot * shatter
        const place = () => {
          ctx.translate(c.mx + ox, c.my + oy)
          ctx.rotate(rot)
          ctx.translate(-c.mx, -c.my)
        }
        // each fragment carries its part of the carving
        ctx.save()
        place()
        tracePoly(c.poly)
        ctx.clip()
        slabFace(wall)
        ctx.restore()
        ctx.save()
        place()
        tracePoly(c.poly)
        ctx.strokeStyle = `rgba(230,238,250,${(Math.max(0.1, 0.85 - shatter * 0.7) * 0.55).toFixed(3)})`
        ctx.lineWidth = 1.4
        ctx.stroke()
        ctx.restore()
      }
      ctx.restore()
    })
    if (passed !== shown) {
      shown = passed
      onAct?.(passed)
    }
  }

  function frame(now) {
    if (dead) return
    if (lenis) lenis.raf(now)
    const t = now / 1000
    vel += (scrollY - lastY - vel) * 0.16
    lastY = scrollY
    const av = Math.min(46, Math.abs(vel))
    const dir = vel < -0.6 ? -1 : 1 // the fall reverses only on a real scroll up
    ctx.clearRect(0, 0, W, H)

    // After an impact a wave leaves the figure and crosses the screen.
    const wave = waveStart < 0 ? -1 : (now - waveStart) / 1000
    const waveAmp = wave < 0 || wave > WAVE_SECONDS ? 0 : 0.35 * (1 - wave / WAVE_SECONDS)
    const reach = wave * Math.max(W, H) * 0.9
    // Strength of the wave at a point: a 70px band at distance `reach` from the figure.
    const ringAt = (x, y) => {
      const band = (Math.hypot(x - cx, y - cy) - reach) / 70
      return Math.exp(-band * band) * waveAmp
    }
    const pushOut = (x, y, ring) => {
      const dx = x - cx
      const dy = y - cy
      const od = Math.hypot(dx, dy) + 0.0001
      return [x + (dx / od) * ring * 46, y + (dy / od) * ring * 46]
    }

    // Slow rising dust. Scrolling adds to its speed; scrolling up reverses it.
    let style = ''
    for (const p of dust) {
      p.y -= p.rise * dir + vel * (0.12 + p.seed * 0.08) * 0.25
      if (p.y < -6) {
        p.y = H + 6
        p.x = Math.random() * W
      } else if (p.y > H + 6) {
        p.y = -6
        p.x = Math.random() * W
      }
      let x = p.x + Math.sin(t * (0.5 + p.seed) + p.seed * 6.28) * 3
      let y = p.y
      const ring = waveAmp > 0 ? ringAt(x, y) : 0
      if (ring > 0.01) {
        ;[x, y] = pushOut(x, y, ring)
        ctx.fillStyle = style = `rgba(${(120 + ring * 84) | 0},${(150 + ring * 115) | 0},${(210 + ring * 45) | 0},${Math.max(p.a, ring * 1.4).toFixed(3)})`
        ctx.fillRect(x, y, p.size + ring * 2, p.size + ring * 2)
        continue
      }
      if (p.col !== style) {
        ctx.fillStyle = p.col
        style = p.col
      }
      ctx.fillRect(x, y, p.size, p.size)
    }
    // The cloud field fades in fast when a wave starts, and fades out as the wave dies.
    // Where the wave front is, its points are pushed outward, grow and brighten.
    if (waveAmp > 0) {
      const show = Math.min(1, wave / 0.12) * Math.pow(1 - wave / WAVE_SECONDS, 0.8)
      for (const p of cloud) {
        const fs = 1.2 + p.seed * 1.5
        let x = p.x + Math.sin(t * fs + (p.y / H) * 6 + p.seed * 6.28) * 4
        let y = p.y + Math.cos(t * fs * 0.9 + (p.x / W) * 5 + p.seed * 6.28) * 4.5
        const ring = ringAt(x, y)
        if (ring > 0.01) [x, y] = pushOut(x, y, ring)
        ctx.fillStyle = `rgba(${Math.min(255, (p.r + ring * 84) | 0)},${Math.min(255, (p.g + ring * 115) | 0)},${Math.min(255, (p.b + ring * 153) | 0)},${Math.max(p.a * show, ring * 0.5).toFixed(3)})`
        ctx.fillRect(x, y, p.size + ring * 2, p.size + ring * 2)
      }
    }

    // The environment shakes on impact. The figure is drawn after this block and stays steady.
    ctx.save()
    shake *= 0.88
    if (shake < 0.01) shake = 0
    ctx.translate((Math.random() - 0.5) * 18 * shake, (Math.random() - 0.5) * 14 * shake)
    const rush = Math.min(6, 1 + av * 0.14)
    ctx.lineWidth = 1
    for (const s of streaks) {
      s.y -= s.speed * rush * dir
      if (s.y < -120) s.y = H + 120
      else if (s.y > H + 120) s.y = -120
      ctx.strokeStyle = `rgba(215,235,255,${(s.a * 0.9).toFixed(3)})`
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      ctx.lineTo(s.x, s.y + s.len * dir)
      ctx.stroke()
    }
    drawWalls(now)
    chips = chips.filter((c) => c.alpha >= 0.02)
    for (const c of chips) {
      c.x += c.vx
      c.y += c.vy
      c.rot += c.spin
      c.alpha *= 0.96
      ctx.save()
      ctx.translate(c.x, c.y)
      ctx.rotate(c.rot)
      ctx.fillStyle = `rgba(220,225,235,${c.alpha.toFixed(3)})`
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size)
      ctx.restore()
    }
    ctx.restore()

    // The figure bobs a little and leans toward the pointer. The wave also lights the body as it leaves.
    cx = bx + (touch ? 0 : nx * 18)
    cy = by + (touch ? 0 : Math.sin(t * 1.5) * 6)
    const lit = []
    const ang = Math.sin(t * 0.35) * 0.05
    const ca = Math.cos(ang)
    const sa = Math.sin(ang)
    style = ''
    for (const p of parts) {
      let x = (p.bx * ca - p.by * sa) * S
      let y = (p.bx * sa + p.by * ca) * S
      const fs = 1.4 + p.seed * 1.6
      x += Math.sin(t * fs + p.by * 6 + p.seed * 6.28) * S * 0.012
      y += Math.cos(t * fs * 0.9 + p.bx * 6 + p.seed * 6.28) * S * 0.015
      const ring = waveAmp > 0 ? Math.exp(-(((Math.hypot(x, y) - wave * 650) / 55) ** 2)) * waveAmp : 0
      y -= vel * (0.25 + p.seed * 0.18) // slipstream stretch
      if (p.edge) {
        // the outline peels off into the airflow
        y -= dir * S * (0.018 + p.seed * 0.03) * (0.5 + av * 0.05)
        x += (p.seed - 0.5) * S * 0.018
      }
      x += cx
      y += cy
      if (p.col !== style) {
        ctx.fillStyle = p.col
        style = p.col
      }
      ctx.fillRect(x, y, p.size, p.size)
      if (ring > 0.02) lit.push(x, y, p.size, ring)
      if (p.edge && sparks.length < 320 && Math.random() < 0.0005 * (1 + av * 0.5))
        sparks.push({ x, y, vx: (Math.random() - 0.5) * 0.7, vy: -dir * (0.8 + Math.random() * 1.6 + av * 0.2), life: 1, fade: 0.008 + Math.random() * 0.014 })
    }
    if (lit.length) {
      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < lit.length; i += 4) {
        ctx.fillStyle = `rgba(115,184,255,${Math.min(1, lit[i + 3] * 1.6).toFixed(3)})`
        ctx.fillRect(lit[i] - 0.5, lit[i + 1] - 0.5, lit[i + 2] + 1, lit[i + 2] + 1)
      }
      ctx.globalCompositeOperation = 'source-over'
    }
    sparks = sparks.filter((s) => s.life > 0)
    for (const s of sparks) {
      s.x += s.vx
      s.y += s.vy
      s.vy *= 0.985
      s.life -= s.fade
      ctx.fillStyle = `rgba(200,222,255,${(s.life * 0.9).toFixed(3)})`
      ctx.fillRect(s.x, s.y, 1.6, 1.6)
    }

    if (progressDot) {
      const max = document.documentElement.scrollHeight - innerHeight
      progressDot.style.top = `calc(${max > 0 ? (scrollY / max) * 100 : 0}% - 3px)`
    }
    if (!reduce) raf = requestAnimationFrame(frame) // with reduced motion: one still frame
  }

  const onMouseMove = (e) => {
    nx = (e.clientX / W) * 2 - 1
  }
  const onMouseLeave = () => {
    nx = 0
  }
  const onResize = () => {
    resize()
    sample()
    if (reduce) requestAnimationFrame(frame)
  }

  canvas.style.background = `radial-gradient(60% 50% at 50% 46%, rgba(40,62,110,.28), rgba(11,11,13,0) 70%), ${NEAR_BLACK}`
  Promise.all([figure.decode().catch(() => {}), document.fonts.ready]).then(() => {
    if (dead) return
    resize()
    sample()
    resize() // the second pass uses the fill measured by sample
    addEventListener('resize', onResize)
    addEventListener('mousemove', onMouseMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onMouseLeave)
    raf = requestAnimationFrame(frame)
  })

  return {
    setSound(on) {
      soundOn = on
      if (!on) crack.pause()
    },
    destroy() {
      dead = true
      cancelAnimationFrame(raf)
      lenis?.destroy()
      crack.pause()
      removeEventListener('resize', onResize)
      removeEventListener('mousemove', onMouseMove)
      document.documentElement.removeEventListener('mouseleave', onMouseLeave)
    },
  }
}
