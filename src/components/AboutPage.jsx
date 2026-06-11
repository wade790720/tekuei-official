import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CustomCursor } from './CustomCursor.jsx'
import { DiagonalGrid } from './DiagonalGrid.jsx'
import { HomeFadeIn } from './HomeFadeIn.jsx'
import { TekueiSiteNav } from './TekueiSiteNav.jsx'
import {
  ABOUT_APPROACH,
  ABOUT_BELIEFS,
  ABOUT_CTA,
  ABOUT_FOUNDER,
  ABOUT_HERO,
  ABOUT_INTRO,
  ABOUT_META,
  ABOUT_QUOTE,
  ABOUT_SERVICES,
} from '../data/about.js'
import '../styles/tekueiAbout.css'

export default function AboutPage() {
  useEffect(() => {
    document.title = ABOUT_META.title
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', ABOUT_META.description)
  }, [])

  return (
    <div className="tekuei-about-page">
      <DiagonalGrid extent="document" className="tekuei-about-page__grid" />
      <CustomCursor interactiveSelector="a" />
      <TekueiSiteNav />

      <header className="about-header">
        <div className="about-header__inner">
          <div>
            <div className="about-header__pre">{ABOUT_HERO.pre}</div>
            <h1 className="about-header__title">{ABOUT_HERO.title}</h1>
            <div className="about-header__subtitle">{ABOUT_HERO.subtitle}</div>
          </div>
          <div className="about-header__aside">
            <div className="about-header__tagline">{ABOUT_HERO.tagline}</div>
            <div className="about-header__belief">{ABOUT_HERO.belief}</div>
          </div>
        </div>
      </header>

      <div className="about-rule" aria-hidden>
        <div className="about-rule__line" />
      </div>

      <section className="about-intro" aria-labelledby="about-intro-title">
        <div className="about-section-inner">
          <HomeFadeIn>
            <div className="about-label">{ABOUT_INTRO.label}</div>
            <h2 className="about-title" id="about-intro-title">
              {ABOUT_INTRO.title.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h2>
          </HomeFadeIn>
          <div className="about-intro__body">
            {ABOUT_INTRO.paragraphs.map((p) => (
              <HomeFadeIn key={p.slice(0, 20)} className="about-intro__para">
                {p}
              </HomeFadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="about-founder" aria-labelledby="about-founder-title">
        <div className="about-section-inner about-founder__grid">
          <HomeFadeIn className="about-founder__visual" aria-hidden>
            <div className="about-founder__frame">
              <div className="about-founder__glow" />
              <div className="about-founder__name">{ABOUT_FOUNDER.name}</div>
            </div>
          </HomeFadeIn>
          <div className="about-founder__copy">
            <HomeFadeIn>
              <div className="about-label">{ABOUT_FOUNDER.label}</div>
              <h2 className="about-title about-title--sm" id="about-founder-title">
                {ABOUT_FOUNDER.title}
              </h2>
              <div className="about-founder__role">{ABOUT_FOUNDER.role}</div>
            </HomeFadeIn>
            {ABOUT_FOUNDER.paragraphs.map((p) => (
              <HomeFadeIn key={p.slice(0, 24)} className="about-founder__para">
                {p}
              </HomeFadeIn>
            ))}
            <HomeFadeIn className="about-founder__traits">
              {ABOUT_FOUNDER.traits.map((t) => (
                <span key={t} className="about-founder__trait">
                  {t}
                </span>
              ))}
            </HomeFadeIn>
          </div>
        </div>
      </section>

      <section className="about-approach" aria-labelledby="about-approach-title">
        <div className="about-section-inner">
          <HomeFadeIn>
            <div className="about-label">{ABOUT_APPROACH.label}</div>
            <h2 className="about-title" id="about-approach-title">
              {ABOUT_APPROACH.title.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h2>
          </HomeFadeIn>
          <div className="about-approach__grid">
            {ABOUT_APPROACH.items.map((item) => (
              <HomeFadeIn key={item.num} className="about-approach__card">
                <div className="about-approach__num">{item.num}</div>
                <h3 className="about-approach__card-title">
                  {item.title}
                  <span className="about-approach__card-en">{item.en}</span>
                </h3>
                <p className="about-approach__card-desc">{item.desc}</p>
              </HomeFadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="about-beliefs" aria-labelledby="about-beliefs-title">
        <div className="about-section-inner">
          <HomeFadeIn>
            <div className="about-label about-label--dim">{ABOUT_BELIEFS.label}</div>
            <h2 className="about-title about-title--sr-only" id="about-beliefs-title">
              我們相信
            </h2>
          </HomeFadeIn>
          <div className="about-beliefs__list">
            {ABOUT_BELIEFS.items.map((item) => (
              <HomeFadeIn key={item.num} className="about-belief">
                <div className="about-belief__num">{item.num}</div>
                <div className="about-belief__content">
                  <h3 className="about-belief__title">{item.title}</h3>
                  <p className="about-belief__desc">{item.desc}</p>
                </div>
              </HomeFadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="about-quote" aria-label="引言">
        <HomeFadeIn className="about-quote__inner">
          <blockquote className="about-quote__text">
            {ABOUT_QUOTE.lines.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </blockquote>
          <div className="about-quote__en">
            <em>{ABOUT_QUOTE.en}</em>
          </div>
        </HomeFadeIn>
      </section>

      <section className="about-services" aria-label="服務項目">
        <div className="about-section-inner">
          <HomeFadeIn>
            <div className="about-label">S E R V I C E S</div>
            <ul className="about-services__list">
              {ABOUT_SERVICES.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </HomeFadeIn>
        </div>
      </section>

      <section className="about-cta" aria-label="聯絡">
        <HomeFadeIn className="about-cta__inner">
          <div className="about-label about-label--center">{ABOUT_CTA.label}</div>
          <h2 className="about-cta__title">
            {ABOUT_CTA.title.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </h2>
          <div className="about-cta__actions">
            <a href={`mailto:${ABOUT_CTA.email}`} className="about-cta__btn">
              GET IN TOUCH <span aria-hidden>→</span>
            </a>
            <Link to="/work" className="about-cta__btn about-cta__btn--ghost">
              查看精選案例
            </Link>
          </div>
        </HomeFadeIn>
      </section>

      <footer className="about-footer">
        <div className="about-footer__belief">
          為創作者建構美學語言，
          <br />
          讓每一束光照到它該照的地方。
        </div>
        <div className="about-footer__mark">T E K U E I · 2 0 2 6</div>
      </footer>
    </div>
  )
}
