// Water ripple: a drop at (x, y) sends waves across the page. The real HTML bends like it sits under water.
// Wave equation on a coarse height grid (the two-buffer "Hugo Elias" method), the same idea as the
// ping-pong render targets in Codegrid's fluid-ripple demo, but on the CPU: no WebGL, no deps.
// Each frame the wave slopes become a displacement map (R = x, G = y, 128 = still) for an SVG
// feDisplacementMap filter on <html>. The root element is the one place a filter does not break
// position: fixed (CSS Filter Effects spec). A Canvas 2D overlay adds gold light on the crests.
// Everything is removed, and requestAnimationFrame stops, once the surface is still.
import { cssRgb } from './cssRgb.ts'

const STEP_MS = 1000 / 360
const WAVE_SPEED = Math.SQRT1_2
const REACH_MS = 800
const MIN_CELL = 4
const DAMPING = 0.996
const SPONGE = 40
const SPONGE_LOSS = 0.25
const DROP = 900
const DROP_R = 8
const BEND = 0.6
const BEND_PX = 64
// Near the viewport edges the shift fades to 0. Otherwise the filter samples past the edge, where there is
// no page, and white shows through. The band is wider than the largest shift (BEND_PX / 2).
const EDGE_PX = 40
const LIGHT = 0.0018
const MAX_ALPHA = 0.3
const SWAP_MS = 300
const MAX_MS = 1000
const FADE_MS = 300
const SVG_NS = 'http://www.w3.org/2000/svg'
const FILTER_ID = 'water-ripple-filter'

interface Sim {
  drop(px: number, py: number, onSwap?: () => void): void
}

let sim: Sim | null = null

/**
 * @param {number} x viewport x of the drop
 * @param {number} y viewport y of the drop
 * @param {() => void} [onSwap] runs once while the waves are strongest; at once with reduced motion
 */
export function playWaterRipple(x: number, y: number, onSwap?: () => void): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    onSwap?.()
    return
  }
  if (!sim) sim = createSim()
  if (!sim) {
    onSwap?.()
    return
  }
  sim.drop(x, y, onSwap)
}

function createSim(): Sim | null {
  // clientWidth leaves out the scrollbar: it is not page content, so it must not be sampled either.
  const vw = document.documentElement.clientWidth
  const vh = document.documentElement.clientHeight
  const cell = Math.max(MIN_CELL, Math.hypot(vw, vh) / (WAVE_SPEED * (REACH_MS / STEP_MS)))
  const w = Math.ceil(vw / cell) + 2
  const h = Math.ceil(vh / cell) + 2
  const gw = w + 2 * SPONGE
  const gh = h + 2 * SPONGE
  let cur = new Float32Array(gw * gh)
  let prev = new Float32Array(gw * gh)
  const damp = new Float32Array(gw * gh)
  for (let j = 0; j < gh; j++) {
    for (let i = 0; i < gw; i++) {
      const out = Math.max(SPONGE - i, i - (w + SPONGE - 1), SPONGE - j, j - (h + SPONGE - 1), 0) / SPONGE
      damp[j * gw + i] = DAMPING * (1 - SPONGE_LOSS * out * out)
    }
  }
  const swaps: Array<[number, () => void]> = []

  const light = document.createElement('canvas')
  light.width = w
  light.height = h
  light.setAttribute('aria-hidden', 'true')
  light.className = 'water-ripple'
  document.body.append(light)
  const lightCtx = light.getContext('2d')
  if (!lightCtx) {
    light.remove()
    return null
  }
  const lightImg = lightCtx.createImageData(w, h)

  const map = document.createElement('canvas')
  map.width = w
  map.height = h
  const mapCtx = map.getContext('2d')
  if (!mapCtx) {
    light.remove()
    return null
  }
  const mapImg = mapCtx.createImageData(w, h)

  const { svg, filter, image, displace } = createFilter()
  document.body.append(svg)
  const root = document.documentElement
  root.style.filter = `url(#${FILTER_ID})`

  const [r, g, b] = emberRgb()
  let raf = 0
  let start = performance.now()
  let last = start
  let pending = 0
  let energy = Infinity
  let x0 = gw, x1 = 0, y0 = gh, y1 = 0
  let frames = 0
  let lastScroll = ''

  function step() {
    x0 = Math.max(1, x0 - 1)
    y0 = Math.max(1, y0 - 1)
    x1 = Math.min(gw - 2, x1 + 1)
    y1 = Math.min(gh - 2, y1 + 1)
    let energy = 0
    for (let j = y0; j <= y1; j++) {
      for (let i = x0; i <= x1; i++) {
        const k = j * gw + i
        const v = ((cur[k - 1] + cur[k + 1] + cur[k - gw] + cur[k + gw]) / 2 - prev[k]) * damp[k]
        prev[k] = v
        energy = Math.max(energy, Math.abs(v))
      }
    }
    ;[cur, prev] = [prev, cur]
    return energy
  }

  const draw = (scrollLeft: number, scrollTop: number) => {
    const l = lightImg.data
    const m = mapImg.data
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const p = (j * w + i) * 4
        const k = (j + SPONGE) * gw + i + SPONGE
        const sx = cur[k - 1] - cur[k + 1]
        const sy = cur[k - gw] - cur[k + gw]
        const edge = Math.min(1, (Math.min(i, j, w - 1 - i, h - 1 - j) * cell) / EDGE_PX)
        m[p] = 128 + Math.max(-127, Math.min(127, sx * BEND)) * edge
        m[p + 1] = 128 + Math.max(-127, Math.min(127, sy * BEND)) * edge
        m[p + 2] = 128
        m[p + 3] = 255
        const slope = sx + sy
        const shine = slope > 0
        l[p] = shine ? r : 0
        l[p + 1] = shine ? g : 0
        l[p + 2] = shine ? b : 0
        l[p + 3] = Math.min(MAX_ALPHA, Math.abs(slope) * LIGHT) * 255
      }
    }
    lightCtx.putImageData(lightImg, 0, 0)
    mapCtx.putImageData(mapImg, 0, 0)

    // The root filter works in document coordinates: keep the map over the viewport as the page scrolls.
    const scroll = `${scrollLeft},${scrollTop}`
    if (scroll !== lastScroll) {
      lastScroll = scroll
      const box = { x: scrollLeft, y: scrollTop, width: vw, height: vh }
      for (const [k, v] of Object.entries(box)) {
        filter.setAttribute(k, String(v))
        image.setAttribute(k, String(v))
      }
    }
    // toBlob would not block, but Chrome encodes it in idle time, up to a second late, longer than the whole ripple.
    if (frames++ % 2 === 0) image.setAttribute('href', map.toDataURL())
  }

  function stop() {
    cancelAnimationFrame(raf)
    root.style.filter = ''
    light.remove()
    svg.remove()
    sim = null
    for (const [, fn] of swaps.splice(0)) fn() // never lose a language switch
  }

  function frame(now: number) {
    // Read the scroll position before this frame writes any style, so the read does not force a layout.
    const scrollLeft = scrollX
    const scrollTop = scrollY
    for (let n = swaps.length - 1; n >= 0; n--) {
      if (now >= swaps[n][0]) swaps.splice(n, 1)[0][1]()
    }
    pending = Math.min(pending + now - last, STEP_MS * 24)
    last = now
    if (pending < STEP_MS) {
      raf = requestAnimationFrame(frame)
      return
    }
    for (; pending >= STEP_MS; pending -= STEP_MS) energy = step()
    const fade = Math.min(1, energy / 20, (start + MAX_MS - now) / FADE_MS)
    displace.setAttribute('scale', String(BEND_PX * Math.max(0, fade)))
    light.style.opacity = String(Math.max(0, fade))
    draw(scrollLeft, scrollTop)
    if ((energy < 0.5 && !swaps.length) || now - start > MAX_MS) {
      stop()
      return
    }
    raf = requestAnimationFrame(frame)
  }

  return {
    drop(px: number, py: number, onSwap?: () => void) {
      const ci = Math.round(px / cell) + 1 + SPONGE
      const cj = Math.round(py / cell) + 1 + SPONGE
      for (let j = -DROP_R; j <= DROP_R; j++) {
        for (let i = -DROP_R; i <= DROP_R; i++) {
          const ii = ci + i
          const jj = cj + j
          const d2 = (i * i + j * j) / (DROP_R * DROP_R)
          if (ii < 1 || jj < 1 || ii >= gw - 1 || jj >= gh - 1 || d2 > 1) continue
          cur[jj * gw + ii] -= DROP * 0.5 * (1 + Math.cos(Math.PI * Math.sqrt(d2)))
        }
      }
      x0 = Math.min(x0, ci - DROP_R)
      x1 = Math.max(x1, ci + DROP_R)
      y0 = Math.min(y0, cj - DROP_R)
      y1 = Math.max(y1, cj + DROP_R)
      start = performance.now()
      if (onSwap) swaps.push([start + SWAP_MS, onSwap])
      if (!raf) raf = requestAnimationFrame(frame)
    },
  }
}

function createFilter() {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('aria-hidden', 'true')
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'
  const filter = document.createElementNS(SVG_NS, 'filter')
  filter.id = FILTER_ID
  filter.setAttribute('filterUnits', 'userSpaceOnUse')
  filter.setAttribute('primitiveUnits', 'userSpaceOnUse')
  // The map stores 128 as "no shift"; linearRGB would move that midpoint and shift the whole page.
  filter.setAttribute('color-interpolation-filters', 'sRGB')
  const image = document.createElementNS(SVG_NS, 'feImage')
  image.setAttribute('preserveAspectRatio', 'none')
  image.setAttribute('result', 'map')
  const displace = document.createElementNS(SVG_NS, 'feDisplacementMap')
  displace.setAttribute('in', 'SourceGraphic')
  displace.setAttribute('in2', 'map')
  displace.setAttribute('xChannelSelector', 'R')
  displace.setAttribute('yChannelSelector', 'G')
  displace.setAttribute('scale', '0')
  filter.append(image, displace)
  svg.append(filter)
  return { svg, filter, image, displace }
}

// Canvas cannot read CSS variables in fillStyle, so resolve --ember once.
function emberRgb() {
  const probe = document.createElement('span')
  probe.style.color = 'var(--ember)'
  document.body.append(probe)
  const rgb = cssRgb(getComputedStyle(probe).color)
  probe.remove()
  return rgb
}
