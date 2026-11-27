import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PROJECT_PAGE_LABELS, projectFacts, projectNumber, projectTitle } from '../data/work.ts'
import type { ProjectFact } from '../data/work.ts'
import { projectCover } from '../data/workMedia.ts'
import { useCaseCms } from '../hooks/useCaseCms.ts'
import { useWorkContent } from '../hooks/useWorkContent.ts'
import { useLang } from '../i18n'
import { caseDoc } from '../lib/caseDoc.ts'
import { RichText } from './RichText.tsx'
import { SiteFooter } from './SiteFooter.tsx'
import { ProjectHero } from './work/ProjectHero.tsx'
import '../styles/journal.css'
import '../styles/project.css'

/** One of the first three cases. Its text is in code; the page is laid out as a project page (ProjectPage). */
export default function CaseStudyPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { lang } = useLang()
  const { content: data, loading } = useCaseCms(slug)
  // The list the edit panel changes, so an edit there shows here before it is saved
  const { items } = useWorkContent().content
  const doc = useMemo(() => (data ? caseDoc(data, lang) : null), [data, lang])
  const t = PROJECT_PAGE_LABELS[lang]

  useEffect(() => {
    if (data) document.title = data.documentTitle
  }, [data])

  if (loading || !data || !doc) return <div className="site-loading-bar" />

  const { hero } = data
  // The card's number on the Projects list; a case that is not on the list keeps its own.
  const listed = projectNumber(items, slug)
  // The title, the facts and the cover come from the case's card, as on a project page, so the edit panel changes
  // both. A case that is no longer on the list falls back to what is stored with it.
  const item = items.find((x) => x.id === slug)
  const cover = projectCover(item) || hero.image?.url
  // The card of a case has no site link of its own until one is typed in the panel; the case's stored link fills in.
  const site = hero.meta.find((m) => m.href)
  const facts: ProjectFact[] = item
    ? [...projectFacts(item, lang), ...(item.link || !site ? [] : [[t.link, site.lines, site.href] satisfies ProjectFact])]
    : hero.meta.map((m): ProjectFact => [m.label, m.lines, m.href])

  return (
    <div className="journal-page journal-page--post">
      <main>
        <ProjectHero
          cover={cover}
          background={hero.bg}
          num={listed === '00' ? hero.num : `${t.num} ${listed}`}
          title={item ? projectTitle(item) : [hero.titleEm, hero.titleRest].filter(Boolean).join(' ')}
          facts={facts}
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
