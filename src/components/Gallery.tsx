import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { CARD_LABELS } from '../data/cards.ts'
import { useLang } from '../i18n'
import { Button } from './Button.tsx'
import type { Slide } from './Carousel.tsx'
import '../styles/gallery.css'

export interface GalleryProps {
  photos: readonly Slide[]
  /** show only this many on the page, with a button that opens the rest in the dialog */
  limit?: number
}

/**
 * A wall of photos in rows of two, read left to right, with every fifth photo across the whole row. Each
 * frame is 16:9, and a caption shows over the photo on hover. A photo opens large and uncropped in a dialog,
 * where ← / → and the buttons move through the set and Esc closes.
 */
export function Gallery({ photos, limit }: GalleryProps) {
  const { lang } = useLang()
  const t = CARD_LABELS[lang]
  const view = useRef<HTMLDialogElement>(null)
  const [at, setAt] = useState(-1)
  const count = (i: number) => t.slide.replace('{n}', String(i + 1)).replace('{total}', String(photos.length))

  const open = (i: number) => {
    setAt(i)
    view.current?.showModal()
  }
  const step = (by: number) => setAt((i) => (i + by + photos.length) % photos.length)
  const key = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'ArrowLeft') step(-1)
    else if (e.key === 'ArrowRight') step(1)
  }

  if (!photos.length) return null
  const shown: Slide | undefined = photos[at] // at is -1 while the dialog is closed
  const onPage = limit && photos.length > limit ? photos.slice(0, limit) : photos

  return (
    <section className="gallery" aria-label={t.gallery}>
      <ul className="gallery__grid">
        {onPage.map((p, i) => (
          <li key={`${p.src}-${i}`}>
            <button type="button" className="gallery__item" onClick={() => open(i)} aria-label={p.alt || count(i)}>
              <img src={p.src} alt="" loading="lazy" decoding="async" />
              {p.caption ? <span className="gallery__caption">{p.caption}</span> : null}
            </button>
          </li>
        ))}
      </ul>
      {onPage.length < photos.length ? (
        <Button variant="ghost" className="gallery__more" onClick={() => open(onPage.length)}>
          {t.showAll.replace('{total}', String(photos.length))}
        </Button>
      ) : null}
      <dialog
        ref={view}
        className="gallery__view"
        aria-label={t.gallery}
        onClose={() => setAt(-1)}
        onKeyDown={key}
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      >
        {shown ? (
          <>
            <figure className="gallery__figure">
              <img src={shown.src} alt={shown.alt} />
              <figcaption className="gallery__meta">
                <span className="gallery__count">{`${at + 1} / ${photos.length}`}</span>
                {shown.caption}
              </figcaption>
            </figure>
            <Button variant="overlay" className="gallery__close" onClick={() => view.current?.close()} aria-label={t.close}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
                <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
              </svg>
            </Button>
            {photos.length > 1 ? (
              <>
                <Button variant="overlay" className="gallery__prev" onClick={() => step(-1)} aria-label={t.prevSlide}>
                  <Chevron dir={-1} />
                </Button>
                <Button variant="overlay" className="gallery__next" onClick={() => step(1)} aria-label={t.nextSlide}>
                  <Chevron dir={1} />
                </Button>
              </>
            ) : null}
          </>
        ) : null}
      </dialog>
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
