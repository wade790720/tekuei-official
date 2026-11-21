import { useEffect, useRef, useState } from 'react'
import '../styles/homeHero.css'
import { HOME_FOOTER, HOME_HERO, HOME_META } from '../data/homepage.js'
import { mountGrainHaze } from '../lib/grainHaze.js'
import { mountKoiPond } from '../lib/koiPond.js'
import { useLang } from '../i18n'

const two = (n) => String(n).padStart(2, '0')

/** First screen: koi swim behind the words. A click on the water drops food (koiPond.js). */
function KoiHero({ hero, intro, links }) {
  const root = useRef(null)
  const canvas = useRef(null)
  const haze = useRef(null)
  const name = useRef(null)
  const [count, setCount] = useState({ koi: 0, food: 0 })

  useEffect(() => mountKoiPond(canvas.current, { surface: root.current, avoid: name.current, onCount: setCount }), [])

  useEffect(() => mountGrainHaze(haze.current), [])

  return (
    <section className="home-koi" ref={root} aria-label={hero.ariaLabel}>
      <canvas className="home-koi__haze" ref={haze} aria-hidden />
      <canvas className="home-koi__pond" ref={canvas} aria-hidden />
      <div className="home-koi__top">
        <p className="home-koi__motto">{hero.headline}</p>
        <div className="home-koi__intro">
          {/* One span per clause: a line can break after a comma, never inside a word. */}
          <p>
            {intro.split(/(?<=，)/).map((clause) => (
              <span key={clause}>{clause}</span>
            ))}
          </p>
          {/* The nav's Contact link points here. */}
          <p className="home-koi__label" id="contact">
            {links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </p>
        </div>
      </div>
      <div className="home-koi__foot">
        <p className="home-koi__label" aria-hidden>
          <span>
            {hero.koiLabel} {two(count.koi)}
          </span>
          <span>
            {hero.foodLabel} {two(count.food)}
          </span>
          <span className="home-koi__hint">{hero.hint}</span>
        </p>
        <h1 ref={name}>{hero.fullName}</h1>
      </div>
    </section>
  )
}

export function HomeHero() {
  const { lang } = useLang()
  return <KoiHero hero={HOME_HERO[lang]} intro={HOME_META[lang].description} links={HOME_FOOTER[lang].contact} />
}
