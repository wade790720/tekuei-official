import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import '../styles/homeHero.css'
import bgSrc from '../assets/hero/bg.webp'
import cutSrc from '../assets/hero/cut.webp'
import altSrc from '../assets/hero/alt.webp'
import { HOME_HERO } from '../data/homepage.js'
import { useJournal } from '../context/journal.js'
import { postTags } from '../data/journal.js'
import { mountHeroFx } from '../lib/heroFx.js'
import { useLang } from '../i18n'

const lines = (arr) =>
  arr.map((line, i) => (
    <span key={line}>
      {i > 0 ? <br /> : null}
      {line}
    </span>
  ))

export function HomeHero() {
  const { lang } = useLang()
  const hero = HOME_HERO[lang]
  const posts = useJournal().content.posts[lang].slice(0, 3)
  const root = useRef(null)
  const bg = useRef(null)
  const cut = useRef(null)
  const alt = useRef(null)
  const canvas = useRef(null)

  useEffect(
    () => mountHeroFx({ root: root.current, bg: bg.current, cut: cut.current, alt: alt.current, canvas: canvas.current }),
    [],
  )

  return (
    <>
      <section className="home-banner" ref={root} aria-label={hero.ariaLabel}>
        <div className="home-banner__stage" aria-hidden>
          <img ref={bg} src={bgSrc} alt="" />
          <img ref={cut} src={cutSrc} alt="" />
          <img ref={alt} src={altSrc} alt="" className="home-banner__alt" />
          <canvas ref={canvas} />
        </div>
        <div className="home-banner__scrim" aria-hidden />
        <div className="home-banner__lead">
          <h1>{lines(hero.headline)}</h1>
          <Link to="/journal" className="home-banner__pill">
            {hero.cta} <span aria-hidden>↗</span>
          </Link>
        </div>
        <p className="home-banner__aside">{lines(hero.aside)}</p>
      </section>

      <section className="home-latest" aria-labelledby="home-latest-title">
        <div className="home-latest__bar">
          <h2 id="home-latest-title">{hero.latestLabel}</h2>
          <Link to="/journal">
            {hero.viewAll} <span aria-hidden>↗</span>
          </Link>
        </div>
        <ul className="home-latest__cards">
          {posts.map((post, i) => (
            <li key={post.slug}>
              <Link to={`/journal/${post.slug}`}>
                <span className={`home-latest__thumb home-latest__thumb--${i + 1}`} aria-hidden />
                <span className="home-latest__body">
                  <span className="home-latest__meta">
                    {postTags(post).join(', ')} · {post.readMin} MIN
                  </span>
                  <span className="home-latest__title">{post.title}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
