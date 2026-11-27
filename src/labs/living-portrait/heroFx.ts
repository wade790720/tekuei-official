// Hover on the figure: tracking boxes with ASCII and a second picture.
// Double-click on the figure: glitch, then the second picture for two seconds with sparks on its outline.
// Image geometry (IW/IH and the focus points in layout) fits bg.webp, cut.webp and alt.webp in this folder.

const IW = 1672
const IH = 941
const MAX_W = 1920 // keep in step with --page-max in tokens.css
const SW = 418 // images are read at this small size for hit tests and ASCII colour
const SH = 235
const CW = 7
const CHH = 10
const RAMP = ' .:-=+*#%@'
const TAGS = ['TRACK', 'SCAN', 'ID 07', 'ID 12', 'ID 23', 'EDGE', 'NODE']
const NEON = ['rgba(77,232,255,', 'rgba(255,60,140,', 'rgba(181,107,255,', 'rgba(244,238,231,']
const FONT = '500 9px ui-monospace,Consolas,monospace'
const T_IN = 600
const T_HOLD = 2000
const T_OUT = 400

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const snap = (v) => Math.round(v / 8) * 8
const hash = (s, k) => {
  const v = Math.sin(s + k * 12.9898) * 43758.5453
  return v - Math.floor(v)
}
const small = (im) => {
  const c = document.createElement('canvas')
  c.width = SW
  c.height = SH
  const x = c.getContext('2d')
  x.drawImage(im, 0, 0, SW, SH)
  return x.getImageData(0, 0, SW, SH).data
}

/**
 * @param {{ root: HTMLElement, bg: HTMLImageElement, cut: HTMLImageElement, alt: HTMLImageElement, canvas: HTMLCanvasElement }} els
 *   cut = the figure on a transparent background (its alpha is the hover range). alt = the second picture.
 * @returns {() => void} cleanup
 */
export function mountHeroFx({ root, bg, cut, alt, canvas }) {
  const ctx = canvas.getContext('2d')
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  let W, H, ox, oy, dw, dh, mk, ad, sb
  let ptr = null
  let boxes = []
  let edge = []
  let flow = []
  let embers = []
  let running = false
  let userMoved = false
  let lastSpawn = 0
  let cap = 4
  let swap = 0
  let dead = false
  let sweepTimer, resizeTimer

  const idx = (x, y) =>
    (clamp(Math.floor(((y - oy) / dh) * SH), 0, SH - 1) * SW + clamp(Math.floor(((x - ox) / dw) * SW), 0, SW - 1)) * 4
  const onSubject = (x, y) => mk[idx(x, y) + 3] > 128

  function layout() {
    // The canvas fills the stage, which livingPortrait.css keeps inside --page-max.
    W = canvas.clientWidth
    H = canvas.clientHeight
    const narrow = W < 700
    // The picture covers the full-screen banner.
    const s = Math.max(Math.min(W, MAX_W) / IW, H / IH)
    dw = IW * s
    dh = IH * s
    ox = narrow ? clamp(W / 2 - 0.55 * dw, W - dw, 0) : (W - dw) / 2
    oy = 0
    for (const im of [bg, cut, alt]) {
      im.style.left = `${ox}px`
      im.style.top = `${oy}px`
      im.style.width = `${dw}px`
      im.style.height = `${dh}px`
    }
    const dpr = Math.min(devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    buildEdge()
  }

  // Outline points of the second picture, in screen space. Sparks run along them.
  function buildEdge() {
    edge = []
    const A = (x, y) => ad[(y * SW + x) * 4 + 3] > 128
    for (let y = 1; y < SH - 1; y++)
      for (let x = 1; x < SW - 1; x++)
        if (A(x, y) && !(A(x - 1, y) && A(x + 1, y) && A(x, y - 1) && A(x, y + 1)))
          edge.push([ox + ((x + 0.5) / SW) * dw, oy + ((y + 0.5) / SH) * dh])
    const xs = edge.map((p) => p[0])
    const ys = edge.map((p) => p[1])
    sb = { x: Math.max(0, Math.min(...xs)), y: Math.max(0, Math.min(...ys)), r: Math.min(W, Math.max(...xs)), b: H }
  }

  // Boxes appear only while the pointer is on the figure. A box may stick out past the figure's edge.
  function spawn(now) {
    if (swap || now - lastSpawn < 85 || boxes.length >= cap || !onSubject(ptr.x, ptr.y)) return
    lastSpawn = now
    cap = 4 + (Math.random() < 0.5)
    const w = snap(32 + Math.random() * 112)
    const h = snap(24 + Math.random() * 80)
    const cx = ptr.x + (Math.random() - 0.5) * 230
    const cy = ptr.y + (Math.random() - 0.5) * 200
    boxes.push({
      x: snap(cx - w / 2),
      y: snap(cy - h / 2),
      w,
      h,
      t0: now,
      life: 1.1 + Math.random() * 1.3,
      ascii: Math.random() < 0.35,
      s: Math.random() * 1000,
      tag: TAGS[Math.floor(Math.random() * TAGS.length)],
    })
  }

  function ascii(b, tick) {
    ctx.font = FONT
    ctx.textBaseline = 'top'
    for (let y = b.y; y < b.y + b.h - 2; y += CHH)
      for (let x = b.x + 1; x < b.x + b.w - 4; x += CW) {
        const i = idx(x + CW / 2, y + CHH / 2)
        if (ad[i + 3] < 40) continue
        const lum = (ad[i] * 0.3 + ad[i + 1] * 0.59 + ad[i + 2] * 0.11) / 255
        const g = clamp(
          Math.floor((lum * 0.95 + (hash(b.s + x * 0.7 + y * 1.3, tick) - 0.5) * 0.3) * RAMP.length),
          1,
          RAMP.length - 1,
        )
        ctx.fillStyle = 'rgba(11,11,13,.86)'
        ctx.fillRect(x, y, CW, CHH)
        ctx.fillStyle = `rgb(${Math.min(255, ad[i] * 1.7 + 50) | 0},${Math.min(255, ad[i + 1] * 1.7 + 40) | 0},${Math.min(255, ad[i + 2] * 1.7 + 60) | 0})`
        ctx.fillText(RAMP[g], x, y)
      }
  }

  // The box is a window onto the second picture.
  const picture = (b) =>
    ctx.drawImage(
      alt,
      ((b.x - ox) / dw) * alt.naturalWidth,
      ((b.y - oy) / dh) * alt.naturalHeight,
      (b.w / dw) * alt.naturalWidth,
      (b.h / dh) * alt.naturalHeight,
      b.x,
      b.y,
      b.w,
      b.h,
    )

  function frameBox(b, label, color) {
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1)
    ctx.font = FONT
    ctx.textBaseline = 'bottom'
    const tw = ctx.measureText(label).width + 8
    ctx.fillStyle = color
    ctx.fillRect(b.x, b.y - 13, tw, 13)
    ctx.fillStyle = '#0B0B0D'
    ctx.fillText(label, b.x + 4, b.y - 2)
  }

  // Glitch around one box: colour-split ghost frames, stray bars, noise pixels, a shifted slice.
  function glitch(b, tick) {
    const h = (k) => hash(b.s + k * 3.7, tick)
    const dpr = canvas.width / W
    if (h(1) < 0.3) {
      const d = 2 + h(2) * 5
      ctx.lineWidth = 1
      ctx.strokeStyle = NEON[0] + '.7)'
      ctx.strokeRect(b.x - d + 0.5, b.y + 0.5, b.w - 1, b.h - 1)
      ctx.strokeStyle = NEON[1] + '.7)'
      ctx.strokeRect(b.x + d + 0.5, b.y + 1.5, b.w - 1, b.h - 1)
    }
    for (let k = 0; k < 3; k++)
      if (h(10 + k) < 0.45) {
        const w = 14 + h(20 + k) * 70
        const y = b.y + h(30 + k) * b.h
        const left = h(40 + k) < 0.5
        ctx.fillStyle = NEON[Math.floor(h(50 + k) * 4)] + (0.35 + h(60 + k) * 0.5) + ')'
        ctx.fillRect(left ? b.x - w * 0.7 : b.x + b.w - w * 0.3, y | 0, w, 1 + Math.floor(h(70 + k) * 3))
      }
    for (let k = 0; k < 10; k++)
      if (h(100 + k) < 0.5) {
        const a = h(120 + k) * 6.283
        const r = 0.5 + h(140 + k) * 0.35
        const sz = 2 + Math.floor(h(160 + k) * 3)
        ctx.fillStyle = NEON[Math.floor(h(180 + k) * 4)] + '.8)'
        ctx.fillRect((b.x + b.w / 2 + Math.cos(a) * b.w * r) | 0, (b.y + b.h / 2 + Math.sin(a) * b.h * r) | 0, sz, sz)
      }
    if (h(200) < 0.18) {
      const sh = 4 + h(201) * 12
      const sy = b.y + h(202) * (b.h - sh)
      const dx = (h(203) - 0.5) * 28
      ctx.drawImage(canvas, b.x * dpr, sy * dpr, b.w * dpr, sh * dpr, b.x + dx, sy, b.w, sh)
    }
  }

  // Sparks: a few slow particles flow along the outline, leave trails, and now and then spit embers.
  const pick = () => edge[Math.floor(Math.random() * edge.length)]
  const particle = () => {
    const p = pick()
    return { x: p[0], y: p[1], to: null, dir: null, trail: [], v: 0.45 + Math.random() * 0.6, a: 0.6 + Math.random() * 0.4 }
  }
  function nextStop(q) {
    let best = null
    let seen = 0
    for (const e of edge) {
      const dx = e[0] - q.x
      const dy = e[1] - q.y
      const d = Math.hypot(dx, dy)
      if (d < 12 || d > 40 || (q.dir && (dx * q.dir[0] + dy * q.dir[1]) / d < 0.3)) continue
      if (Math.random() < 1 / ++seen) best = e
    }
    return best
  }
  function sparks(k) {
    while (flow.length < 24) flow.push(particle())
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.lineCap = 'round'
    for (let i = 0; i < flow.length; i++) {
      const q = flow[i]
      if (!q.to) {
        q.to = nextStop(q)
        if (!q.to || Math.random() < 0.015) {
          flow[i] = particle()
          continue
        }
      }
      const dx = q.to[0] - q.x
      const dy = q.to[1] - q.y
      const d = Math.hypot(dx, dy)
      if (d < q.v) {
        q.dir = [dx / (d || 1), dy / (d || 1)]
        q.to = null
      } else {
        q.x += (dx / d) * q.v + (Math.random() - 0.5) * 0.9
        q.y += (dy / d) * q.v + (Math.random() - 0.5) * 0.9
      }
      q.trail.push([q.x, q.y])
      if (q.trail.length > 26) q.trail.shift()
      for (let t = 1; t < q.trail.length; t++) {
        const f = t / q.trail.length
        ctx.beginPath()
        ctx.moveTo(q.trail[t - 1][0], q.trail[t - 1][1])
        ctx.lineTo(q.trail[t][0], q.trail[t][1])
        ctx.strokeStyle = `rgba(138,77,255,${(f * q.a * k * 0.28).toFixed(3)})`
        ctx.lineWidth = 5 + f * 3
        ctx.stroke()
        ctx.strokeStyle = `rgba(190,150,255,${(f * q.a * k).toFixed(3)})`
        ctx.lineWidth = 0.8 + f * 1.4
        ctx.stroke()
      }
      ctx.fillStyle = `rgba(225,205,255,${(q.a * k).toFixed(3)})`
      ctx.fillRect(q.x - 1.3, q.y - 1.3, 2.6, 2.6)
      if (Math.random() < 0.012)
        for (let n = 2 + Math.random() * 4; n > 0; n--) {
          const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.6
          const sp = 0.5 + Math.random() * 1.9
          embers.push({ x: q.x, y: q.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1, fade: 0.012 + Math.random() * 0.02 })
        }
    }
    embers = embers.filter((e) => e.life > 0)
    for (const e of embers) {
      e.x += e.vx
      e.y += e.vy
      e.vx *= 0.97
      e.vy = e.vy * 0.97 + 0.025
      e.life -= e.fade
      ctx.strokeStyle = `rgba(170,120,255,${(e.life * k * 0.7).toFixed(3)})`
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(e.x - e.vx * 4, e.y - e.vy * 4)
      ctx.lineTo(e.x, e.y)
      ctx.stroke()
      ctx.fillStyle = `rgba(240,225,255,${(e.life * k).toFixed(3)})`
      ctx.fillRect(e.x - 1, e.y - 1, 2, 2)
    }
    ctx.restore()
  }

  // Glitch over the whole figure: shifted strips of both pictures, neon bars, noise pixels.
  function bigGlitch(tick, g) {
    const h = (k) => hash(k * 5.3 + 91, tick)
    const bh = sb.b - sb.y
    const bw = sb.r - sb.x
    for (let k = 0, n = 5 + g * 14; k < n; k++) {
      const y = sb.y + h(k) * bh
      const hh = 3 + h(k + 50) * 36
      const dx = (h(k + 100) - 0.5) * 110 * g
      const src = h(k + 150) < 0.5 ? alt : cut
      ctx.drawImage(src, 0, ((y - oy) / dh) * src.naturalHeight, src.naturalWidth, (hh / dh) * src.naturalHeight, ox + dx, y, dw, hh)
    }
    for (let k = 0; k < 10; k++)
      if (h(k + 200) < g) {
        ctx.fillStyle = NEON[Math.floor(h(k + 250) * 4)] + (0.3 + h(k + 300) * 0.6) + ')'
        ctx.fillRect(sb.x - 40 + h(k + 350) * (bw + 40), sb.y + h(k + 400) * bh, 30 + h(k + 450) * 190, 1 + Math.floor(h(k + 500) * 3))
      }
    for (let k = 0; k < 40; k++)
      if (h(k + 600) < g) {
        const sz = 2 + Math.floor(h(k + 650) * 4)
        ctx.fillStyle = NEON[Math.floor(h(k + 700) * 4)] + '.85)'
        ctx.fillRect((sb.x - 30 + h(k + 750) * (bw + 60)) | 0, (sb.y - 20 + h(k + 800) * bh) | 0, sz, sz)
      }
  }

  function swapFrame(now, tick) {
    const t = now - swap
    if (t > T_IN + T_HOLD + T_OUT) {
      swap = 0
      flow = []
      embers = []
      alt.style.opacity = 0
      return
    }
    if (reduce) {
      alt.style.opacity = t < T_IN + T_HOLD ? 1 : 0
      return
    }
    if (t < T_IN) {
      const k = t / T_IN
      alt.style.opacity = hash(3, tick) < k ? k : 0
      bigGlitch(tick, 1 - k * 0.4)
      sparks(k * 0.6)
    } else if (t < T_IN + T_HOLD) {
      alt.style.opacity = 1
      if (hash(5, tick) < 0.12) bigGlitch(tick, 0.25)
      sparks(1)
    } else {
      const k = (t - T_IN - T_HOLD) / T_OUT
      alt.style.opacity = hash(3, tick) < k ? 0 : 1 - k
      bigGlitch(tick, 0.5 + k * 0.5)
      sparks(1 - k)
    }
  }

  function frame(now) {
    if (dead) return
    ctx.clearRect(0, 0, W, H)
    const tick = Math.floor(now / 80)
    boxes = boxes.filter((b) => now - b.t0 < b.life * 1000)
    for (const b of boxes) {
      const age = (now - b.t0) / 1000
      ctx.globalAlpha = reduce ? 1 : Math.min(1, age / 0.07) * Math.min(1, (b.life - age) / 0.25)
      if (b.ascii || (!reduce && age < 0.34)) ascii(b, tick)
      else picture(b)
      if (ptr) {
        ctx.strokeStyle = 'rgba(244,238,231,.22)'
        ctx.lineWidth = 0.6
        ctx.beginPath()
        ctx.moveTo(ptr.x, ptr.y)
        ctx.lineTo(b.x + b.w / 2, b.y + b.h / 2)
        ctx.stroke()
      }
      frameBox(b, b.tag, 'rgba(244,238,231,.85)')
      if (!reduce) glitch(b, tick)
    }
    ctx.globalAlpha = 1
    if (ptr && !swap && onSubject(ptr.x, ptr.y)) {
      const b = { x: snap(ptr.x - 48), y: snap(ptr.y - 48), w: 96, h: 96, s: 7 }
      picture(b)
      frameBox(b, `LOCK X ${String(ptr.x | 0).padStart(4, '0')} Y ${String(ptr.y | 0).padStart(4, '0')}`, '#E4B57B')
      if (!reduce) glitch(b, tick)
    }
    if (swap) swapFrame(now, tick)
    if (boxes.length || ptr || swap) requestAnimationFrame(frame)
    else running = false
  }
  const kick = () => {
    if (!running && !dead) {
      running = true
      requestAnimationFrame(frame)
    }
  }
  const move = (x, y) => {
    ptr = { x, y }
    spawn(performance.now())
    kick()
  }
  const local = (e) => {
    const r = canvas.getBoundingClientRect()
    return [e.clientX - r.left, e.clientY - r.top]
  }

  const onMove = (e) => {
    if (!mk) return
    userMoved = true
    move(...local(e))
  }
  const onLeave = () => {
    ptr = null
  }
  const onDouble = (e) => {
    if (!mk || swap || !onSubject(...local(e))) return
    swap = performance.now()
    boxes = [] // no hover boxes while the second picture shows
    kick()
  }
  const onResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => mk && layout(), 120)
  }

  // One slow pass over the figure shows the effect before the visitor moves.
  function sweep() {
    const pts = [[0.36, 0.6], [0.5, 0.22], [0.56, 0.3], [0.62, 0.46], [0.52, 0.7]].map(([u, v]) => [
      clamp(ox + u * dw, 24, W - 24),
      oy + v * dh,
    ])
    const T = 3800
    const t0 = performance.now()
    const step = (now) => {
      if (userMoved || dead) return
      const k = Math.max(0, (now - t0) / T) // a frame's timestamp can be a little before t0
      if (k >= 1) {
        ptr = null
        return
      }
      const f = k * (pts.length - 1)
      const i = Math.floor(f)
      const q = f - i
      const e = q * q * (3 - 2 * q)
      move(pts[i][0] + (pts[i + 1][0] - pts[i][0]) * e, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * e)
      requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  root.addEventListener('pointermove', onMove)
  root.addEventListener('pointerleave', onLeave)
  root.addEventListener('pointercancel', onLeave)
  root.addEventListener('dblclick', onDouble)
  window.addEventListener('resize', onResize)

  Promise.all([bg, cut, alt].map((i) => i.decode().catch(() => {}))).then(() => {
    if (dead) return
    mk = small(cut)
    ad = small(alt)
    layout()
    root.dataset.ready = ''
    if (!reduce) sweepTimer = setTimeout(sweep, 900)
  })

  return () => {
    dead = true
    clearTimeout(sweepTimer)
    clearTimeout(resizeTimer)
    root.removeEventListener('pointermove', onMove)
    root.removeEventListener('pointerleave', onLeave)
    root.removeEventListener('pointercancel', onLeave)
    root.removeEventListener('dblclick', onDouble)
    window.removeEventListener('resize', onResize)
  }
}
