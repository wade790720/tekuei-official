// A design-spec overlay on a real UI sample, as in a handoff file: spacing bands, a selection box,
// baseline and x-height guides, and font / colour chips on dotted leaders.
// Every number is measured from the DOM, so the overlay shows what the CSS really does.
import { useEffect, useRef, useState } from 'react'
import { SPEC_SAMPLE } from './foundations.data.js'

const rel = (r, o) => ({ x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height })
const px = (v) => Math.round(parseFloat(v))

const hex = (css) => {
  const m = css.match(/rgba?\(([^)]+)\)/)
  if (!m) return css
  const [r, g, b, a = 1] = m[1].split(/[,\s/]+/).filter(Boolean).map(Number)
  const h = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
  return a < 1 ? `${h} · ${Math.round(a * 100)}%` : h
}

const family = (cs) =>
  cs.fontFamily
    .split(',')
    .map((f) => f.trim().replace(/["']/g, ''))
    .slice(0, cs.fontFamily.includes('Instrument') ? 2 : 1)
    .join(' + ')

// Stack chips in the right gutter so they never overlap; each keeps a leader to its target.
const stack = (chips, minGap = 36) => {
  let last = -Infinity
  return [...chips]
    .sort((a, b) => a.ty - b.ty)
    .map((c) => {
      const y = Math.max(c.ty, last + minGap)
      last = y
      return { ...c, y }
    })
}

// A Figma-style measurement: a thin "I" across the gap, with caps at both ends and the value in a pill.
// Gaps that are wider than tall measure their width; the rest measure their height.
function beam(b, columnX) {
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

function build(mode, stage, el) {
  const o = stage.getBoundingClientRect()
  const box = (k) => rel(el[k].getBoundingClientRect(), o)
  const text = (k) => {
    const range = document.createRange()
    range.selectNodeContents(el[k])
    return rel(range.getBoundingClientRect(), o)
  }
  const card = box('card')
  const [meta, title, lead, body, actions, b0, b1] = ['meta', 'title', 'lead', 'body', 'actions', 'b0', 'b1'].map(box)
  const gutter = card.x + card.w + 56
  const out = { w: o.width, h: o.height, bands: [], guides: [], chips: [], select: null }

  if (mode === 'spacing') {
    const t0 = text('b0t')
    const v = (a, b) => ({ x: card.x + (meta.x - card.x), y: a.y + a.h, w: meta.w, h: b.y - (a.y + a.h) })
    out.bands = [
      { x: card.x, y: card.y, w: card.w, h: meta.y - card.y },
      { x: card.x, y: meta.y, w: meta.x - card.x, h: actions.y + actions.h - meta.y },
      v(meta, title),
      v(title, lead),
      v(lead, body),
      v(body, actions),
      // padding bands start inside the border, so they show padding only
      { x: actions.x, y: actions.y + el.actions.clientTop, w: actions.w, h: b0.y - actions.y - el.actions.clientTop },
      { x: b0.x + el.b0.clientLeft, y: b0.y, w: t0.x - b0.x - el.b0.clientLeft, h: b0.h },
      { x: b0.x + b0.w, y: b0.y, w: b1.x - (b0.x + b0.w), h: b0.h },
    ].map((b) => beam(b, meta.x + 24))
  }

  if (mode === 'typography') {
    const t = text('title')
    out.select = { ...t, label: `${Math.round(t.w)} × ${Math.round(t.h)}` }
    const base = box('base').y
    const cs = getComputedStyle(el.title)
    const ctx = document.createElement('canvas').getContext('2d')
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
    const xh = ctx.measureText('x').actualBoundingBoxAscent
    out.guides = [
      { y: base, x: t.x, w: t.w, label: 'baseline' },
      { y: base - xh, x: t.x, w: t.w, label: 'x-height' },
    ]
    const chip = (k, token, r) => {
      const s = getComputedStyle(el[k])
      const ls = parseFloat(s.letterSpacing) ? ` · ${(parseFloat(s.letterSpacing) / parseFloat(s.fontSize)).toFixed(2)}em` : ''
      return {
        ty: r.y + r.h / 2,
        tx: r.x + r.w,
        text: `${family(s)}`,
        sub: `${token} · ${px(s.fontSize)}/${px(s.lineHeight)} · ${s.fontWeight}${ls}`,
      }
    }
    out.chips = stack([
      chip('meta', '--type-label', text('meta')),
      chip('title', '--type-h1', { ...t, h: base - t.y }),
      chip('lead', '--type-lead', { ...lead, w: lead.w }),
      chip('body', '--type-body', body),
      chip('b0', '--type-small', b0),
    ])
  }

  if (mode === 'color') {
    const c = (k, prop) => hex(getComputedStyle(el[k])[prop])
    const accent = text('accent')
    out.chips = stack([
      { ty: card.y + 20, tx: card.x + card.w - 12, text: '--surface-1', sub: c('card', 'backgroundColor') },
      { ty: accent.y + accent.h / 2, tx: accent.x + accent.w, text: '--ember', sub: c('accent', 'color') },
      { ty: meta.y + meta.h / 2, tx: text('meta').x + text('meta').w, text: '--text-tertiary', sub: c('meta', 'color') },
      { ty: title.y + title.h / 2, tx: text('title').x + text('title').w, text: '--text-primary', sub: c('title', 'color') },
      { ty: lead.y + lead.h / 2, tx: lead.x + lead.w, text: '--text-secondary', sub: c('lead', 'color') },
      { ty: body.y + body.h / 2, tx: body.x + body.w, text: '--text-body', sub: c('body', 'color') },
      { ty: actions.y, tx: actions.x + actions.w, text: '--line', sub: c('actions', 'borderTopColor') },
      { ty: b1.y + b1.h / 2, tx: b1.x + b1.w, text: '--line-strong', sub: c('b1', 'borderTopColor') },
    ])
  }

  out.chips = out.chips.map((ch) => ({ ...ch, x: gutter }))
  return out
}

/** The same sample card, annotated for one foundation: 'spacing' | 'typography' | 'color'. */
export function SpecView({ mode }) {
  const stageRef = useRef(null)
  const [m, setM] = useState(null)

  useEffect(() => {
    const stage = stageRef.current
    let alive = true
    const els = Object.fromEntries([...stage.querySelectorAll('[data-k]')].map((n) => [n.dataset.k, n]))
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
                  const cap = (x, y) =>
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
                {m.chips.map((c, i) => (
                  <g key={i} className="fd-spec__leader">
                    <polyline points={`${c.tx},${c.ty} ${c.x - 20},${c.ty} ${c.x - 20},${c.y} ${c.x},${c.y}`} />
                    <circle cx={c.tx} cy={c.ty} r="2.5" />
                  </g>
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
              {m.chips.map((c, i) => (
                <span key={i} className="fd-spec__chip" style={{ left: c.x, top: c.y }}>
                  <b>{c.text}</b>
                  <small>{c.sub}</small>
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
