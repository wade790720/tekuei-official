/**
 * Short UI sounds, synthesised live with Web Audio (no audio files).
 * Patches copied from recent.design (licence unknown): each sound is 1–3 layers
 * of an oscillator or noise, an optional filter and a gain envelope.
 * Silent when the reader asks for reduced motion, as on recent.design.
 */

const SILENT = 1e-4 // setTargetAtTime never reaches 0

/** @type {Record<string, { layers: object[] }>} */
export const SOUNDS = {
  press: {
    layers: [
      { source: { type: 'noise', color: 'white' }, filter: { type: 'bandpass', frequency: 2100, resonance: 0.9 }, envelope: { attack: 0, decay: 0.006, release: 0.003 }, gain: 0.124 },
      { source: { type: 'triangle', frequency: { start: 520, end: 430 } }, envelope: { attack: 0.001, decay: 0.038, release: 0.014 }, gain: 0.698 },
      { source: { type: 'sine', frequency: { start: 1220, end: 880 }, fm: { ratio: 0.5, depth: 35 } }, envelope: { attack: 0.001, decay: 0.018, release: 0.007 }, gain: 0.203 },
    ],
  },
  pressOutline: {
    layers: [
      { source: { type: 'noise', color: 'white' }, filter: { type: 'bandpass', frequency: 2950, resonance: 1.2 }, envelope: { attack: 0, decay: 0.005, release: 0.002 }, gain: 0.203 },
      { source: { type: 'sine', frequency: { start: 1250, end: 970 }, fm: { ratio: 0.5, depth: 48 } }, envelope: { attack: 0.001, decay: 0.025, release: 0.008 }, gain: 0.625 },
      { source: { type: 'triangle', frequency: { start: 220, end: 150 } }, envelope: { attack: 0, decay: 0.018, release: 0.006 }, gain: 0.187 },
    ],
  },
  pressSoft: {
    layers: [
      { source: { type: 'noise', color: 'pink' }, filter: { type: 'bandpass', frequency: 1980, resonance: 0.85 }, envelope: { attack: 0, decay: 0.007, release: 0.003 }, gain: 0.111 },
      { source: { type: 'sine', frequency: { start: 760, end: 580 }, fm: { ratio: 0.5, depth: 24 } }, filter: { type: 'lowpass', frequency: 2600, resonance: 0.7 }, envelope: { attack: 0.001, decay: 0.034, release: 0.012 }, gain: 0.576 },
      { source: { type: 'sine', frequency: { start: 1420, end: 1100 } }, envelope: { attack: 0.001, decay: 0.016, release: 0.006 }, gain: 0.155 },
    ],
  },
  pressGhost: {
    layers: [
      { source: { type: 'noise', color: 'white' }, filter: { type: 'bandpass', frequency: 7200, resonance: 1.1 }, envelope: { attack: 0, decay: 0.004, release: 0.002 }, gain: 0.25 },
      { source: { type: 'sine', frequency: { start: 2200, end: 1800 }, fm: { ratio: 0.5, depth: 42 } }, envelope: { attack: 0, decay: 0.014, release: 0.005 }, gain: 0.683 },
      { source: { type: 'triangle', frequency: { start: 320, end: 240 } }, envelope: { attack: 0, decay: 0.021, release: 0.008 }, gain: 0.25 },
    ],
  },
  pop: {
    layers: [{ source: { type: 'sine', frequency: { start: 300, end: 2000 } }, envelope: { attack: 0.008, decay: 0.12, release: 0.04 }, gain: 0.326 }],
  },
  select: {
    layers: [{ source: { type: 'sine', frequency: { start: 860, end: 1040 } }, envelope: { attack: 0.001, decay: 0.05, release: 0.02 }, gain: 0.5 }],
  },
  toggleOn: {
    layers: [
      { source: { type: 'sine', frequency: 520 }, envelope: { attack: 0.001, decay: 0.065, release: 0.02 }, gain: 0.315 },
      { source: { type: 'sine', frequency: 760 }, envelope: { attack: 0.001, decay: 0.07, release: 0.02 }, delay: 0.035, gain: 0.315 },
    ],
  },
  toggleOff: {
    layers: [
      { source: { type: 'sine', frequency: 620 }, envelope: { attack: 0.001, decay: 0.055, release: 0.018 }, gain: 0.352 },
      { source: { type: 'sine', frequency: 410 }, envelope: { attack: 0.001, decay: 0.055, release: 0.018 }, delay: 0.03, gain: 0.352 },
    ],
  },
  open: {
    layers: [{ source: { type: 'sine', frequency: { start: 420, end: 760 } }, envelope: { attack: 0.002, decay: 0.09, release: 0.03 }, gain: 0.392 }],
  },
  close: {
    layers: [{ source: { type: 'sine', frequency: { start: 720, end: 360 } }, envelope: { attack: 0.002, decay: 0.08, release: 0.025 }, gain: 0.408 }],
  },
  success: {
    layers: [
      { source: { type: 'sine', frequency: 523 }, envelope: { attack: 0.003, decay: 0.3, sustain: 0.06, release: 0.1 }, gain: 0.124 },
      { source: { type: 'sine', frequency: 659 }, envelope: { attack: 0.003, decay: 0.28, sustain: 0.05, release: 0.1 }, delay: 0.07, gain: 0.109 },
      { source: { type: 'sine', frequency: { start: 784, end: 880 } }, envelope: { attack: 0.003, decay: 0.32, sustain: 0.06, release: 0.12 }, delay: 0.14, gain: 0.116 },
    ],
  },
  error: {
    layers: [
      { source: { type: 'sawtooth', frequency: { start: 320, end: 140 } }, filter: { type: 'lowpass', frequency: 1200 }, envelope: { attack: 0, decay: 0.25, release: 0.08 }, gain: 0.261 },
      { source: { type: 'square', frequency: { start: 180, end: 80 } }, filter: { type: 'lowpass', frequency: 800 }, envelope: { attack: 0, decay: 0.2, release: 0.06 }, delay: 0.03, gain: 0.142 },
    ],
  },
  copy: {
    layers: [
      { source: { type: 'sine', frequency: 1200 }, envelope: { attack: 0, decay: 0.015, release: 0.006 }, gain: 0.627 },
      { source: { type: 'sine', frequency: 1400 }, envelope: { attack: 0, decay: 0.015, release: 0.006 }, delay: 0.04, gain: 0.549 },
    ],
  },
  save: {
    layers: [
      { source: { type: 'sine', frequency: { start: 800, end: 1200 } }, envelope: { attack: 0, decay: 0.03, release: 0.01 }, gain: 0.5 },
      { source: { type: 'sine', frequency: { start: 1000, end: 1500 } }, envelope: { attack: 0, decay: 0.03, release: 0.01 }, delay: 0.05, gain: 0.42 },
    ],
  },
  unsave: {
    layers: [
      { source: { type: 'sine', frequency: { start: 1500, end: 950 } }, envelope: { attack: 0, decay: 0.04, release: 0.01 }, gain: 0.392 },
      { source: { type: 'sine', frequency: { start: 1150, end: 750 } }, envelope: { attack: 0, decay: 0.04, release: 0.01 }, delay: 0.05, gain: 0.329 },
    ],
  },
  hover: {
    layers: [{ source: { type: 'sine', frequency: 1300 }, envelope: { attack: 0.005, decay: 0.015, release: 0.008 }, gain: 0.641 }],
  },
}

let ctx = null
const noiseCache = new Map()
const reducedMotion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null

function audio() {
  if (!ctx || ctx.state === 'closed') ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// One second of noise per colour, reused. Pink is Paul Kellet's filter on white noise.
function noise(ac, color) {
  const key = `${color}@${ac.sampleRate}`
  if (noiseCache.has(key)) return noiseCache.get(key)
  const buffer = ac.createBuffer(1, ac.sampleRate, ac.sampleRate)
  const d = buffer.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1
    if (color !== 'pink') {
      d[i] = w
      continue
    }
    b0 = 0.99886 * b0 + w * 0.0555179
    b1 = 0.99332 * b1 + w * 0.0750759
    b2 = 0.969 * b2 + w * 0.153852
    b3 = 0.8665 * b3 + w * 0.3104856
    b4 = 0.55 * b4 + w * 0.5329522
    b5 = -0.7616 * b5 - w * 0.016898
    d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
    b6 = w * 0.115926
  }
  noiseCache.set(key, buffer)
  return buffer
}

function playLayer(ac, { source, filter, envelope, delay = 0, gain = 0.5 }) {
  const t = ac.currentTime + delay
  const { attack = 0, decay, sustain = 0, release = 0 } = envelope
  const length = attack + decay + release

  // Envelope: rise to the peak, then fall exponentially (a third of the decay is one time constant).
  const amp = ac.createGain()
  amp.gain.setValueAtTime(SILENT, t)
  if (attack > 0) amp.gain.linearRampToValueAtTime(gain, t + attack)
  else amp.gain.setValueAtTime(gain, t)
  if (sustain > 0) {
    amp.gain.setTargetAtTime(Math.max(sustain * gain, SILENT), t + attack, decay / 3)
    amp.gain.setTargetAtTime(SILENT, t + attack + decay, release / 3)
  } else amp.gain.setTargetAtTime(SILENT, t + attack, decay / 3)

  const nodes = [amp]
  let src
  if (source.type === 'noise') {
    src = ac.createBufferSource()
    src.buffer = noise(ac, source.color)
  } else {
    src = ac.createOscillator()
    src.type = source.type
    const f = source.frequency
    if (typeof f === 'number') src.frequency.setValueAtTime(f, t)
    else {
      src.frequency.setValueAtTime(f.start, t)
      src.frequency.exponentialRampToValueAtTime(Math.max(f.end, 1), t + length)
    }
    if (source.fm) {
      const mod = ac.createOscillator()
      const depth = ac.createGain()
      mod.frequency.value = (typeof f === 'number' ? f : f.start) * source.fm.ratio
      depth.gain.value = source.fm.depth
      mod.connect(depth).connect(src.frequency)
      mod.start(t)
      mod.stop(t + length + 0.1)
      nodes.push(mod, depth)
    }
  }
  nodes.push(src)

  let out = src
  if (filter) {
    const biquad = ac.createBiquadFilter()
    biquad.type = filter.type
    biquad.frequency.setValueAtTime(filter.frequency, t)
    biquad.Q.value = filter.resonance ?? 1
    out = out.connect(biquad)
    nodes.push(biquad)
  }
  out.connect(amp).connect(ac.destination)
  src.start(t)
  src.stop(t + length + 0.1)
  src.onended = () => nodes.forEach((n) => n.disconnect())
}

/**
 * Play one of SOUNDS. Call it from a user gesture (click, key): browsers start audio only after one.
 * @param {keyof typeof SOUNDS} name
 */
export function playSound(name) {
  const sound = SOUNDS[name]
  if (!sound || reducedMotion?.matches || typeof AudioContext !== 'function') return
  const ac = audio()
  for (const layer of sound.layers) playLayer(ac, layer)
}

/**
 * Which sound a click on this element makes. `data-sound="<name>"` on the element or an ancestor
 * picks one, `data-sound="off"` mutes it. Otherwise: menu items `select`, the save button `press`,
 * other buttons `pressSoft`, links `pressGhost` (recent.design's ghost / navigation sound).
 * @param {Element} target
 * @returns {string | null}
 */
export function soundFor(target) {
  const el = target.closest('[data-sound], [role^="menuitem"], button, a[href], [role="button"]')
  if (!el) return null
  if (el.dataset.sound) return el.dataset.sound === 'off' ? null : el.dataset.sound
  if (el.getAttribute('role')?.startsWith('menuitem')) return 'select'
  if (el.classList.contains('cms-save')) return 'press'
  if (el.matches('a[href]')) return 'pressGhost'
  return 'pressSoft'
}

/**
 * Every link and button click on the page plays its sound (see soundFor). Returns cleanup.
 * One listener on the document, so new components need no wiring.
 */
export function mountClickSounds(root = document) {
  const onClick = (e) => {
    if (!(e.target instanceof Element)) return
    const name = soundFor(e.target)
    if (name) playSound(name)
  }
  root.addEventListener('click', onClick, true)
  return () => root.removeEventListener('click', onClick, true)
}
