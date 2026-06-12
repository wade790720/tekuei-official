import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CustomCursor } from './CustomCursor.jsx'
import { TekueiSiteNav } from './TekueiSiteNav.jsx'
import { WORK_ITEMS } from '../data/works.js'
import '../styles/tekueiWork.css'

function WorkThumbGraphic({ thumbSvg }) {
  const svgProps = {
    width: 120,
    height: 120,
    viewBox: '0 0 120 120',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    className: 'work-thumb-mark',
  }

  if (thumbSvg === 'lustre') {
    return (
      <svg {...svgProps}>
        <circle cx="60" cy="60" r="40" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="60" cy="60" r="20" stroke="currentColor" strokeWidth="0.3" />
        <line x1="60" y1="20" x2="60" y2="100" stroke="currentColor" strokeWidth="0.3" />
        <line x1="20" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="0.3" />
      </svg>
    )
  }

  if (thumbSvg === 'matsu') {
    return (
      <svg {...svgProps}>
        <rect x="30" y="30" width="60" height="60" stroke="currentColor" strokeWidth="0.5" />
        <rect x="40" y="40" width="40" height="40" stroke="currentColor" strokeWidth="0.3" />
        <line x1="30" y1="30" x2="90" y2="90" stroke="currentColor" strokeWidth="0.3" />
      </svg>
    )
  }

  return (
    <svg {...svgProps}>
      <polygon
        points="60,20 95,80 25,80"
        stroke="currentColor"
        strokeWidth="0.5"
        fill="none"
      />
      <circle cx="60" cy="58" r="15" stroke="currentColor" strokeWidth="0.3" />
    </svg>
  )
}

function WorkCard({ item }) {
  const articleRef = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = articleRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          setShown(true)
          obs.unobserve(e.target)
        })
      },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <article
      ref={articleRef}
      className={['work-grid__item', shown ? 'is-visible' : ''].filter(Boolean).join(' ')}
    >
      <Link className="work-grid__card" to={item.caseHref}>
        <div className="work-thumb">
          <div className="num">{item.num}</div>
          <div className="work-thumb-img" style={{ background: item.thumbBg }}>
            <WorkThumbGraphic thumbSvg={item.thumbSvg} />
          </div>
        </div>
        <div className="work-info">
          <div className="client">{item.client}</div>
          <div className="title">
            {item.titleEmWord ? (
              <>
                <em>{item.titleEmWord}</em> {item.title}
              </>
            ) : (
              item.title
            )}
          </div>
          <div className="subtitle">{item.subtitle}</div>
          <div className="divider" aria-hidden />
          <div className="desc">
            {item.descriptionLines.map((line, i) => (
              <span key={`${item.id}-desc-${i}`}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </div>
          <div className="tags">
            {item.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
          <div className="arrow">
            <div className="arrow-line" />
            <span>V I E W</span>
          </div>
        </div>
      </Link>
    </article>
  )
}

export default function WorkListPage() {
  useEffect(() => {
    document.title = 'TEKUEI · Work'
  }, [])

  return (
    <div className="tekuei-work-page">
      <CustomCursor interactiveSelector="a" />

      <TekueiSiteNav />

      <header className="work-page-header">
        <div className="work-page-header-inner">
          <div>
            <div className="pre">S E L E C T E D &nbsp;&nbsp;W O R K</div>
            <h1>Work</h1>
          </div>
          <div className="count">0{WORK_ITEMS.length} Projects</div>
        </div>
      </header>

      <div className="work-header-rule">
        <div className="work-header-rule-line" />
      </div>

      <section className="work-grid" aria-label="作品列表">
        {WORK_ITEMS.map((item) => (
          <WorkCard key={item.id} item={item} />
        ))}
      </section>

      <footer className="work-page-footer">
        <div className="belief">
          為創作者建構美學語言，
          <br />
          讓每一束光照到它該照的地方。
        </div>
        <div className="mark">T E K U E I · 2 0 2 6</div>
      </footer>
    </div>
  )
}
