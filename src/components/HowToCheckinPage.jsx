import { useEffect } from 'react'
import { HomeFadeIn } from './HomeFadeIn.jsx'
import {
  HOW_TO_CHECKIN_FINAL,
  HOW_TO_CHECKIN_HERO,
  HOW_TO_CHECKIN_META,
  HOW_TO_CHECKIN_PERKS,
  HOW_TO_CHECKIN_STEPS,
} from '../data/howToCheckin.js'
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
      <figure className="howto-checkin-step__figures" aria-label="教學截圖">
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
  useEffect(() => {
    document.title = HOW_TO_CHECKIN_META.title
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', HOW_TO_CHECKIN_META.description)
  }, [])

  // 頁面載入觸發 Lead
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
              {HOW_TO_CHECKIN_HERO.title.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h1>
            <p className="howto-checkin-hero__subtitle">{HOW_TO_CHECKIN_HERO.subtitle}</p>
          </div>
        </header>

        <div className="howto-checkin-rule" aria-hidden>
          <div className="howto-checkin-rule__line" />
        </div>

        <section className="howto-checkin-steps" aria-label="報到教學步驟">
          <ol className="howto-checkin-steps__list">
            {HOW_TO_CHECKIN_STEPS.map((item) => {
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
              <p className="howto-checkin-step__label howto-checkin-perks__label">說明會當日</p>
              <h2 className="howto-checkin-perks__title" id="howto-checkin-perks-title">
                完成報到後，您將收到
              </h2>
            </HomeFadeIn>
            <ul className="howto-checkin-perks__list">
              {HOW_TO_CHECKIN_PERKS.map((perk) => (
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
            <p className="howto-checkin-final__lead">{HOW_TO_CHECKIN_FINAL.lead}</p>
            <p className="howto-checkin-final__body">{HOW_TO_CHECKIN_FINAL.body}</p>
            <p className="howto-checkin-final__closing">{HOW_TO_CHECKIN_FINAL.closing}</p>
          </HomeFadeIn>
        </footer>
      </div>
    </div>
  )
}
