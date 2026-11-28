import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { CARD_LABELS } from '../data/cards.ts'
import { useLang } from '../i18n'
import { Card } from './Card.tsx'
import '../styles/cards.css'

/** One photo of a picture set (a slidesCard's attrs.slides), shared by Carousel, Gallery and FeaturedPhotos. */
export interface Slide {
  src: string
  alt: string
  caption?: string
}

const slideEls = (el: HTMLElement) => [...el.children].filter((c) => c instanceof HTMLElement)

function nearest(el: HTMLElement) {
  const mid = el.scrollLeft + el.clientWidth / 2
  const dist = (c: HTMLElement) => Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid)
  return slideEls(el).reduce((best, c, i, all) => (dist(c) < dist(all[best]) ? i : best), 0)
}

export interface CarouselProps {
  slides: readonly Slide[]
}

/**
 * Image carousel for journal posts (after the interfaces.dev slider): the current slide in the
 * middle, the neighbours peek in at the faded edges, round prev / next buttons below.
 * Native scroll-snap does the swiping; a mouse can also drag, and ← / → move when it has focus.
 */
export function Carousel({ slides }: CarouselProps) {
  const { lang } = useLang()
  const t = CARD_LABELS[lang]
  const track = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null)
  const [index, setIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const last = slides.length - 1

  const go = (i: number) => {
    const el = track.current
    if (!el) return
    const c = slideEls(el)[Math.max(0, Math.min(last, i))]
    if (!c) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: c.offsetLeft - (el.clientWidth - c.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' })
  }

  useEffect(() => {
    const el = track.current
    if (!el) return
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
  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    if (Math.abs(e.clientX - d.x) > 3) d.moved = true
    e.currentTarget.scrollLeft = d.left - (e.clientX - d.x)
  }
  const up = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    drag.current = null
    setDragging(false)
    go(nearest(e.currentTarget)) // snap is off while dragging; settle on the nearest slide
  }

  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') go(index - 1)
    else if (e.key === 'ArrowRight') go(index + 1)
    else return
    e.preventDefault()
  }

  if (!slides.length) return null

  return (
    <section className="carousel" aria-roledescription="carousel" aria-label={t.slides}>
      <div
        ref={track}
        className="carousel__track"
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
            className="carousel__slide"
            role="group"
            aria-roledescription="slide"
            aria-label={t.slide.replace('{n}', String(i + 1)).replace('{total}', String(slides.length))}
            aria-hidden={i !== index || undefined}
          >
            <Card className="carousel__frame">
              <img src={s.src} alt={s.alt} loading="lazy" decoding="async" draggable={false} />
            </Card>
            {s.caption ? <figcaption className="post-figure__caption">{s.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
      {slides.length > 1 ? (
        <div className="carousel__nav">
          <button type="button" className="carousel__btn" onClick={() => go(index - 1)} disabled={index === 0} aria-label={t.prevSlide}>
            <Chevron dir={-1} />
          </button>
          <button type="button" className="carousel__btn" onClick={() => go(index + 1)} disabled={index === last} aria-label={t.nextSlide}>
            <Chevron dir={1} />
          </button>
        </div>
      ) : null}
    </section>
  )
}

function Chevron({ dir }: { dir: -1 | 1 }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d={dir < 0 ? 'M10 3.5L5.5 8l4.5 4.5' : 'M6 3.5L10.5 8 6 12.5'} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
