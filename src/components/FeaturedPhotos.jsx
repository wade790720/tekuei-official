import { useState } from 'react'
import { CARD_LABELS } from '../data/cards.js'
import { useLang } from '../i18n'
import '../styles/featured-photos.css'

/**
 * One work shown with its words beside it (after React Bits Pro's Gallery 3, without its tabs): a large
 * photo on one side, and on the other the title, a few lines about it, and a thumbnail of every photo.
 * Choosing a thumbnail puts that photo in the large frame.
 * @param {{ title?: string, text?: string, photos: { src: string, alt: string, caption?: string }[] }} props
 *   text  line breaks are kept, so the maker's name can sit on a line of its own
 */
export function FeaturedPhotos({ title, text, photos }) {
  const { lang } = useLang()
  const t = CARD_LABELS[lang]
  const [at, setAt] = useState(0)
  if (!photos.length) return null
  const shown = photos[Math.min(at, photos.length - 1)]

  return (
    <section className="featured" aria-label={title || t.gallery}>
      <div className="featured__grid">
        <figure className="featured__stage">
          <img src={shown.src} alt={shown.alt} decoding="async" />
          {shown.caption ? <figcaption className="post-figure__caption">{shown.caption}</figcaption> : null}
        </figure>
        <div className="featured__side">
          {title ? <h3 className="featured__title">{title}</h3> : null}
          {text ? <p className="featured__text">{text}</p> : null}
          {photos.length > 1 ? (
            <ul className="featured__thumbs">
              {photos.map((p, i) => (
                <li key={`${p.src}-${i}`}>
                  <button
                    type="button"
                    className="featured__thumb"
                    aria-pressed={i === at}
                    aria-label={p.alt || t.slide.replace('{n}', i + 1).replace('{total}', photos.length)}
                    onClick={() => setAt(i)}
                  >
                    <img src={p.src} alt="" loading="lazy" decoding="async" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  )
}
