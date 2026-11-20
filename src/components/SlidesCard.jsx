import { useEffect, useRef, useState } from 'react'
import { CARD_LABELS } from '../data/cards.js'
import { useLang } from '../i18n'
import { Card } from './Card.jsx'
import '../styles/cards.css'

// The slide whose centre is nearest the track's centre.
function nearest(el) {
  const mid = el.scrollLeft + el.clientWidth / 2
  const dist = (c) => Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid)
  return [...el.children].reduce((best, c, i, all) => (dist(c) < dist(all[best]) ? i : best), 0)
}

/**
 * Image carousel for journal posts (after the interfaces.dev slider): the current slide in the
 * middle, the neighbours peek in at the faded edges, round prev / next buttons below.
 * Native scroll-snap does the swiping; a mouse can also drag, and ← / → move when it has focus.
 * @param {{ slides: { src: string, alt: string, caption?: string }[] }} props
 */
export function SlidesCard({ slides }) {
  const { lang } = useLang()
  const t = CARD_LABELS[lang]
  const track = useRef(null)
  const drag = useRef(null)
  const [index, setIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const last = slides.length - 1

  const go = (i) => {
    const el = track.current
    const c = el.children[Math.max(0, Math.min(last, i))]
    if (!c) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: c.offsetLeft - (el.clientWidth - c.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' })
  }

  useEffect(() => {
    const el = track.current
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setIndex(nearest(el)))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Mouse drag. Touch and trackpads already scroll natively.
  const down = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false }
    track.current.setPointerCapture(e.pointerId)
    setDragging(true)
  }
  const move = (e) => {
    const d = drag.current
    if (!d) return
    if (Math.abs(e.clientX - d.x) > 3) d.moved = true
    track.current.scrollLeft = d.left - (e.clientX - d.x)
  }
  const up = () => {
    if (!drag.current) return
    drag.current = null
    setDragging(false)
    go(nearest(track.current)) // snap is off while dragging; settle on the nearest slide
  }

  const key = (e) => {
    if (e.key === 'ArrowLeft') go(index - 1)
    else if (e.key === 'ArrowRight') go(index + 1)
    else return
    e.preventDefault()
  }

  if (!slides.length) return null

  return (
    <section className="slides-card" aria-roledescription="carousel" aria-label={t.slides}>
      <div
        ref={track}
        className="slides-card__track"
        data-dragging={dragging || undefined}
        tabIndex={0}
        onKeyDown={key}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        {slides.map((s, i) => (
          <figure
            key={`${s.src}-${i}`}
            className="slides-card__slide"
            role="group"
            aria-roledescription="slide"
            aria-label={t.slide.replace('{n}', i + 1).replace('{total}', slides.length)}
            aria-hidden={i !== index || undefined}
          >
            <Card className="slides-card__frame">
              <img src={s.src} alt={s.alt} loading="lazy" decoding="async" draggable={false} />
            </Card>
            {s.caption ? <figcaption className="post-figure__caption">{s.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
      {slides.length > 1 ? (
        <div className="slides-card__nav">
          <button type="button" className="slides-card__btn" onClick={() => go(index - 1)} disabled={index === 0} aria-label={t.prevSlide}>
            <Chevron dir={-1} />
          </button>
          <button type="button" className="slides-card__btn" onClick={() => go(index + 1)} disabled={index === last} aria-label={t.nextSlide}>
            <Chevron dir={1} />
          </button>
        </div>
      ) : null}
    </section>
  )
}

function Chevron({ dir }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d={dir < 0 ? 'M10 3.5L5.5 8l4.5 4.5' : 'M6 3.5L10.5 8 6 12.5'} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
