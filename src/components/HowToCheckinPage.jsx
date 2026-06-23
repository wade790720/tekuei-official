import { useEffect } from 'react'
import { HomeFadeIn } from './HomeFadeIn.jsx'
import {
  HOW_TO_CHECKIN_FINAL,
  HOW_TO_CHECKIN_HERO,
  HOW_TO_CHECKIN_META,
  HOW_TO_CHECKIN_PERKS,
  HOW_TO_CHECKIN_PERKS_LABEL,
  HOW_TO_CHECKIN_STEPS,
} from '../data/howToCheckin.js'
import { useLang } from '../i18n'
import '../styles/howToCheckin.css'

function renderBodyContent(line) {
  if (typeof line === 'string') return line
  return line.map((part, i) =>
    typeof part === 'string' ? (
      part
    ) : (
      <strong key={`em-${i}`} className="howto-checkin-step__em">
        {part.em}
      </strong>
    ),
  )
}

function StepTitle({ title }) {
  if (Array.isArray(title)) {
    return (
      <h2 className="howto-checkin-step__title">
        {title.map((line, i) => (
          <span key={line}>
            {line}
            {i < title.length - 1 ? <br /> : null}
          </span>
        ))}
      </h2>
    )
  }
  return <h2 className="howto-checkin-step__title">{title}</h2>
}

function StepBody({ body }) {
  if (!body) return null
  if (Array.isArray(body)) {
    return body.map((line, i) => (
      <p key={typeof line === 'string' ? line : `line-${i}`} className="howto-checkin-step__body">
        {renderBodyContent(line)}
      </p>
    ))
  }
  return <p className="howto-checkin-step__body">{body}</p>
}

function StepMedia({ item }) {
  if (item.images?.length) {
    return (
      <figure className="howto-checkin-step__figures" aria-label="tutorial screenshots">
        {item.images.map((img) => (
          <img
            key={img.src}
            className="howto-checkin-step__img"
            src={img.src}
            alt={img.alt}
            loading={item.step === '02' ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
      </figure>
    )
  }

  if (!item.image) return null

  return (
    <figure className="howto-checkin-step__figure">
      <img
        className="howto-checkin-step__img"
        src={item.image}
        alt={item.imageAlt}
        loading="lazy"
        decoding="async"
      />
    </figure>
  )
}

export default function HowToCheckinPage() {
  const { lang } = useLang()
  const meta = HOW_TO_CHECKIN_META[lang]
  const hero = HOW_TO_CHECKIN_HERO[lang]
  const steps = HOW_TO_CHECKIN_STEPS[lang]
  const perks = HOW_TO_CHECKIN_PERKS[lang]
  const perksLabel = HOW_TO_CHECKIN_PERKS_LABEL[lang]
  const final = HOW_TO_CHECKIN_FINAL[lang]

  useEffect(() => {
    document.title = meta.title
    const metaEl = document.querySelector('meta[name="description"]')
    if (metaEl) metaEl.setAttribute('content', meta.description)
  }, [meta])

  useEffect(() => {
    window.zaraz?.track('Lead')
  }, [])

  return (
    <div className="howto-checkin-page">
      <div className="howto-checkin-content">
        <header className="howto-checkin-hero">
          <div className="howto-checkin-hero__inner">
            <div className="howto-checkin-hero__eyebrow">Check-in Guide</div>
            <h1 className="howto-checkin-hero__title">
              {hero.title.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h1>
            <p className="howto-checkin-hero__subtitle">{hero.subtitle}</p>
          </div>
        </header>

        <div className="howto-checkin-rule" aria-hidden>
          <div className="howto-checkin-rule__line" />
        </div>

        <section className="howto-checkin-steps" aria-label="check-in steps">
          <ol className="howto-checkin-steps__list">
            {steps.map((item) => {
              const hasMedia = Boolean(item.images?.length || item.image)
              const layoutClass = [
                'howto-checkin-step__layout',
                item.images?.length > 1 ? 'howto-checkin-step__layout--dual' : '',
                !hasMedia ? 'howto-checkin-step__layout--no-media' : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
              <li key={item.step} className="howto-checkin-step">
                <HomeFadeIn className={layoutClass}>
                  <div className="howto-checkin-step__copy">
                    <p className="howto-checkin-step__label">
                      Step {item.step}
                    </p>
                    <StepTitle title={item.title} />
                    <StepBody body={item.body} />
                    {item.cta && (
                      <a
                        className="howto-checkin-step__cta"
                        href={item.cta.href}
                        target={item.cta.external ? '_blank' : undefined}
                        rel={item.cta.external ? 'noopener noreferrer' : undefined}
                        onClick={() => window.zaraz?.track('Contact')}
                      >
                        {item.cta.label}
                        <span className="howto-checkin-step__cta-arrow" aria-hidden>
                          →
                        </span>
                      </a>
                    )}
                  </div>
                  <StepMedia item={item} />
                </HomeFadeIn>
              </li>
              )
            })}
          </ol>
        </section>

        <section className="howto-checkin-perks" aria-labelledby="howto-checkin-perks-title">
          <div className="howto-checkin-perks__inner">
            <HomeFadeIn>
              <p className="howto-checkin-step__label howto-checkin-perks__label">{perksLabel.eyebrow}</p>
              <h2 className="howto-checkin-perks__title" id="howto-checkin-perks-title">
                {perksLabel.heading}
              </h2>
            </HomeFadeIn>
            <ul className="howto-checkin-perks__list">
              {perks.map((perk) => (
                <li key={perk.num} className="howto-checkin-perk">
                  <HomeFadeIn className="howto-checkin-perk__card">
                    <div className="howto-checkin-perk__num" aria-hidden>
                      {perk.num}
                    </div>
                    <h3 className="howto-checkin-perk__title">{perk.title}</h3>
                    <p className="howto-checkin-perk__body">{perk.body}</p>
                  </HomeFadeIn>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="howto-checkin-final">
          <HomeFadeIn className="howto-checkin-final__inner">
            <p className="howto-checkin-final__lead">{final.lead}</p>
            <p className="howto-checkin-final__body">{final.body}</p>
            <p className="howto-checkin-final__closing">{final.closing}</p>
          </HomeFadeIn>
        </footer>
      </div>
    </div>
  )
}
