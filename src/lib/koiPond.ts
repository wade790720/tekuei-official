// Koi pond: koi swim behind the page, drawn as a grid of characters. A click drops food.
// The steering, the spine and the body shape are ported from ascii-koi (MIT, (c) 2026 Ahmet Dedeler,
// https://github.com/Ahmet-Dedeler/ascii-koi), which builds on ascii-sharks (MIT, (c) 2026 drewdi,
// https://github.com/stackedlol/ascii-sharks). Numbers without a comment are theirs.
// Ours: glyphs only with no blocks under them, food pellets in place of prey fish, and CSS for the look
// (`color` for the body, `--koi-mark` for the patches, `--koi-food` for food, `font-family` for the glyphs).
// Also ours, the swimming: thrust against drag that grows with speed squared, whole tail beats followed
// by a glide (burst and coast), a tail beat rate that rises with speed (Bainbridge 1958), and the body
// wave envelope of Videler and Hess (1984). Speeds are far below a real koi's, to keep the page calm.

import { playWaterRipple } from './waterRipple.ts'

const CELL_PX = 9
const CELL_PX_SMALL = 7 // under 768px wide
const RAMP = '.:;t%SX8#@' // faint to dense: on a dark page a denser glyph reads as brighter
const NODES = 20 // spine points, snout first
// Koi lengths relative to the biggest. A wide spread, like the Koi Pond hero on motionsites.ai.
const SIZES = [1, 0.9, 0.8, 0.7, 0.62, 0.55, 0.5]
const SIZES_SMALL = [1, 0.8, 0.62] // under 768px wide
const GIRTH = 1.5 // ours: body width against ascii-koi's slim outline, for the plump Koi Pond build
const STEP = 1 / 60
const MAX_STEPS = 4
const MAX_FOOD = 12
const ZONE_PAD_PX = 64 // room around the words: half a koi body and its fins
const ZONE_SNAP_PX = 160 // words this close to an edge of the pond are joined to it
const FOOD_LIFE_S = 30 // a pellet nobody reaches sinks
const BODY_CLEARANCE = 0.16 // half-width a koi keeps clear around its spine, as a share of its length
// What a koi does when it is not after food. It picks one by weight, holds it for a while, then picks again.
// Speed is a multiple of its cruising speed. Ours: ascii-koi cruises at one speed.
interface Mood {
  weight: number
  speed: [number, number]
  seconds: [number, number]
  steady?: boolean
  bolt?: boolean
}
interface Koi {
  id: number
  length: number
  nodes: Float32Array
  heading: number
  speed: number
  cruise: number
  phase: number
  turn: number
  wander: number
  depth: number
  target: Food | null
  retargetAt: number
  mood: number
  steady: boolean
  bolt: boolean
  moodUntil: number
  stroke: boolean
  strokeEnd: number
  amp: number
}
interface Food {
  x: number
  y: number
  age: number
}
interface Zone {
  l: number
  r: number
  t: number
  b: number
  open: boolean[]
}
export interface KoiPondOptions {
  surface?: HTMLElement
  avoid?: HTMLElement[]
  onCount?: (count: { koi: number; food: number }) => void
}
const MOODS: Mood[] = [
  { weight: 7, speed: [0.8, 1.2], seconds: [4, 10] }, // cruise: a beat or two, then a glide
  { weight: 3, speed: [0.25, 0.45], seconds: [4, 9] }, // drift: one flick, then a long glide
  { weight: 1.5, speed: [1.8, 2.5], seconds: [1, 2.5], steady: true }, // dart: beats without a pause
  { weight: 0.5, speed: [6, 6], seconds: [0.35, 0.6], steady: true, bolt: true }, // startle: a short hard drive, then it coasts
]
const GLIDE_S = 2.5 // a koi that stops beating at cruising speed is at half speed after this long
const TURN_GAIN = 3 // turn rate asked for, per radian off course
const TURN_EASE = 6 // per second: how fast the turn rate follows what is asked
const BEAT_HZ = 0.4 // tail beats per second at a standstill
const STRIDE = 0.6 // body lengths gained per tail beat on top of that
const WAVE = 6 // radians of body wave from snout to tail: about one wavelength, as carp-like swimmers carry
const MOOD_WEIGHT = MOODS.reduce((sum, m) => sum + m.weight, 0)

function pickMood(): Mood {
  let r = Math.random() * MOOD_WEIGHT
  return MOODS.find((m) => (r -= m.weight) <= 0) ?? MOODS[0]
}

const MAX_BEND = 0.24 // radians per joint: the body bends into a C, never folds

// Body outline and fins, as shares of the length.
// Fin reach and tail spread are wider than ascii-koi's, so they still clear the wider body.
const PECTORAL = [0.14, 0.19, 0.36, 0.2] // leading root, trailing root, tip along the body, reach
const PELVIC = [0.41, 0.45, 0.52, 0.125]
const TAIL = [0.68, 0.15, 0.05] // start, lobe spread, fork depth
const FIN_BREADTH = 0.55
const DORSAL = [0.12, 0.6] // the stretch of back that catches a sheen
const SUBSAMPLES = [0.25, 0.3, 0.75, 0.3, 0.25, 0.72, 0.75, 0.72]

const TAU = Math.PI * 2
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)
const wrap = (v: number, size: number) => ((v % size) + size) % size
const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo)

function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}

// Shortest signed angle from a to b.
function angleDiff(a: number, b: number) {
  let d = (b - a) % TAU
  if (d > Math.PI) d -= TAU
  if (d < -Math.PI) d += TAU
  return d
}

// Integer hash to [0, 1). Deterministic, so a koi keeps its pattern.
function hash3(x: number, y: number, z: number) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1442695041)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

function noise(x: number, y: number, seed: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash3(xi, yi, seed)
  const b = hash3(xi + 1, yi, seed)
  const c = hash3(xi, yi + 1, seed)
  const d = hash3(xi + 1, yi + 1, seed)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

// Half-width of the body at s (0 snout, 1 tail tip): a rounded head, a torpedo, a long stalk.
function halfWidth(s: number) {
  if (s < 0.08) return 0.07 * Math.pow(Math.sin(((s / 0.08) * Math.PI) / 2), 0.55)
  if (s < 0.27) return 0.07 + 0.017 * smoothstep(0.08, 0.27, s)
  if (s < 0.66) return 0.02 + 0.067 * Math.pow(1 - (s - 0.27) / 0.39, 1.05)
  return 0.02 * (1 - smoothstep(0.66, 0.78, s)) + 0.004
}

// Kohaku pattern: two or three patches down the back, edges broken up by noise.
// s along the body, vn across it as a signed share of the length, across 0 spine to 1 flank.
function isMark(id: number, s: number, vn: number, across: number) {
  const band = 0.16 - 0.35 * smoothstep(0.58, 0.72, s) - 0.22 * across * across - 0.4 * (1 - smoothstep(0.015, 0.05, s))
  const steps = 0.5 + 0.5 * Math.cos((s * 2.6 + hash3(id, 3, 17)) * TAU)
  return 0.45 * noise(s * 4.6, vn * 7, id * 13) + 0.55 * steps + band > 0.6
}

// Is (u along, a across) inside a paddle-shaped fin from its root on the spine to its tip?
// Returns 0 at the root to 1 at the tip, or -1 for a miss.
function inFin(u: number, a: number, rootU: number, tipU: number, tipA: number, breadth: number) {
  const dx = tipU - rootU
  const len = Math.hypot(dx, tipA) || 1
  const ex = dx / len
  const ey = tipA / len
  const half = len / 2
  const qx = u - (rootU + dx / 2)
  const qy = a - tipA / 2
  const p = (qx * ex + qy * ey) / half
  if (p < -1 || p > 1) return -1
  const t = (p + 1) / 2
  const width = half * breadth * (0.45 + 0.55 * Math.sin(t * Math.PI * 0.85))
  const q = (-qx * ey + qy * ex) / width
  return p * p + q * q <= 1 ? t : -1
}

/**
 * @param {HTMLCanvasElement} canvas  size comes from CSS
 * @param {{ surface?: HTMLElement, avoid?: HTMLElement[], onCount?: (count: { koi: number, food: number }) => void }} [opts]
 *   surface: the element whose clicks drop food (default: the canvas)
 *   avoid: elements the koi keep clear of, for example the text over the pond
 * @returns {() => void} cleanup
 */
export function mountKoiPond(
  canvas: HTMLCanvasElement,
  { surface = canvas, avoid: keepClear = [], onCount = () => {} }: KoiPondOptions = {},
): () => void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let W = 0
  let H = 0
  let cell = CELL_PX
  let cols = 0
  let rows = 0
  let time = 0
  let colours = ['', '', ''] // body, mark, food
  let font = ''
  let koi: Koi[] = []
  let food: Food[] = []
  let zones: Zone[] = [] // one box around each element to keep clear of, in canvas px: { l, r, t, b, open }
  // One alpha and one colour index per cell, rebuilt every frame.
  let cellAlpha = new Float32Array(0)
  let cellColour = new Uint8Array(0)
  let lit = [new Uint32Array(0), new Uint32Array(0), new Uint32Array(0)] // per colour: indices of the cells to draw

  const report = () => onCount({ koi: koi.length, food: food.length })

  // Where the koi start: on rings between the middle of the pond and its edge, so they begin apart.
  function ringRadius(ring: number, L: number) {
    const minSide = Math.min(W, H)
    const inner = minSide * 0.16
    const outer = Math.max(inner, minSide / 2 - L * 0.32 - 20)
    return inner + (outer - inner) * ring
  }

  function seed() {
    const minSide = Math.min(W, H)
    const base = clamp(minSide * 0.3, 120, 280) // px; smaller than ascii-koi so the words stay readable
    const sizes = W < 768 ? SIZES_SMALL : SIZES
    koi = sizes.map((size, i) => {
      const length = base * size
      const ring = (i * 0.618) % 1
      const a = (i / sizes.length) * TAU + rand(-0.2, 0.2)
      const r = ringRadius(ring, length)
      const x = W / 2 + Math.cos(a) * r * (W / minSide) * 0.9
      const y = H / 2 + Math.sin(a) * r
      const heading = a + Math.PI / 2
      const nodes = new Float32Array(NODES * 2)
      const seg = length / (NODES - 1)
      for (let n = 0; n < NODES; n++) {
        nodes[n * 2] = x - Math.cos(heading) * seg * n
        nodes[n * 2 + 1] = y - Math.sin(heading) * seg * n
      }
      // Cruising speed grows with the square root of the length: a big koi is faster, but slower for its size.
      const cruise = 3 * Math.sqrt(length) * rand(0.85, 1.2)
      return { id: i + 1, length, nodes, heading, speed: cruise, cruise, phase: rand(0, TAU), turn: 0, wander: 0, depth: size, target: null, retargetAt: 0, mood: 1, steady: false, bolt: false, moodUntil: 0, stroke: false, strokeEnd: 0, amp: 0 }
    })
    // Smaller (deeper) koi draw first, so the big one swims over them.
    koi.sort((a, b) => a.length - b.length)
  }

  // Read again when the text changes size, for example when the language changes.
  function measureZones() {
    const rect = canvas.getBoundingClientRect()
    zones = keepClear.flatMap((el) => {
      const box = el.getBoundingClientRect()
      if (!box.width || !box.height) return []
      const l = box.left - rect.left
      const r = box.right - rect.left
      const t = box.top - rect.top
      const b = box.bottom - rect.top
      // A side near the edge of the pond is closed: the box runs to that edge, so no koi gets
      // caught in the gap. The other sides are open, and the box grows a little on them.
      const open = [l > ZONE_SNAP_PX, W - r > ZONE_SNAP_PX, t > ZONE_SNAP_PX, H - b > ZONE_SNAP_PX]
      return [
        {
          l: open[0] ? l - ZONE_PAD_PX : -Infinity,
          r: open[1] ? r + ZONE_PAD_PX : Infinity,
          t: open[2] ? t - ZONE_PAD_PX : -Infinity,
          b: open[3] ? b + ZONE_PAD_PX : Infinity,
          open,
        },
      ]
    })
  }

  // Is the left and right edge (sideways) or the top and bottom edge a wall at this place along it?
  // It is when a zone is joined to either of the two edges there: a koi that crossed would land on words.
  function walledAt(sideways: boolean, at: number) {
    return zones.some((z) =>
      sideways ? (!z.open[0] || !z.open[1]) && at > z.t && at < z.b : (!z.open[2] || !z.open[3]) && at > z.l && at < z.r,
    )
  }

  // The shortest way out of a zone through an open side: [distance in px, direction x, direction y].
  // null when the point is outside the zone.
  function wayOut(zone: Zone, px: number, py: number): number[] | null {
    if (px < zone.l || px > zone.r || py < zone.t || py > zone.b) return null
    let best: number[] | null = null
    const sides = [
      [px - zone.l, -1, 0],
      [zone.r - px, 1, 0],
      [py - zone.t, 0, -1],
      [zone.b - py, 0, 1],
    ]
    for (let i = 0; i < 4; i++) if (zone.open[i] && (!best || sides[i][0] < best[0])) best = sides[i]
    return best
  }

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    if (rect.width < 1 || rect.height < 1) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const phone = rect.width < 768
    const reseed = !koi.length || phone !== W < 768
    W = rect.width
    H = rect.height
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    cell = phone ? CELL_PX_SMALL : CELL_PX
    cols = Math.ceil(W / cell)
    rows = Math.ceil(H / cell)
    cellAlpha = new Float32Array(cols * rows)
    cellColour = new Uint8Array(cols * rows)
    lit = [0, 1, 2].map(() => new Uint32Array(cols * rows))
    measureZones()
    const style = getComputedStyle(canvas)
    font = `${cell + 2}px ${style.fontFamily}`
    colours = [
      style.color,
      style.getPropertyValue('--koi-mark').trim() || style.color,
      style.getPropertyValue('--koi-food').trim() || style.color,
    ]
    if (reseed) {
      seed()
      // Let the pond settle, so the bodies are already bent on the first frame.
      for (let i = 0; i < 240; i++) step(STEP)
    }
    food = food.filter((f) => f.x < W && f.y < H)
    report()
  }

  function nearestFood(k: Koi): Food | null {
    const hx = k.nodes[0]
    const hy = k.nodes[1]
    const fx = Math.cos(k.heading)
    const fy = Math.sin(k.heading)
    let best: Food | null = null
    let bestScore = k.length * 0.9 + 260 // how far a koi notices a pellet
    for (const f of food) {
      const dx = f.x - hx
      const dy = f.y - hy
      const d = Math.hypot(dx, dy) || 1
      // A pellet behind the koi counts as farther: it has to come about first.
      const score = d * (1 + (1 - (dx * fx + dy * fy) / d) * 0.8)
      if (score < bestScore) {
        bestScore = score
        best = f
      }
    }
    return best
  }

  function stepKoi(dt: number) {
    for (const k of koi) {
      const L = k.length
      const nodes = k.nodes
      const hx = nodes[0]
      const hy = nodes[1]

      // The koi steers by adding up pulls and turning toward the sum. Momentum first.
      let dx = Math.cos(k.heading)
      let dy = Math.sin(k.heading)

      // Wander: a slowly drifting offset on a circle ahead of the snout.
      k.wander = clamp(k.wander + (Math.random() - 0.5) * dt * 3.2, -1.1, 1.1)
      dx += Math.cos(k.heading + k.wander) * 0.45
      dy += Math.sin(k.heading + k.wander) * 0.45

      if (k.target && !food.includes(k.target)) k.target = null
      if (!k.target || time >= k.retargetAt) {
        k.target = nearestFood(k)
        k.retargetAt = time + 0.45
      }
      let huntX = 0
      let huntY = 0
      let closing = 0
      const hunting = !!k.target
      if (k.target) {
        const tx = k.target.x - hx
        const ty = k.target.y - hy
        const d = Math.hypot(tx, ty) || 1
        huntX = (tx / d) * 3.2
        huntY = (ty / d) * 3.2
        closing = clamp(1 - d / (L * 0.9), 0, 1)
      }

      // Give other koi room: test the snout and a point ahead of it against their bodies.
      let crowded = 0
      let avoidX = 0
      let avoidY = 0
      const aheadX = hx + Math.cos(k.heading) * k.speed * 2.4
      const aheadY = hy + Math.sin(k.heading) * k.speed * 2.4
      for (const other of koi) {
        if (other === k) continue
        const range = (L + other.length) * BODY_CLEARANCE * 3 + 50
        for (let n = 0; n < NODES; n += 2) {
          const qx = other.nodes[n * 2]
          const qy = other.nodes[n * 2 + 1]
          for (let p = 0; p < 2; p++) {
            const ox = (p === 0 ? hx : aheadX) - qx
            const oy = (p === 0 ? hy : aheadY) - qy
            const d = Math.hypot(ox, oy)
            if (d >= range || d < 1e-3) continue
            const near = 1 - d / range
            avoidX += (ox / d) * near
            avoidY += (oy / d) * near
            if (near > crowded) crowded = near
          }
        }
      }
      // Food can wait: a chase never overrides not swimming into another koi.
      dx += huntX * (1 - 0.85 * crowded)
      dy += huntY * (1 - 0.85 * crowded)
      const avoid = Math.hypot(avoidX, avoidY)
      if (avoid > 1e-3) {
        const w = Math.min(avoid * 1.4, 3)
        dx += (avoidX / avoid) * w
        dy += (avoidY / avoid) * w
      }

      // Keep clear of the words: a no-swim zone around each block, tested at the snout and ahead of it.
      for (const zone of zones)
        for (const [px, py] of [
          [hx, hy],
          [aheadX, aheadY],
        ]) {
          const qx = wrap(px, W)
          const qy = wrap(py, H)
          const out = wayOut(zone, qx, qy)
          if (!out) continue
          const depth = out[0]
          let [, nx, ny] = out
          // A point that has gone past an edge lands on the far side of the pond. If words are there,
          // the koi turns back from that edge.
          if (qx !== px) [nx, ny] = [px < 0 ? 1 : -1, 0]
          else if (qy !== py) [nx, ny] = [0, py < 0 ? 1 : -1]
          const push = Math.min(1, depth / ZONE_PAD_PX) * (hunting ? 1 : 6)
          dx += nx * push
          dy += ny * push
        }

      // An edge is open water only where the far side is clear too. Where words sit on either side,
      // the edge is a wall, and the koi turns well before it. The mid-body and the tail count as well,
      // because they swing wide of the snout's path in a turn.
      let walled = 0
      const margin = hunting ? L * 0.12 + 10 : L * 0.45 + 30 // a koi goes closer to the edge for food
      const mid = Math.round(NODES * 0.4) * 2
      const back = Math.round(NODES * 0.75) * 2
      for (const [px, py, pm] of [
        [hx, hy, margin],
        [hx + Math.cos(k.heading) * k.speed * 1.2, hy + Math.sin(k.heading) * k.speed * 1.2, margin],
        [nodes[mid], nodes[mid + 1], Math.min(margin, L * 0.25 + 20)],
        [nodes[back], nodes[back + 1], Math.min(margin, L * 0.2 + 16)],
      ])
        for (const [dist, nx, ny] of [
          [px, 1, 0],
          [W - px, -1, 0],
          [py, 0, 1],
          [H - py, 0, -1],
        ]) {
          if (dist >= pm || !walledAt(nx !== 0, nx !== 0 ? py : px)) continue
          const near = clamp(1 - dist / pm, 0, 1.5)
          dx += nx * near * near * 6
          dy += ny * near * near * 6
          if (near > walled) walled = Math.min(1, near)
        }

      // A koi cannot pivot on the spot: how fast it turns depends on how fast it swims.
      const agility = Math.max(Math.min(hunting ? 1.9 + closing : k.bolt ? 3 : 1, k.speed / (L * 0.18)), crowded * 1.7, walled * 1.6)
      // The turn rate eases in and out, so a koi enters and leaves a curve smoothly.
      const wantTurn = clamp(angleDiff(k.heading, Math.atan2(dy, dx)) * TURN_GAIN, -agility, agility)
      k.turn += (wantTurn - k.turn) * Math.min(1, dt * TURN_EASE)
      k.heading += k.turn * dt

      if (time >= k.moodUntil) {
        const mood = pickMood()
        k.mood = rand(...mood.speed)
        k.steady = !!mood.steady
        k.bolt = !!mood.bolt
        k.moodUntil = time + rand(...mood.seconds)
        // A startled koi whips its head to one side first (a C-start), then drives off that way.
        if (k.bolt) k.turn = rand(4, 7) * (Math.random() < 0.5 ? -1 : 1)
      }
      // want, pace and thrust are multiples of the cruising speed.
      const want = (hunting ? 1.4 + closing * 0.6 : k.mood) * (1 - 0.25 * crowded)
      const pace = k.speed / k.cruise
      let thrust = 0
      if (hunting || k.steady) {
        k.stroke = true
        thrust = want * (1 + 0.6 * clamp(1 - pace / want, 0, 1)) // beats harder until it is up to speed
      } else {
        // Burst and coast: a whole beat or two, then a glide until the koi has slowed down.
        if (k.stroke && k.phase >= k.strokeEnd) k.stroke = false
        else if (!k.stroke && pace < want * 0.8) {
          k.stroke = true
          k.strokeEnd = k.phase + TAU * (Math.random() < 0.4 ? 2 : 1)
        }
        if (k.stroke) thrust = Math.max(want * 1.5, 0.9)
      }
      // Drag grows with speed squared, so a fast koi slows quickly and a slow one glides for a long time.
      // Spread fins (braking for a koi or a wall) and a bent body add drag.
      const drag = 1 + 0.6 * Math.max(crowded, walled) + 0.5 * Math.abs(k.turn)
      k.speed = Math.max(0, k.speed + ((thrust * thrust - drag * pace * pace) * k.cruise * dt) / GLIDE_S)
      if (k.stroke) k.phase += dt * TAU * (BEAT_HZ + (thrust * k.cruise) / (STRIDE * L))
      // Tail swing as a share of the length: wider with effort, and the body straightens in a glide.
      const amp = k.stroke ? 0.05 + 0.05 * smoothstep(0.5, 4, thrust) : 0
      k.amp += (amp - k.amp) * Math.min(1, dt * (k.stroke ? 6 : 3))

      nodes[0] += Math.cos(k.heading) * k.speed * dt
      nodes[1] += Math.sin(k.heading) * k.speed * dt

      // The pond has no walls: a koi that swims out through one edge comes in through the opposite one.
      // The whole body moves by one pond width or height. draw() shows it on both sides while it crosses.
      const jumpX = nodes[0] < 0 ? W : nodes[0] > W ? -W : 0
      const jumpY = nodes[1] < 0 ? H : nodes[1] > H ? -H : 0
      if (jumpX || jumpY)
        for (let i = 0; i < NODES; i++) {
          nodes[i * 2] += jumpX
          nodes[i * 2 + 1] += jumpY
        }

      // Follow-the-leader spine with a stiffness limit per joint.
      const seg = L / (NODES - 1)
      let prevAngle = k.heading + Math.PI
      for (let n = 1; n < NODES; n++) {
        const px = nodes[(n - 1) * 2]
        const py = nodes[(n - 1) * 2 + 1]
        let angle = Math.atan2(nodes[n * 2 + 1] - py, nodes[n * 2] - px)
        angle = prevAngle + clamp(angleDiff(prevAngle, angle), -MAX_BEND, MAX_BEND)
        nodes[n * 2] = px + Math.cos(angle) * seg
        nodes[n * 2 + 1] = py + Math.sin(angle) * seg
        prevAngle = angle
      }

      const mouth = L * 0.05 + 8
      if (food.length) {
        const before = food.length
        food = food.filter((f) => (f.x - nodes[0]) ** 2 + (f.y - nodes[1]) ** 2 > mouth * mouth)
        if (food.length !== before) report()
      }
    }
  }

  // Wherever two koi still touch, ease the touching spine points apart, so one never swims over another.
  function separateBodies() {
    for (let i = 0; i < koi.length; i++)
      for (let j = i + 1; j < koi.length; j++) {
        const a = koi[i]
        const b = koi[j]
        const an = a.nodes
        const bn = b.nodes
        if (Math.hypot(an[0] - bn[0], an[1] - bn[1]) > (a.length + b.length) * (1 + BODY_CLEARANCE)) continue
        // The first points are left alone: moving the snout would snap the heading.
        for (let p = 3; p < NODES; p++) {
          const wa = a.length * BODY_CLEARANCE * (1.3 - (p / (NODES - 1)) * 0.9)
          for (let q = 3; q < NODES; q++) {
            const min = wa + b.length * BODY_CLEARANCE * (1.3 - (q / (NODES - 1)) * 0.9)
            const ox = bn[q * 2] - an[p * 2]
            const oy = bn[q * 2 + 1] - an[p * 2 + 1]
            const d2 = ox * ox + oy * oy
            if (d2 >= min * min || d2 < 1e-6) continue
            const d = Math.sqrt(d2)
            const push = ((min - d) / d) * 0.12
            an[p * 2] -= ox * push
            an[p * 2 + 1] -= oy * push
            bn[q * 2] += ox * push
            bn[q * 2 + 1] += oy * push
          }
        }
      }
  }

  // Backstop for the steering: a body that still lies on the words is eased out, a little each step.
  // A koi going for food is left alone, so a pellet dropped on the words can still be eaten.
  function leaveZones() {
    for (const k of koi) {
      if (k.target) continue
      const n = k.nodes
      for (const zone of zones)
        for (let i = 0; i < NODES; i++) {
          const out = wayOut(zone, wrap(n[i * 2], W), wrap(n[i * 2 + 1], H))
          if (!out) continue
          // The head moves less: moving it hard would snap the heading.
          const move = out[0] * (i < 3 ? 0.02 : 0.06)
          n[i * 2] += out[1] * move
          n[i * 2 + 1] += out[2] * move
        }
    }
  }

  function step(dt: number) {
    time += dt
    if (food.length) {
      const before = food.length
      for (const f of food) f.age += dt
      food = food.filter((f) => f.age < FOOD_LIFE_S)
      if (food.length !== before) report()
    }
    stepKoi(dt)
    separateBodies()
    leaveZones()
  }


  const spine = new Float32Array(NODES * 2)
  const arc = new Float32Array(NODES)
  let arcTotal = 1
  // The current koi and the result of the last sample() call.
  let cur: Koi | null = null
  let finTip = [0, 0] // left, right
  let finSwing = [0, 0]
  const hit = { fin: false, shade: 0, mark: false, dist: 0 }

  function put(c: number, r: number, alpha: number, colour: number) {
    if (c < 0 || r < 0 || c >= cols || r >= rows) return
    const i = r * cols + c
    if (alpha <= cellAlpha[i]) return
    cellAlpha[i] = alpha
    cellColour[i] = colour
  }

  // Is the point on the current koi? Body coordinates: s along the spine, a across it.
  // detail = false only answers "is this point on the koi": shade and mark are not worked out.
  function sample(px: number, py: number, detail = true) {
    if (!cur) return false
    const L = cur.length
    let best = Infinity
    let s = 0
    let sign = 1
    let tx = 1
    let ty = 0
    let over = 0
    for (let n = 0; n < NODES - 1; n++) {
      const ax = spine[n * 2]
      const ay = spine[n * 2 + 1]
      const sx = spine[(n + 1) * 2] - ax
      const sy = spine[(n + 1) * 2 + 1] - ay
      const len2 = sx * sx + sy * sy || 1
      const raw = ((px - ax) * sx + (py - ay) * sy) / len2
      const u = clamp(raw, 0, 1)
      const d2 = (px - ax - sx * u) ** 2 + (py - ay - sy * u) ** 2
      if (d2 >= best) continue
      best = d2
      const len = Math.sqrt(len2)
      s = (arc[n] + u * len) / arcTotal
      sign = sx * (py - ay) - sy * (px - ax) >= 0 ? 1 : -1
      tx = sx / len
      ty = sy / len
      over = n === NODES - 2 ? Math.max(0, raw - 1) * len : 0
    }
    const a = Math.sqrt(best)
    hit.dist = a
    // Nothing behind the tail tip: the round end of the spine would blunt the fork.
    if (over > L * 0.008) return false

    const w = halfWidth(s) * GIRTH * L
    if (a <= w) {
      if (!detail) return true
      const across = a / (w || 1)
      // A rounded back lit from the top left; the flanks fall into shadow.
      const facing = (-ty * sign * -0.6 + tx * sign * -0.8) * across
      let shade = 0.62 - across * across * 0.45 + facing * 0.24
      if (s > DORSAL[0] && s < DORSAL[1] && across < 0.3) shade += 0.1 * (1 - across / 0.3)
      if (s < 0.04) shade = Math.max(shade, 0.72)
      hit.fin = false
      hit.shade = shade
      hit.mark = isMark(cur.id, s, (a * sign) / L, across)
      return true
    }

    // Tail fin: two rounded lobes fanning out from the stalk, forked in the middle.
    const [t0, spread, fork] = TAIL
    if (s > t0) {
      const t = (s - t0) / (1 - t0)
      const round = t > 0.8 ? Math.sqrt(Math.max(0, 1 - ((t - 0.8) / 0.2) ** 2)) : 1
      const outer = L * (0.014 + spread * Math.pow(smoothstep(0, 0.85, t), 0.75)) * round
      if (a <= outer && a >= L * fork * smoothstep(0.6, 1, t)) {
        if (!detail) return true
        hit.fin = true
        hit.shade = 0.4 + 0.3 * (1 - a / (outer || 1))
        hit.mark = t < 0.2
        return true
      }
    }

    const side = sign > 0 ? 1 : 0
    const u = s * L
    let ft = inFin(u, a, (L * (PECTORAL[0] + PECTORAL[1])) / 2, L * (PECTORAL[2] + finSwing[side]), finTip[side], FIN_BREADTH)
    if (ft < 0)
      ft = inFin(
        u,
        a,
        (L * (PELVIC[0] + PELVIC[1])) / 2,
        L * (PELVIC[2] + finSwing[side] * 0.4),
        L * PELVIC[3] * (finTip[side] / (L * PECTORAL[3])),
        FIN_BREADTH,
      )
    if (ft < 0) return false
    if (!detail) return true
    hit.fin = true
    hit.shade = 0.38 + 0.3 * (1 - ft)
    hit.mark = ft < 0.2
    return true
  }

  // ox, oy: where to draw this koi, as an offset from its own place. Used for the far side of the pond.
  function rasterKoi(k: Koi, ox: number, oy: number) {
    cur = k
    const L = k.length
    const n = k.nodes
    // The swimming motion: a wave that travels down the body. It is smallest behind the head
    // and largest at the tail, and the snout swings a little the other way.
    for (let i = 0; i < NODES; i++) {
      const s = i / (NODES - 1)
      const a = Math.max(0, i - 1)
      const b = Math.min(NODES - 1, i + 1)
      let tx = n[a * 2] - n[b * 2]
      let ty = n[a * 2 + 1] - n[b * 2 + 1]
      const tl = Math.hypot(tx, ty) || 1
      tx /= tl
      ty /= tl
      const off = L * k.amp * (0.2 - 0.8 * s + 1.6 * s * s) * Math.sin(k.phase - s * WAVE)
      spine[i * 2] = n[i * 2] - ty * off + ox
      spine[i * 2 + 1] = n[i * 2 + 1] + tx * off + oy
    }
    arc[0] = 0
    for (let i = 1; i < NODES; i++)
      arc[i] = arc[i - 1] + Math.hypot(spine[i * 2] - spine[(i - 1) * 2], spine[i * 2 + 1] - spine[(i - 1) * 2 + 1])
    arcTotal = arc[NODES - 1] || 1

    // Bank into turns: the inside fin tucks in, the outside one spreads. The two fins paddle out of step,
    // in a glide too. A fast koi holds its fins against the body.
    const bank = clamp(k.turn * 0.45, -0.35, 0.35)
    const paddle = [Math.sin(time * 1.3 + k.id + 1.9), Math.sin(time * 1.3 + k.id)]
    const reachOut = L * PECTORAL[3] * (1 - 0.35 * smoothstep(1.5, 4, k.speed / k.cruise))
    finTip = [reachOut * (1 + 0.12 * paddle[0]) * (1 + bank), reachOut * (1 + 0.12 * paddle[1]) * (1 - bank)]
    finSwing = [0.025 * paddle[0], 0.025 * paddle[1]]

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (let i = 0; i < NODES; i++) {
      minX = Math.min(minX, spine[i * 2])
      maxX = Math.max(maxX, spine[i * 2])
      minY = Math.min(minY, spine[i * 2 + 1])
      maxY = Math.max(maxY, spine[i * 2 + 1])
    }
    const reach = L * 0.27 // fins and tail lobes stay inside this distance from the spine
    const c0 = Math.max(0, Math.floor((minX - reach) / cell))
    const c1 = Math.min(cols - 1, Math.floor((maxX + reach) / cell))
    const r0 = Math.max(0, Math.floor((minY - reach) / cell))
    const r1 = Math.min(rows - 1, Math.floor((maxY + reach) / cell))

    for (let r = r0; r <= r1; r++)
      for (let c = c0; c <= c1; c++) {
        const x = c * cell
        const y = r * cell
        let hits = sample(x + cell / 2, y + cell / 2) ? 1 : 0
        if (!hits && hit.dist > reach + cell) continue // subsamples sit within 0.35 cell of the centre
        let { fin, shade, mark } = hit
        for (let i = 0; i < SUBSAMPLES.length; i += 2)
          if (sample(x + SUBSAMPLES[i] * cell, y + SUBSAMPLES[i + 1] * cell, !hits)) {
            if (!hits) ({ fin, shade, mark } = hit)
            hits++
          }
        if (!hits) continue
        // Shade becomes opacity: lit back bright, flanks and fins dim, part-covered cells fainter.
        const tone = fin ? 0.05 + 0.5 * shade : mark ? 0.35 + 0.6 * shade : 0.15 + 0.6 * shade
        put(c, r, tone * (hits / 5) * (0.55 + 0.45 * k.depth), mark ? 1 : 0)
      }
  }

  const draw = () => {
    if (!cols) return
    cellAlpha.fill(0)
    for (const k of koi) {
      // A koi that is crossing an edge shows on both sides of the pond.
      const n = k.nodes
      const reach = k.length * 0.4
      for (const ox of [0, -W, W])
        for (const oy of [0, -H, H]) {
          let seen = false
          for (let i = 0; i < NODES && !seen; i++)
            seen = n[i * 2] + ox > -reach && n[i * 2] + ox < W + reach && n[i * 2 + 1] + oy > -reach && n[i * 2 + 1] + oy < H + reach
          if (seen) rasterKoi(k, ox, oy)
        }
    }
    for (const f of food) {
      const fc = Math.floor(f.x / cell)
      const fr = Math.floor(f.y / cell)
      put(fc, fr, 1, 2)
    }

    ctx.clearRect(0, 0, W, H)
    ctx.font = font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // One scan sorts the lit cells by colour; then one fillStyle per colour, drawn in the same order as before.
    const count = [0, 0, 0]
    for (let i = 0; i < cellAlpha.length; i++) if (cellAlpha[i] >= 0.03) lit[cellColour[i]][count[cellColour[i]]++] = i
    for (let colour = 0; colour < 3; colour++) {
      ctx.fillStyle = colours[colour]
      for (let j = 0; j < count[colour]; j++) {
        const i = lit[colour][j]
        const a = cellAlpha[i]
        // The same value picks the glyph and its opacity. Glyphs cover less than a block, so they start brighter.
        ctx.globalAlpha = Math.min(1, 0.3 + a)
        ctx.fillText(RAMP[Math.min(RAMP.length - 1, Math.floor((a / 0.72) * RAMP.length))], (i % cols + 0.5) * cell, (Math.floor(i / cols) + 0.5) * cell)
      }
    }
    ctx.globalAlpha = 1
  }

  resize()
  draw()

  const ro = new ResizeObserver(() => {
    resize()
    draw()
  })
  ro.observe(canvas)
  const zonesRo = new ResizeObserver(measureZones)
  for (const el of keepClear) zonesRo.observe(el)

  if (still)
    return () => {
      ro.disconnect()
      zonesRo.disconnect()
    }

  let raf = 0
  let last = 0
  let acc = 0
  let onScreen = true
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop)
    acc += Math.min(0.1, (now - last) / 1000)
    last = now
    // Fixed steps, so the pond behaves the same at any frame rate.
    let steps = 0
    for (; acc >= STEP && steps < MAX_STEPS; steps++, acc -= STEP) step(STEP)
    if (steps === MAX_STEPS) acc = 0
    draw()
  }
  const start = () => {
    last = performance.now()
    raf = requestAnimationFrame(loop)
  }
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !onScreen) start()
    if (!entry.isIntersecting) cancelAnimationFrame(raf)
    onScreen = entry.isIntersecting
  })
  io.observe(canvas)

  const onClick = (e: MouseEvent) => {
    if (!(e.target instanceof Element) || e.target.closest('a, button') || food.length >= MAX_FOOD) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (x < 0 || x > W || y < 0 || y > H) return
    food.push({ x, y, age: 0 })
    playWaterRipple(e.clientX, e.clientY) // the same water drop as the language button
    report()
  }
  surface.addEventListener('click', onClick)
  start()

  return () => {
    cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
    zonesRo.disconnect()
    surface.removeEventListener('click', onClick)
  }
}
