import { useEffect, useRef, useState } from 'react'
import '../styles/homeHero.css'
import { HOME_HERO } from '../data/homepage.js'
import { mountGrainHaze } from '../lib/grainHaze.js'
import { mountKoiPond } from '../lib/koiPond.js'
import { useLang } from '../i18n'

const two = (n) => String(n).padStart(2, '0')

/** First screen: koi swim behind the words. A click on the water drops food (koiPond.js). */
function KoiHero({ hero }) {
  const root = useRef(null)
  const canvas = useRef(null)
  const haze = useRef(null)
  const [count, setCount] = useState({ koi: 0, food: 0 })

  useEffect(
    () =>
      mountKoiPond(canvas.current, {
        surface: root.current,
        // Every block of words on the pond, and the parts of the site header above it.
        avoid: [
          ...root.current.querySelectorAll('.home-koi__motto, .home-koi__intro, .home-koi__foot > *'),
          ...document.querySelectorAll('.site-nav > *'),
        ],
        onCount: setCount,
      }),
    [],
  )

  useEffect(() => mountGrainHaze(haze.current), [])

  return (
    <section className="home-koi" ref={root} aria-label={hero.ariaLabel}>
      <canvas className="home-koi__haze" ref={haze} aria-hidden />
      <canvas className="home-koi__pond" ref={canvas} aria-hidden />
      <div className="home-koi__top">
        <p className="home-koi__motto">
          {hero.motto.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
        <div className="home-koi__intro">
          <p className="home-koi__lead">{hero.lead}</p>
          <p>
            {hero.body.split(new RegExp(`(${hero.keywords.join('|')})`)).map((part) =>
              hero.keywords.includes(part) ? <mark key={part}>{part}</mark> : part,
            )}
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
        <h1>{hero.fullName}</h1>
      </div>
    </section>
  )
}

export function HomeHero() {
  const { lang } = useLang()
  return <KoiHero hero={HOME_HERO[lang]} />
}
