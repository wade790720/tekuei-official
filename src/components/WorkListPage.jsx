import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWorkContent } from '../hooks/useWorkContent.js'
import { labWorkItems } from '../labs/media.js'
import { SiteFooter } from './SiteFooter.jsx'
import { WORK_THUMBS } from '../data/workMedia.js'
import { CODE_WORK_ITEMS, WORK_LABELS } from '../data/work.js'
import { useLang } from '../i18n'
import { TagList } from './Tag.jsx'
import '../styles/work.css'

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

function WorkCard({ item }) {
  return (
    <article className="work-grid__item fade-in">
      <Link className="work-grid__card" to={item.caseHref}>
        <div className="work-thumb">
          <div className="num">{item.num}</div>
          <div
            className={[
              'work-thumb-img',
              item.thumbImage?.url ? 'work-thumb-img--has-photo' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={!item.thumbImage?.url ? { background: item.thumbBg } : undefined}
          >
            {item.thumbImage?.video && !reduceMotion ? (
              <video
                className="work-thumb-photo"
                src={item.thumbImage.video}
                poster={item.thumbImage.url}
                autoPlay
                loop
                muted
                playsInline
                aria-hidden
              />
            ) : item.thumbImage?.url ? (
              <img className="work-thumb-photo" src={item.thumbImage.url} alt="" />
            ) : (
              <WorkThumbGraphic thumbSvg={item.thumbSvg} />
            )}
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
          <TagList tags={item.tags} variant="outline" />
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
  const { content, loading } = useWorkContent()
  const { lang } = useLang()

  const { meta, header } = content
  const clientItems = [...content.items, ...CODE_WORK_ITEMS[lang]].map((item, i) => ({
    ...item,
    num: item.num ?? String(i + 1).padStart(2, '0'),
    thumbImage: WORK_THUMBS[item.id] ?? item.thumbImage,
  }))
  const items = [...clientItems, ...labWorkItems(lang, clientItems.length + 1)]

  useEffect(() => {
    document.title = meta.title
  }, [meta.title])

  return (
    <div className="work-page">
      {/* Nothing until the data is in: a loading bar and the footer would flash at the top for a moment */}
      {loading ? (
        <div className="work-page-loading" role="status" aria-label={WORK_LABELS[lang].loading} />
      ) : (
        <>
          <header className="work-page-header">
            <div className="work-page-header-inner">
              <div>
                <div className="pre fade-in">{header.pre}</div>
                <h1 className="fade-in" style={{ '--i': 1 }}>{header.title}</h1>
              </div>
              <div className="count fade-in" style={{ '--i': 2 }}>
                0{items.length} {header.countSuffix}
              </div>
            </div>
          </header>

          <div className="work-header-rule fade-in" style={{ '--i': 3 }}>
            <div className="work-header-rule-line" />
          </div>

          <section className="work-grid" aria-label="作品列表">
            {items.map((item) => (
              <WorkCard key={item.id} item={item} />
            ))}
          </section>

          <SiteFooter />
        </>
      )}
    </div>
  )
}
