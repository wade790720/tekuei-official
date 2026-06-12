import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AboutLine, AboutParts } from './AboutRichText.jsx'
import { CustomCursor } from './CustomCursor.jsx'
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
import '../styles/tekueiWork.css'
import '../styles/tekueiAbout.css'

function AboutCopy({ value, className }) {
  if (typeof value === 'string') {
    return <HomeFadeIn className={className}>{value}</HomeFadeIn>
  }
  return (
    <HomeFadeIn className={className}>
      <AboutParts parts={value.parts} />
    </HomeFadeIn>
  )
}

export default function AboutPage() {
  useEffect(() => {
    document.title = ABOUT_META.title
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', ABOUT_META.description)
  }, [])

  return (
    <div className="tekuei-about-page">
      <CustomCursor interactiveSelector="a" />
      <TekueiSiteNav />

      <div className="about-content">
        <header className="about-header">
          <div className="about-header__inner">
            <div>
              <div className="about-header__pre">{ABOUT_HERO.pre}</div>
              <h1 className="about-header__title">{ABOUT_HERO.title}</h1>
              <div className="about-header__subtitle">{ABOUT_HERO.subtitle}</div>
            </div>
            <div className="about-header__aside">
              <div className="about-header__tagline">{ABOUT_HERO.tagline}</div>
              <div className="about-header__belief">
                <AboutParts parts={ABOUT_HERO.belief.parts} />
              </div>
            </div>
          </div>
        </header>

        <div className="about-rule" aria-hidden>
          <div className="about-rule__line" />
        </div>

        <section className="about-intro" aria-labelledby="about-intro-title">
          <div className="about-section-inner about-intro__layout">
            <HomeFadeIn className="about-intro__head">
              <div className="about-label">{ABOUT_INTRO.label}</div>
              <h2 className="about-title" id="about-intro-title">
                {ABOUT_INTRO.title.map((line) => (
                  <span key={typeof line === 'string' ? line : line.parts.map((p) => p.t).join('')}>
                    <AboutLine line={line} />
                    <br />
                  </span>
                ))}
              </h2>
            </HomeFadeIn>
            <div className="about-intro__body">
              {ABOUT_INTRO.paragraphs.map((p) => (
                <AboutCopy
                  key={typeof p === 'string' ? p.slice(0, 20) : p.parts[0].t.slice(0, 12)}
                  value={p}
                  className="about-intro__para"
                />
              ))}
            </div>
          </div>
        </section>

        <section className="about-founder" aria-labelledby="about-founder-title">
          <div className="about-section-inner about-founder__grid">
            <HomeFadeIn className="about-founder__visual" aria-hidden>
              <div className="about-founder__frame">
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
                <AboutCopy
                  key={typeof p === 'string' ? p.slice(0, 24) : p.parts[0].t.slice(0, 12)}
                  value={p}
                  className="about-founder__para"
                />
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
            <div className="about-approach__layout">
              <HomeFadeIn className="about-approach__head">
                <div className="about-label">{ABOUT_APPROACH.label}</div>
                <h2 className="about-title about-title--approach" id="about-approach-title">
                  {ABOUT_APPROACH.title.map((line) => (
                    <span
                      key={typeof line === 'string' ? line : line.parts.map((p) => p.t).join('')}
                    >
                      <AboutLine line={line} />
                      <br />
                    </span>
                  ))}
                </h2>
              </HomeFadeIn>
              <ol className="about-approach__steps">
                {ABOUT_APPROACH.items.map((item) => (
                  <HomeFadeIn key={item.num} as="li" className="about-approach__step">
                    <div className="about-approach__marker" aria-hidden="true">
                      <span className="about-approach__num">{item.num}</span>
                    </div>
                    <div className="about-approach__step-body">
                      <h3 className="about-approach__step-title">
                        {item.title}
                        <span className="about-approach__step-en">{item.en}</span>
                      </h3>
                      <p className="about-approach__step-desc">{item.desc}</p>
                    </div>
                  </HomeFadeIn>
                ))}
              </ol>
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
                    <p className="about-belief__desc">
                      {typeof item.desc === 'string' ? (
                        item.desc
                      ) : (
                        <AboutParts parts={item.desc.parts} />
                      )}
                    </p>
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
                <span key={typeof line === 'string' ? line : line.parts.map((p) => p.t).join('')}>
                  <AboutLine line={line} />
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
                <span key={typeof line === 'string' ? line : line.parts.map((p) => p.t).join('')}>
                  <AboutLine line={line} />
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
    </div>
  )
}
