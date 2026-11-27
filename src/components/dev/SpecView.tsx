// A design-spec overlay on a real UI sample, as in a handoff file: spacing bands, a selection box,
// baseline and x-height guides.
// Every number is measured from the DOM, so the overlay shows what the CSS really does.
import { useEffect, useRef, useState } from 'react'
import { SPEC_SAMPLE } from './foundations.data.ts'

interface Box {
  x: number
  y: number
  w: number
  h: number
}

interface Beam extends Box {
  value: number
  x1: number
  y1: number
  x2: number
  y2: number
  lx: number
  ly: number
  anchor: 'left' | 'below' | 'above'
}

interface Guide {
  y: number
  x: number
  w: number
  label: string
}

interface Measured {
  w: number
  h: number
  bands: Beam[]
  guides: Guide[]
  select: (Box & { label: string }) | null
}

type SpecMode = 'spacing' | 'typography'
type Els = Record<string, HTMLElement>

const rel = (r: DOMRect, o: DOMRect): Box => ({ x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height })

// A Figma-style measurement: a thin "I" across the gap, with caps at both ends and the value in a pill.
// Gaps that are wider than tall measure their width; the rest measure their height.
function beam(b: Box, columnX: number): Beam {
  const across = b.w < b.h
  const value = Math.round(across ? b.w : b.h)
  if (!across) {
    const x = columnX
    return { ...b, value, x1: x, y1: b.y, x2: x, y2: b.y + b.h, lx: x + 6, ly: b.y + b.h / 2, anchor: 'left' }
  }
  const y = b.y + b.h / 2
  // Tall gaps (the card's side padding) take the pill above the line; short ones (buttons) put it underneath
  const below = b.h < 60
  return {
    ...b,
    value,
    x1: b.x,
    y1: y,
    x2: b.x + b.w,
    y2: y,
    lx: b.x + b.w / 2,
    ly: below ? b.y + b.h + 4 : y - 4,
    anchor: below ? 'below' : 'above',
  }
}

function build(mode: SpecMode, stage: HTMLElement, el: Els): Measured {
  const o = stage.getBoundingClientRect()
  const box = (k: string) => rel(el[k].getBoundingClientRect(), o)
  const text = (k: string) => {
    const range = document.createRange()
    range.selectNodeContents(el[k])
    return rel(range.getBoundingClientRect(), o)
  }
  const card = box('card')
  const [meta, title, lead, body, b0, b1] = ['meta', 'title', 'lead', 'body', 'b0', 'b1'].map(box)
  const out: Measured = { w: o.width, h: o.height, bands: [], guides: [], select: null }

  if (mode === 'spacing') {
    const v = (a: Box, b: Box): Box => ({ x: card.x + (meta.x - card.x), y: a.y + a.h, w: meta.w, h: b.y - (a.y + a.h) })
    out.bands = [
      { x: card.x, y: card.y, w: card.w, h: meta.y - card.y },
      v(meta, title),
      v(lead, body),
      { x: b0.x + b0.w, y: b0.y, w: b1.x - (b0.x + b0.w), h: b0.h },
    ].map((b) => beam(b, meta.x + 24))
  }

  if (mode === 'typography') {
    const t = text('title')
    out.select = { ...t, label: `${Math.round(t.w)} × ${Math.round(t.h)}` }
    const base = box('base').y
    const cs = getComputedStyle(el.title)
    const ctx = document.createElement('canvas').getContext('2d')
    if (!ctx) return out
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
    const xh = ctx.measureText('x').actualBoundingBoxAscent
    out.guides = [
      { y: base, x: t.x, w: t.w, label: 'baseline' },
      { y: base - xh, x: t.x, w: t.w, label: 'x-height' },
    ]
  }
  return out
}

/** The same sample card, annotated for one foundation: 'spacing' | 'typography'. */
export function SpecView({ mode }: { mode: SpecMode }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [m, setM] = useState<Measured | null>(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    let alive = true
    const els = Object.fromEntries([...stage.querySelectorAll<HTMLElement>('[data-k]')].map((n) => [n.dataset.k, n]))
    const run = () => alive && setM(build(mode, stage, els))
    const ro = new ResizeObserver(run)
    ro.observe(stage)
    document.fonts?.ready.then(run)
    return () => {
      alive = false
      ro.disconnect()
    }
  }, [mode])

  const s = SPEC_SAMPLE
  return (
    <figure className="fd-spec">
      <div className="fd-spec__scroll">
        <div className="fd-spec__stage" ref={stageRef}>
          <article className="fd-spec__card" data-k="card">
            <p className="fd-spec__meta" data-k="meta">
              <span className="fd-spec__accent" data-k="accent">
                {s.section}
              </span>{' '}
              · {s.meta}
            </p>
            <h4 className="fd-spec__title" data-k="title">
              <span className="fd-spec__base" data-k="base" />
              {s.title}
            </h4>
            <p className="fd-spec__lead" data-k="lead">
              {s.lead}
            </p>
            <p className="fd-spec__body" data-k="body">
              {s.body}
            </p>
            <div className="fd-spec__actions" data-k="actions">
              <span className="fd-spec__btn fd-spec__btn--primary" data-k="b0">
                <span data-k="b0t">{s.actions[0]}</span>
              </span>
              <span className="fd-spec__btn" data-k="b1">
                {s.actions[1]}
              </span>
            </div>
          </article>

          {m ? (
            <div className="fd-spec__overlay" aria-hidden>
              <svg className="fd-spec__svg" width={m.w} height={m.h}>
                {m.bands.map((b, i) => {
                  const v = b.x1 === b.x2
                  const cap = (x: number, y: number) =>
                    v ? <line x1={x - 4} x2={x + 4} y1={y} y2={y} /> : <line x1={x} x2={x} y1={y - 4} y2={y + 4} />
                  return (
                    <g key={i} className="fd-spec__beam">
                      <line x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} />
                      {cap(b.x1, b.y1)}
                      {cap(b.x2, b.y2)}
                    </g>
                  )
                })}
                {m.select ? (
                  <rect className="fd-spec__select" x={m.select.x} y={m.select.y} width={m.select.w} height={m.select.h} />
                ) : null}
                {m.guides.map((g) => (
                  <line key={g.label} className="fd-spec__guide" x1={g.x - 16} x2={g.x + g.w + 16} y1={g.y} y2={g.y} />
                ))}
              </svg>
              {m.bands.map((b, i) => (
                <span key={i} className="fd-spec__tag" data-anchor={b.anchor} style={{ left: b.lx, top: b.ly }}>
                  {b.value}
                </span>
              ))}
              {m.select ? (
                <span className="fd-spec__tag fd-spec__tag--size" style={{ left: m.select.x, top: m.select.y }}>
                  {m.select.label}
                </span>
              ) : null}
              {m.guides.map((g) => (
                <span key={g.label} className={`fd-spec__guide-label${g.label === 'baseline' ? ' fd-spec__guide-label--below' : ''}`} style={{ left: g.x + g.w + 20, top: g.y }}>
                  {g.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <figcaption className="fd-spec__caption">{s.captions[mode]}</figcaption>
    </figure>
  )
}
