import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/hero.css'
import '../styles/home.css'
import { HomeFadeIn } from './HomeFadeIn.jsx'
import { SuminagashiBackground } from './SuminagashiBackground.jsx'
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
import { useLang } from '../i18n'

function imgVariantClass(variant) {
  if (variant === 'alt') return 'home-work__item-img home-work__item-img--alt'
  if (variant === 'alt2') return 'home-work__item-img home-work__item-img--alt2'
  return 'home-work__item-img'
}

export default function SiteHero() {
  const { lang } = useLang()
  const watermarkRef = useScrollParallax(0.18)
  const vlineRef = useScrollParallax(0.06)
  const contentRef = useHeroContentParallax()
  const ctaWatermarkRef = useScrollParallax(0.12)

  const meta = HOME_META[lang]
  const hero = HOME_HERO[lang]
  const philosophy = HOME_PHILOSOPHY[lang]
  const work = HOME_WORK[lang]
  const featuredWorks = HOME_FEATURED_WORKS[lang]
  const approach = HOME_APPROACH[lang]
  const quote = HOME_QUOTE[lang]
  const cta = HOME_CTA[lang]
  const footer = HOME_FOOTER[lang]

  useEffect(() => {
    document.title = meta.title
    const metaEl = document.querySelector('meta[name="description"]')
    if (metaEl) metaEl.setAttribute('content', meta.description)
  }, [meta])

  return (
    <div className="hero-root home">
      <SuminagashiBackground />

      <div className="home-ink-content">

        <main>
        <section className="home-hero" aria-label="首頁主視覺">
          <div className="home-hero__vline" ref={vlineRef} aria-hidden />
          <div className="home-hero__watermark" ref={watermarkRef} aria-hidden>
            tekuei
          </div>

          <div className="home-hero__content" ref={contentRef}>
            <div className="home-hero__label">{hero.label}</div>
            <h1 className="home-hero__headline">
              {hero.headline.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h1>
            <div className="home-hero__sub-en">
              <em>{hero.subEn}</em>
            </div>
            <div className="home-hero__rule" aria-hidden />
            <p className="home-hero__tagline">
              {hero.tagline.map((line, i) => (
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
              <Link to="/about" className="home-cta home-cta--ghost">
                {lang === 'zh' ? '了解更多' : 'Learn More'}
              </Link>
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

        <section className="home-philosophy" id="philosophy">
          <HomeFadeIn className="home-philosophy__inner">
            <div className="home-section-label">{philosophy.label}</div>
            {philosophy.lines.map((item, i) => {
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
            <div className="home-philosophy__sig">{philosophy.signature}</div>
          </HomeFadeIn>
        </section>

        <section className="home-work" id="work">
          <HomeFadeIn>
            <div className="home-section-label">{work.label}</div>
            <h2 className="home-section-title">
              {work.title.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h2>
          </HomeFadeIn>

          <div className="home-work__grid">
            {featuredWorks.map((item) => (
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
            <div className="home-section-label">{approach.label}</div>
            <h2 className="home-section-title">
              {approach.title.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h2>
          </HomeFadeIn>

          <div className="home-approach__grid">
            {approach.items.map((item) => (
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
              {quote.lines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
            <div className="home-quote__en">
              <em>{quote.en}</em>
            </div>
          </HomeFadeIn>
        </section>

        <section className="home-final-cta" id="contact">
          <div className="home-final-cta__vline" aria-hidden />
          <div className="home-final-cta__watermark" ref={ctaWatermarkRef} aria-hidden>
            begin
          </div>
          <HomeFadeIn className="home-final-cta__content">
            <div className="home-section-label">{cta.label}</div>
            <h2 className="home-final-cta__title">
              {cta.title.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h2>
            <p className="home-final-cta__desc">
              {cta.desc.map((line, i) => (
                <span key={line}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </p>
            <a href={`mailto:${cta.email}`} className="home-cta">
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
              {footer.tagline.map((line, i) => (
                <span key={line}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </p>
          </div>
          <div className="home-footer__col">
            <div className="home-footer__col-title">EXPLORE</div>
            {footer.explore.map((link) =>
              link.href.startsWith('/') ? (
                <Link key={link.href} to={link.href}>
                  {link.label}
                </Link>
              ) : (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ),
            )}
          </div>
          <div className="home-footer__col">
            <div className="home-footer__col-title">SERVICES</div>
            {footer.services.map((s) => (
              <a key={s} href="#contact">
                {s}
              </a>
            ))}
          </div>
          <div className="home-footer__col">
            <div className="home-footer__col-title">CONTACT</div>
            {footer.contact.map((c) => (
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
    </div>
  )
}
