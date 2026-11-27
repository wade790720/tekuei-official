import { lazy, Suspense, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useWorkContent } from '../hooks/useWorkContent.js'
import { labWorkItems } from '../labs/media.js'
import { SiteFooter } from './SiteFooter.jsx'
import { WORK_THUMBS } from '../data/workMedia.js'
import { projectLink, PROJECT_SECTIONS, PROJECTS_PAGE, projectTitle, projectType, WORK_LABELS } from '../data/work.js'
import { useAdmin } from '../context/admin.js'
import { useLang } from '../i18n'
import { mountMeasureLines } from '../lib/measureLines.js'
import '../styles/work.css'

// Only Wade edits, so the panel, SidePanel and cms.css load in edit mode, not for every visitor.
const WorkListEditPanel = lazy(() => import('./work/WorkEditPanel.jsx').then((m) => ({ default: m.WorkListEditPanel })))

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

// A video thumbnail shows only its poster when the system asks for less motion.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function WorkCard({ item, total }) {
  return (
    <article className="work-card fade-in">
      <Link className="work-card__link" to={item.caseHref}>
        <div className="work-card__media" style={!item.thumbImage?.url ? { background: item.thumbBg } : undefined}>
          {item.thumbImage?.video && !reduceMotion ? (
            <video
              className="work-card__photo"
              src={item.thumbImage.video}
              poster={item.thumbImage.url}
              autoPlay
              loop
              muted
              playsInline
              aria-hidden
            />
          ) : item.thumbImage?.url ? (
            <img className="work-card__photo" src={item.thumbImage.url} alt="" />
          ) : (
            <WorkThumbGraphic thumbSvg={item.thumbSvg} />
          )}
        </div>
        <div className="work-card__num">
          {item.num}/{total}
        </div>
        <div className="work-card__info">
          <div className="work-card__client">{[item.draft && WORK_LABELS.zh.draft, item.client].filter(Boolean).join(' · ')}</div>
          <h3 className="work-card__title">{projectTitle(item)}</h3>
        </div>
      </Link>
    </article>
  )
}

const pad = (n) => String(n).padStart(2, '0')

export default function WorkListPage() {
  const { content, loading } = useWorkContent()
  const { lang } = useLang()
  const { editing } = useAdmin()
  const measure = useRef(null)
  const block = useRef(null)

  const page = PROJECTS_PAGE[lang]
  const all = [
    ...content.items.map((item) => ({
      ...item,
      // A project nobody has filed yet still has to show up somewhere
      type: projectType(item),
      thumbImage: WORK_THUMBS[item.id] ?? item.thumbImage,
      caseHref: projectLink(item, content),
    })),
    ...labWorkItems(lang, 1).map((item) => ({ ...item, type: 'side' })),
  ]
  // Cards are numbered in the order they are shown: section by section.
  let shown = 0
  const sections = PROJECT_SECTIONS.map((section) => ({
    ...section,
    items: all.filter((item) => item.type === section.id).map((item) => ({ ...item, num: pad(++shown) })),
  })).filter((section) => section.items.length)
  const total = pad(shown)

  useEffect(() => {
    document.title = page.title
  }, [page.title])

  // The header is not there until the data is in
  useEffect(() => (loading ? undefined : mountMeasureLines(measure.current, { block: block.current })), [loading])

  return (
    <div className="work-page">
      {/* Nothing until the data is in: a loading bar and the footer would flash at the top for a moment */}
      {loading ? (
        <div className="work-page-loading" role="status" aria-label={WORK_LABELS[lang].loading} />
      ) : (
        <>
          <header className="work-page-header">
            <canvas className="work-page-header__measure" ref={measure} aria-hidden />
            <div className="work-page-header-inner" ref={block}>
              <div>
                <div className="pre fade-in">{page.pre}</div>
                <h1 className="fade-in" style={{ '--i': 1 }}>{page.heading}</h1>
              </div>
              <div className="count fade-in" style={{ '--i': 2 }}>
                {total} {page.countSuffix}
              </div>
            </div>
          </header>

          <div className="work-list">
            {sections.map((section) => (
              <section key={section.id} aria-labelledby={`work-section-${section.id}`}>
                <div className="work-section__head fade-in">
                  <h2 className="work-section__title" id={`work-section-${section.id}`}>
                    {section[lang]}
                  </h2>
                  <span className="work-section__count">{pad(section.items.length)}</span>
                </div>
                <div className="work-grid">
                  {section.items.map((item) => (
                    <WorkCard key={item.id} item={item} total={total} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <SiteFooter />
        </>
      )}
      {editing ? (
        <Suspense fallback={null}>
          <WorkListEditPanel />
        </Suspense>
      ) : null}
    </div>
  )
}
