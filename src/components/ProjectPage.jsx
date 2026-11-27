import { lazy, Suspense, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Breadcrumbs, BreadcrumbsItem } from './Breadcrumbs.jsx'
import { Button } from './Button.jsx'
import { RichText } from './RichText.jsx'
import { SiteFooter } from './SiteFooter.jsx'
import { TagList } from './Tag.jsx'
import { useAdmin } from '../context/admin.js'
import { useWork } from '../context/work.js'
import { PROJECT_PAGE_LABELS, PROJECT_SECTIONS, PROJECT_TYPES, projectBody, projectTitle } from '../data/work.js'
import { useWorkContent } from '../hooks/useWorkContent.js'
import { useLang } from '../i18n'
import { uploadSiteImage } from '../lib/adminApi.js'
import { docText, getDoc } from '../lib/richText.js'
import '../styles/journal.css'
import '../styles/project.css'

// Only Wade edits, so Tiptap and the panel load in edit mode, not for every visitor.
const Editor = lazy(() => import('./Editor.jsx').then((m) => ({ default: m.Editor })))
const ProjectEditPanel = lazy(() => import('./work/WorkEditPanel.jsx').then((m) => ({ default: m.ProjectEditPanel })))

const typeOf = (x) => x.type ?? PROJECT_TYPES[x.id] ?? 'web'

/** A project whose page is written in the editor: a title and one rich-text body, set out in the Journal post column. */
export default function ProjectPage() {
  const { slug } = useParams()
  const { lang } = useLang()
  const admin = useAdmin()
  const cms = useWork()
  const { content, loading } = useWorkContent()
  const t = PROJECT_PAGE_LABELS[lang]

  const item = content.items.find((x) => x.id === slug)
  const editing = admin.editing && cms.isEditing
  const zh = item && projectBody(content, slug, 'zh')
  // Like an untranslated post: readers of an empty English page see the Chinese one.
  const untranslated = !editing && lang === 'en' && !docText(getDoc(projectBody(content, slug, 'en'))).trim()
  const doc = getDoc(untranslated ? zh : item && projectBody(content, slug, lang))
  const title = item ? projectTitle(item) : ''

  useEffect(() => {
    document.title = title ? `${title} · Projects · TEKUEI` : 'Not Found · Projects · TEKUEI'
  }, [title])

  // A project that only exists in R2 is missing until the remote data arrives.
  if (!zh && loading) return <div className="site-loading-bar" />

  // A project with no page of its own (its card links elsewhere) still opens here in edit mode, for its fields.
  if (!zh && !(editing && item)) {
    return (
      <div className="journal-page journal-page--post">
        <div className="journal-not-found">
          <div className="journal-not-found__num">—</div>
          <h1>{t.notFound}</h1>
          <Link to="/projects">{t.back}</Link>
        </div>
      </div>
    )
  }

  const section = PROJECT_SECTIONS.find((s) => s.id === typeOf(item))
  const setDoc = (next) =>
    cms.updateDraft((d) => {
      d.content[lang] = { ...d.content[lang], [slug]: { doc: next } }
    })
  const upload = async (file) => (await uploadSiteImage(file, admin.getToken())).url
  const saved = <RichText doc={doc} />
  const cover = item.thumbImage?.url
  // The card's number on the Projects list: section by section, in saved order.
  const num = PROJECT_SECTIONS.flatMap((s) => content.items.filter((x) => typeOf(x) === s.id)).findIndex((x) => x.id === slug) + 1
  const facts = [
    [t.type, [section[lang]]],
    item.client && [t.client, [item.client]],
    item.tags?.length && [t.scope, item.tags],
    item.link && [t.link, [item.link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '')], item.link],
  ].filter(Boolean)

  return (
    <div className="journal-page journal-page--post">
      <main>
        <article className={`journal-post project-post${cover ? ' project-post--cover' : ''}`} lang={untranslated ? 'zh-Hant' : undefined}>
          <header className="journal-post__header">
            {cover ? (
              <>
                <div className="project-cover fade-in" aria-hidden>
                  <img src={cover} alt="" />
                </div>
                <div className="project-hero__num fade-in" style={{ '--i': 1 }}>
                  {t.num} {String(num).padStart(2, '0')}
                </div>
                <h1 className="journal-post__title fade-in" style={{ '--i': 2 }}>{title}</h1>
                <dl className="project-hero__facts fade-in" style={{ '--i': 3 }}>
                  {facts.map(([label, lines, href]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>
                        {href ? (
                          <a href={href} target="_blank" rel="noreferrer">
                            {lines[0]} ↗
                          </a>
                        ) : (
                          lines.map((line) => <span key={line}>{line}</span>)
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <>
                {/* Wrapped so the fade-in transition does not replace the links' hover transition */}
                <div className="fade-in">
                  <Breadcrumbs label={t.crumbs} className="journal-post__crumbs">
                    <BreadcrumbsItem href="/">{t.home}</BreadcrumbsItem>
                    <BreadcrumbsItem href="/projects">Projects</BreadcrumbsItem>
                    <BreadcrumbsItem>{title}</BreadcrumbsItem>
                  </Breadcrumbs>
                </div>
                <div className="journal-post__meta fade-in" style={{ '--i': 1 }}>
                  <span>{section[lang]}</span>
                  {item.client ? (
                    <>
                      <span aria-hidden>·</span>
                      <span>{item.client}</span>
                    </>
                  ) : null}
                </div>
                <h1 className="journal-post__title fade-in" style={{ '--i': 2 }}>{title}</h1>
                {item.tags?.length ? (
                  <div className="journal-post__tags fade-in" style={{ '--i': 3 }}>
                    <TagList tags={item.tags} variant="outline" />
                  </div>
                ) : null}
                {item.link ? (
                  <div className="journal-post__visit fade-in" style={{ '--i': 4 }}>
                    <Button as="a" variant="ghost" href={item.link} target="_blank" rel="noreferrer">
                      {t.visit} ↗
                    </Button>
                  </div>
                ) : null}
              </>
            )}
            {untranslated ? (
              <p className="journal-post__notice fade-in" lang="en" style={{ '--i': 5 }}>
                {t.untranslated}
              </p>
            ) : null}
          </header>

          <div className="journal-post__rule" aria-hidden />

          <div className="journal-post__body">
            {!zh ? (
              <p className="journal-post__notice">{t.noPage}</p>
            ) : editing ? (
              <Suspense fallback={saved}>
                {/* The editor stays mounted while previewing, so the cursor and undo history survive. */}
                <Editor key={`${slug}-${lang}-${admin.editorKey}`} doc={doc} onChange={setDoc} upload={upload} previewing={admin.previewing} />
                {admin.previewing ? saved : null}
              </Suspense>
            ) : (
              saved
            )}
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
      {admin.editing ? (
        <Suspense fallback={null}>
          <ProjectEditPanel id={slug} />
        </Suspense>
      ) : null}
    </div>
  )
}
