import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import '../styles/tekueiHero.css'
import '../styles/tekueiHome.css'
import { CustomCursor } from './CustomCursor.jsx'
import { DiagonalGrid } from './DiagonalGrid.jsx'
import { InkTrailCanvas } from './InkTrailCanvas.jsx'
import { HomeFadeIn } from './HomeFadeIn.jsx'
import {
  HOME_APPROACH,
  HOME_CTA,
  HOME_FEATURED_WORKS,
  HOME_FOOTER,
  HOME_HERO,
  HOME_META,
  HOME_PHILOSOPHY,
  HOME_QUOTE,
  HOME_WORK,
} from '../data/homepage.js'
import { useHeroContentParallax, useScrollParallax } from '../hooks/useScrollParallax.js'

function HomeNav({ scrolled }) {
  return (
    <nav className={['home-nav', scrolled ? 'is-scrolled' : ''].filter(Boolean).join(' ')}>
      <Link to="/" className="home-nav__brand">
        T E K U E I
        <span className="home-nav__brand-sub">德 溎</span>
      </Link>
      <div className="home-nav__menu">
        <a href="#about">About</a>
        <NavLink to="/work">Work</NavLink>
        <a href="#journal">Journal</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
  )
}

function imgVariantClass(variant) {
  if (variant === 'alt') return 'home-work__item-img home-work__item-img--alt'
  if (variant === 'alt2') return 'home-work__item-img home-work__item-img--alt2'
  return 'home-work__item-img'
}

export default function TekueiHero() {
  const [navScrolled, setNavScrolled] = useState(false)
  const watermarkRef = useScrollParallax(0.18)
  const glowRef = useScrollParallax(0.1)
  const vlineRef = useScrollParallax(0.06)
  const contentRef = useHeroContentParallax()
  const ctaWatermarkRef = useScrollParallax(0.12)

  useEffect(() => {
    document.title = HOME_META.title
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', HOME_META.description)
  }, [])

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="tekuei-hero-root tekuei-home">
      <CustomCursor interactiveSelector="a" />
      <InkTrailCanvas />
      <DiagonalGrid extent="document" />

      <HomeNav scrolled={navScrolled} />

      <main>
        <section className="home-hero" aria-label="首頁主視覺">
          <div className="home-hero__vline" ref={vlineRef} aria-hidden />
          <div className="home-hero__glow" ref={glowRef} aria-hidden />
          <div className="home-hero__watermark" ref={watermarkRef} aria-hidden>
            tekuei
          </div>

          <div className="home-hero__content" ref={contentRef}>
            <div className="home-hero__label">{HOME_HERO.label}</div>
            <h1 className="home-hero__headline">
              {HOME_HERO.headline.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h1>
            <div className="home-hero__sub-en">
              <em>{HOME_HERO.subEn}</em>
            </div>
            <div className="home-hero__rule" aria-hidden />
            <p className="home-hero__tagline">
              {HOME_HERO.tagline.map((line, i) => (
                <span key={line}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </p>
            <div className="home-hero__cta-row">
              <a href="#contact" className="home-cta">
                BEGIN <span className="home-cta__arrow">→</span>
              </a>
              <a href="#about" className="home-cta home-cta--ghost">
                了解更多
              </a>
            </div>
          </div>

          <div className="home-hero__footer">
            <div className="home-hero__footer-l">
              E S T . 2 0 2 6
              <br />
              T A I P E I
            </div>
            <div className="home-hero__footer-r">
              <div>0 1 / 0 4 · H O M E</div>
              <div className="home-scroll-hint">
                <span>S C R O L L</span>
                <span className="home-scroll-line" aria-hidden />
              </div>
            </div>
          </div>
        </section>

        <section className="home-philosophy" id="about">
          <HomeFadeIn className="home-philosophy__inner">
            <div className="home-section-label">{HOME_PHILOSOPHY.label}</div>
            {HOME_PHILOSOPHY.lines.map((item, i) => {
              if (item.type === 'divider') {
                return <div key={`div-${i}`} className="home-philosophy__divider" aria-hidden />
              }
              const toneClass =
                item.tone === 'mid'
                  ? 'home-philosophy__line--mid'
                  : item.tone === 'dim'
                    ? 'home-philosophy__line--dim'
                    : ''
              return (
                <div key={item.text} className={['home-philosophy__line', toneClass].filter(Boolean).join(' ')}>
                  {item.text}
                </div>
              )
            })}
            <div className="home-philosophy__sig">{HOME_PHILOSOPHY.signature}</div>
          </HomeFadeIn>
        </section>

        <section className="home-work" id="work">
          <HomeFadeIn>
            <div className="home-section-label">{HOME_WORK.label}</div>
            <h2 className="home-section-title">
              {HOME_WORK.title.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h2>
          </HomeFadeIn>

          <div className="home-work__grid">
            {HOME_FEATURED_WORKS.map((item) => (
              <HomeFadeIn key={item.caseHref} as={Link} to={item.caseHref} className="home-work__item">
                <div
                  className={imgVariantClass(item.variant)}
                  style={{ background: item.thumbBg }}
                />
                <div className="home-work__item-glow" aria-hidden />
                <div className="home-work__item-content">
                  <div className="home-work__item-num">{item.num}</div>
                  <div className="home-work__item-label">{item.label}</div>
                  <div className="home-work__item-title">{item.title}</div>
                  <div className="home-work__item-desc">
                    {item.descLines.map((line, i) => (
                      <span key={line}>
                        {i > 0 ? <br /> : null}
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              </HomeFadeIn>
            ))}
          </div>
        </section>

        <section className="home-approach" id="approach">
          <HomeFadeIn>
            <div className="home-section-label">{HOME_APPROACH.label}</div>
            <h2 className="home-section-title">
              {HOME_APPROACH.title.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h2>
          </HomeFadeIn>

          <div className="home-approach__grid">
            {HOME_APPROACH.items.map((item) => (
              <HomeFadeIn key={item.num} className="home-approach__item">
                <div className="home-approach__num">{item.num}</div>
                <h3 className="home-approach__title">
                  {item.title.map((line, i) => (
                    <span key={line}>
                      {i > 0 ? <br /> : null}
                      {line}
                    </span>
                  ))}
                </h3>
                <p className="home-approach__desc">{item.desc}</p>
              </HomeFadeIn>
            ))}
          </div>
        </section>

        <section className="home-quote">
          <HomeFadeIn className="home-quote__inner">
            <div className="home-quote__text">
              {HOME_QUOTE.lines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
            <div className="home-quote__en">
              <em>{HOME_QUOTE.en}</em>
            </div>
          </HomeFadeIn>
        </section>

        <section className="home-final-cta" id="contact">
          <div className="home-final-cta__watermark" ref={ctaWatermarkRef} aria-hidden>
            begin
          </div>
          <HomeFadeIn className="home-final-cta__content">
            <div className="home-section-label home-section-label--center">{HOME_CTA.label}</div>
            <h2 className="home-final-cta__title">
              {HOME_CTA.title.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h2>
            <p className="home-final-cta__desc">
              {HOME_CTA.desc.map((line, i) => (
                <span key={line}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </p>
            <a href={`mailto:${HOME_CTA.email}`} className="home-cta">
              BEGIN THE JOURNEY <span className="home-cta__arrow">→</span>
            </a>
          </HomeFadeIn>
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-footer__grid">
          <div>
            <div className="home-footer__brand-name">T E K U E I</div>
            <div className="home-footer__brand-sub">德 溎</div>
            <p className="home-footer__brand-tagline">
              {HOME_FOOTER.tagline.map((line, i) => (
                <span key={line}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </p>
          </div>
          <div className="home-footer__col">
            <div className="home-footer__col-title">EXPLORE</div>
            {HOME_FOOTER.explore.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
          <div className="home-footer__col">
            <div className="home-footer__col-title">SERVICES</div>
            {HOME_FOOTER.services.map((s) => (
              <a key={s} href="#contact">
                {s}
              </a>
            ))}
          </div>
          <div className="home-footer__col">
            <div className="home-footer__col-title">CONTACT</div>
            {HOME_FOOTER.contact.map((c) => (
              <a key={c.label} href={c.href}>
                {c.label}
              </a>
            ))}
          </div>
        </div>
        <div className="home-footer__bottom">
          <div>© 2026 TEKUEI · ALL RIGHTS RESERVED</div>
          <div>EST. 2026 · TAIPEI</div>
        </div>
      </footer>
    </div>
  )
}
