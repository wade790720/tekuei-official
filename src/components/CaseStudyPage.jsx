import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getNextCase } from '../data/cases/index.js'
import { CaseSiteNav } from './CaseSiteNav.jsx'
import { CustomCursor } from './CustomCursor.jsx'
import { Reveal } from './Reveal.jsx'
import '../styles/tekueiCase.css'

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

function NextCaseTitle({ titleEm, titleRest }) {
  return (
    <div className="case-next-title">
      {titleEm ? <em>{titleEm}</em> : null}
      {titleEm ? ' ' : null}
      {titleRest}
    </div>
  )
}

export default function CaseStudyPage({ data }) {
  const { hero, sections, media } = data
  const nextCase = getNextCase(data.slug)

  useEffect(() => {
    document.title = data.documentTitle
    window.scrollTo(0, 0)
  }, [data.documentTitle])

  return (
    <div className="tekuei-case-page">
      <CustomCursor interactiveSelector="a" />

      <CaseSiteNav />

      <header className="case-hero">
        <div
          className="case-hero-bg"
          style={hero.bg ? { background: hero.bg } : undefined}
          aria-hidden
        />
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

      <Reveal as="section" className="case-section">
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
      </Reveal>

      <Reveal
        className="case-img-full"
        style={media?.fullWidthBg ? { background: media.fullWidthBg } : undefined}
      >
        <span className="case-img-label">{media.fullWidthLabel}</span>
      </Reveal>

      <Reveal as="section" className="case-section case-section--light">
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
      </Reveal>

      <Reveal as="section" className="case-section">
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
      </Reveal>

      <div className="case-wrap">
        <Reveal className="case-img">
          <span className="case-img-label">{media.inlineLabel}</span>
        </Reveal>
      </div>

      <Reveal as="section" className="case-section case-section--light">
        <div className="case-wrap">
          <SectionHeader {...sections.deliverables} />
          <DelGrid items={sections.deliverables.items} />
        </div>
      </Reveal>

      <Reveal as="section" className="case-section">
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
      </Reveal>

      {nextCase ? (
        <Reveal className="case-next">
          <div className="case-next-label">N E X T &nbsp;&nbsp; C A S E</div>
          <Link to={nextCase.href}>
            <NextCaseTitle titleEm={nextCase.titleEm} titleRest={nextCase.titleRest} />
            <div className="case-next-sub">{nextCase.subtitle}</div>
          </Link>
        </Reveal>
      ) : null}

      <footer className="case-footer">
        <div className="mark">T E K U E I · 2 0 2 6</div>
      </footer>
    </div>
  )
}
