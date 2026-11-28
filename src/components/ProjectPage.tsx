import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router'
import { Breadcrumbs, BreadcrumbsItem } from './Breadcrumbs.tsx'
import { Button } from './Button.tsx'
import { RichText } from './RichText.tsx'
import { SiteFooter } from './SiteFooter.tsx'
import { TagList } from './Tag.tsx'
import { ProjectHero } from './work/ProjectHero.tsx'
import { useAdmin } from '../context/admin.ts'
import { useWork } from '../context/work.ts'
import { projectCover, withProjectVideo } from '../data/workMedia.ts'
import { PROJECT_PAGE_LABELS, PROJECT_SECTIONS, projectBody, projectFacts, projectNumber, projectTitle, projectType } from '../data/work.ts'
import { projectInEnglish } from '../lib/projectHref.ts'
import { useWorkContent } from '../hooks/useWorkContent.ts'
import { useLang, useLocalePath } from '../i18n'
import { uploadSiteImage } from '../lib/adminApi.ts'
import { docText, getDoc, safeHref } from '../lib/richText.ts'
import type { Doc, WorkData } from '../lib/siteData.ts'
import '../styles/journal.css'
import '../styles/project.css'
import { DefaultHead } from './DefaultHead.tsx'
import { PageHead } from './PageHead.tsx'
import { creativeWorkLd, firstImage, imageUrl, pageUrl } from '../lib/seo.ts'

const Editor = lazy(() => import('./Editor.tsx').then((m) => ({ default: m.Editor })))
const ProjectEditPanel = lazy(() => import('./work/WorkEditPanel.tsx').then((m) => ({ default: m.ProjectEditPanel })))

/** A project whose page is written in the editor: a title and one rich-text body, set out in the Journal post column. */
export default function ProjectPage({ work }: { work: WorkData }) {
  const { slug = '' } = useParams<{ slug: string }>()
  const { lang } = useLang()
  const localePath = useLocalePath()
  const admin = useAdmin()
  const cms = useWork()
  const { content } = useWorkContent(work)
  const t = PROJECT_PAGE_LABELS[lang]

  const item = content.items.find((x) => x.id === slug)
  const editing = admin.editing && cms.isEditing
  const zh = item && projectBody(content, slug, 'zh')
  const english = projectInEnglish(content, slug)
  const untranslated = !editing && lang === 'en' && !english
  const doc = getDoc(untranslated ? zh : item && projectBody(content, slug, lang))
  const title = item ? projectTitle(item) : ''

  if (!item || (!zh && !editing)) {
    return (
      <div className="journal-page journal-page--post">
        <DefaultHead title={item ? `${title} · Projects · TEKUEI` : 'Not Found · Projects · TEKUEI'} />
        <div className="journal-not-found">
          <div className="journal-not-found__num">—</div>
          <h1>{t.notFound}</h1>
          <Link to={localePath('/projects')}>{t.back}</Link>
        </div>
      </div>
    )
  }

  const section = PROJECT_SECTIONS.find((s) => s.id === projectType(item))
  const setDoc = (next: Doc) =>
    cms.updateDraft((d) => {
      d.content = { ...d.content, [lang]: { ...d.content?.[lang], [slug]: { doc: next } } }
    })
  const upload = async (file: File) => (await uploadSiteImage(file, admin.getToken())).url
  const saved = <RichText doc={withProjectVideo(doc, slug, lang)} />
  const cover = projectCover(item)
  const link = safeHref(item.link)
  const description = docText(doc).slice(0, 120) || item.client

  return (
    <div className="journal-page journal-page--post">
      <PageHead
        title={`${title} · Projects · TEKUEI`}
        description={description}
        path={`/projects/${slug}`}
        type="article"
        image={imageUrl(cover) ?? firstImage(doc)}
        ld={creativeWorkLd({ name: title, description, url: pageUrl(`/projects/${slug}`, english ? lang : 'zh'), tags: item.tags }, english ? lang : 'zh')}
        english={english}
      />
      <main>
        {cover ? <ProjectHero cover={cover} num={`${t.num} ${projectNumber(content.items, slug)}`} title={title} facts={projectFacts(item, lang)} /> : null}
        <article className={`journal-post project-post${cover ? ' project-post--cover' : ''}`} lang={untranslated ? 'zh-Hant' : undefined}>
          <header className="journal-post__header">
            {cover ? null : (
              <>
                <div className="fade-in">
                  <Breadcrumbs label={t.crumbs} className="journal-post__crumbs">
                    <BreadcrumbsItem href={localePath('/')}>{t.home}</BreadcrumbsItem>
                    <BreadcrumbsItem href={localePath('/projects')}>Projects</BreadcrumbsItem>
                    <BreadcrumbsItem>{title}</BreadcrumbsItem>
                  </Breadcrumbs>
                </div>
                <div className="journal-post__meta fade-in" style={{ '--i': 1 }}>
                  <span>{section?.[lang]}</span>
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
                {link ? (
                  <div className="journal-post__visit fade-in" style={{ '--i': 4 }}>
                    <Button as="a" variant="ghost" href={link} target="_blank" rel="noreferrer">
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
                <Editor key={`${slug}-${lang}-${admin.editorKey}`} doc={doc} onChange={setDoc} upload={upload} previewing={admin.previewing} />
                {admin.previewing ? saved : null}
              </Suspense>
            ) : (
              saved
            )}
          </div>

          <footer className="journal-post__footer">
            <Link to={localePath('/projects')} className="journal-post__back journal-post__back--end">
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
