import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PROJECT_PAGE_LABELS, projectNumber, publishedWork } from '../data/work.js'
import { projectCover } from '../data/workMedia.js'
import { useCaseCms } from '../hooks/useCaseCms.js'
import { useLang } from '../i18n'
import { caseDoc } from '../lib/caseDoc.js'
import { RichText } from './RichText.jsx'
import { SiteFooter } from './SiteFooter.jsx'
import { ProjectHero } from './work/ProjectHero.jsx'
import '../styles/journal.css'
import '../styles/project.css'

/** One of the first three cases. Its text is in code; the page is laid out as a project page (ProjectPage). */
export default function CaseStudyPage() {
  const { slug } = useParams()
  const { lang } = useLang()
  const { content: data, work, loading } = useCaseCms(slug)
  const doc = useMemo(() => (data ? caseDoc(data, lang) : null), [data, lang])
  const t = PROJECT_PAGE_LABELS[lang]

  useEffect(() => {
    if (data) document.title = data.documentTitle
  }, [data])

  if (loading || !doc) return <div className="site-loading-bar" />

  const { hero } = data
  // The card's number on the Projects list; a case that is not on the list keeps its own.
  const listed = projectNumber(publishedWork(work).items, slug)
  // The cover picture set in the edit panel; the picture stored with the case until one is set there.
  const cover = projectCover(work.items.find((x) => x.id === slug)) || hero.image?.url

  return (
    <div className="journal-page journal-page--post">
      <main>
        <ProjectHero
          cover={cover}
          background={hero.bg}
          num={listed === '00' ? hero.num : `${t.num} ${listed}`}
          title={[hero.titleEm, hero.titleRest].filter(Boolean).join(' ')}
          subtitle={hero.subtitle}
          facts={hero.meta.map((m) => [m.label, m.lines, m.href])}
        />
        <article className="journal-post project-post project-post--cover">
          <div className="journal-post__body">
            <RichText doc={doc} />
          </div>
          <footer className="journal-post__footer">
            <Link to="/projects" className="journal-post__back journal-post__back--end">
              <span className="journal-post__back-line" aria-hidden />
              {t.back}
            </Link>
          </footer>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
