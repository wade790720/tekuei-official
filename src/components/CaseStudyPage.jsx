import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getNextCase } from '../data/cases/index.js'
import { useCaseCms } from '../hooks/useCaseCms.js'
import { useLang } from '../i18n'
import '../styles/case.css'
import { VideoPlayer } from './VideoPlayer.jsx'

function DelGrid({ items }) {
  return (
    <div className="case-del-grid">
      {items.map((item) => (
        <div key={item.num} className="case-del-item">
          <div className="case-del-num">{item.num}</div>
          <div className="case-del-name">{item.name}</div>
          <div className="case-del-desc">{item.desc}</div>
        </div>
      ))}
    </div>
  )
}

function SectionHeader({ num, label, title }) {
  return (
    <>
      <div className="case-sec-num">{num}</div>
      <div className="case-sec-label">{label}</div>
      <h2 className="case-sec-title">{title}</h2>
    </>
  )
}

function CaseTitle({ titleEm, titleRest }) {
  return (
    <h1 className="case-title">
      {titleEm ? <em>{titleEm}</em> : null}
      {titleEm ? ' ' : null}
      {titleRest}
    </h1>
  )
}

export default function CaseStudyPage() {
  const { slug } = useParams()
  const { lang } = useLang()
  const { content: data, work, loading } = useCaseCms(slug)

  const hero = data?.hero
  const sections = data?.sections
  const media = data?.media
  const nextCase = data ? getNextCase(data.slug, work, lang) : null

  useEffect(() => {
    if (!data) return
    document.title = data.documentTitle
  }, [data?.documentTitle, data])

  if (loading || !data || !hero || !sections || !media) {
    return <div className="site-loading-bar" />
  }

  return (
    <div className="case-page">
      <header
        className={['case-hero', hero.image?.url ? 'case-hero--has-photo' : '']
          .filter(Boolean)
          .join(' ')}
      >
        {hero.image?.url ? (
          <div
            className="case-hero-bg case-hero-bg--photo"
            style={{ backgroundImage: `url(${hero.image.url})` }}
            aria-hidden
          />
        ) : (
          <div
            className="case-hero-bg"
            style={hero.bg ? { background: hero.bg } : undefined}
            aria-hidden
          />
        )}
        <div className="case-hero-content">
          <div className="case-hero-left">
            <div className="case-num">{hero.num}</div>
            <CaseTitle titleEm={hero.titleEm} titleRest={hero.titleRest} />
            <div className="case-subtitle">{hero.subtitle}</div>
          </div>
          <div className="case-hero-right">
            <dl className="case-meta">
              {hero.meta.map((m) => (
                <div key={m.label} className="meta-item">
                  <dt className="meta-label">{m.label}</dt>
                  <dd className="meta-value">
                    {m.href ? (
                      <a href={m.href} target="_blank" rel="noreferrer">
                        {m.lines[0]}
                      </a>
                    ) : (
                      m.lines.map((line, i) => (
                        <span key={line}>
                          {i > 0 ? <br /> : null}
                          {line}
                        </span>
                      ))
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </header>

      <section className="fade-in case-section">
        <div className="case-wrap">
          <SectionHeader {...sections.overview} />
          {sections.overview.prose.map((p) => (
            <p key={p.slice(0, 24)} className="case-prose">
              {p}
            </p>
          ))}
          {sections.overview.quote ? (
            <blockquote className="case-quote">
              <p>{sections.overview.quote.text}</p>
              {sections.overview.quote.attr ? (
                <div className="case-quote-attr">{sections.overview.quote.attr}</div>
              ) : null}
            </blockquote>
          ) : null}
        </div>
      </section>

      {data.videos?.length ? (
        <div className="case-wrap case-videos">
          {data.videos.map((v) => (
            <VideoPlayer key={v.src} {...v} loop />
          ))}
        </div>
      ) : null}

      <div
        className="fade-in case-img-full"
        style={!media.fullWidthImage?.url && media.fullWidthBg ? { background: media.fullWidthBg } : undefined}
      >
        {media.fullWidthImage?.url ? (
          <img className="case-img-photo" src={media.fullWidthImage.url} alt="" />
        ) : null}
        {!media.fullWidthImage?.url ? (
          <span className="case-img-label">{media.fullWidthLabel}</span>
        ) : null}
      </div>

      <section className="fade-in case-section case-section--light">
        <div className="case-wrap">
          <SectionHeader {...sections.challenge} />
          {sections.challenge.prose.map((p) => (
            <p key={p.slice(0, 24)} className="case-prose">
              {p}
            </p>
          ))}
          <div className="case-sec-div" aria-hidden />
          <DelGrid items={sections.challenge.deliverables} />
        </div>
      </section>

      <section className="fade-in case-section">
        <div className="case-wrap">
          <SectionHeader {...sections.approach} />
          {sections.approach.prose.map((p) => (
            <p key={p.slice(0, 24)} className="case-prose">
              {p}
            </p>
          ))}
          <div className="case-sec-div" aria-hidden />
          <div className="case-timeline">
            {sections.approach.timeline.map((item) => (
              <div key={item.phase} className="case-tl-item">
                <div className="case-tl-phase">{item.phase}</div>
                <div className="case-tl-title">{item.title}</div>
                <div className="case-tl-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="case-wrap">
        <div
          className="fade-in case-img"
          style={!media.inlineImage?.url ? undefined : { background: 'transparent', border: 'none' }}
        >
          {media.inlineImage?.url ? (
            <img className="case-img-photo" src={media.inlineImage.url} alt="" />
          ) : (
            <span className="case-img-label">{media.inlineLabel}</span>
          )}
        </div>
      </div>

      <section className="fade-in case-section case-section--light">
        <div className="case-wrap">
          <SectionHeader {...sections.deliverables} />
          <DelGrid items={sections.deliverables.items} />
        </div>
      </section>

      <section className="fade-in case-section">
        <div className="case-wrap">
          <SectionHeader {...sections.result} />
          {sections.result.prose.map((p) => (
            <p key={p.slice(0, 24)} className="case-prose">
              {p}
            </p>
          ))}
          {sections.result.quote ? (
            <blockquote className="case-quote">
              <p>{sections.result.quote.text}</p>
            </blockquote>
          ) : null}
        </div>
      </section>

      {nextCase ? (
        <div className="fade-in case-next">
          <div className="case-next-label">N E X T &nbsp;&nbsp; C A S E</div>
          <Link to={nextCase.href}>
            <div className="case-next-title">{nextCase.title}</div>
            <div className="case-next-sub">{nextCase.subtitle}</div>
          </Link>
        </div>
      ) : null}

      <footer className="case-footer">
        <div className="mark">T E K U E I · 2 0 2 6</div>
      </footer>
    </div>
  )
}
