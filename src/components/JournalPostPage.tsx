import { lazy, Suspense } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { SiteFooter } from './SiteFooter.tsx'
import { TagList } from './Tag.tsx'
import { JournalPostBody } from './journal/JournalPostBody.tsx'
import { ShareLinks } from './journal/ShareLinks.tsx'
import { RichText } from './RichText.tsx'
import { Breadcrumbs, BreadcrumbsItem } from './Breadcrumbs.tsx'
import { docText, getDoc } from '../lib/richText.ts'
import { useJournalContent } from '../context/journal.ts'
import { useAdmin } from '../context/admin.ts'
import { getAdjacentPosts, getJournalPost, JOURNAL_POST_LABELS, postTags } from '../data/journal.ts'
import type { ReadableJournal, ReadablePost } from '../data/journal.ts'
import type { Body } from '../lib/siteData.ts'
import { useLang, useLocalePath } from '../i18n'
import '../styles/work.css'
import '../styles/journal.css'
import { DefaultHead } from './DefaultHead.tsx'
import { PageHead } from './PageHead.tsx'
import { firstImage, pageUrl, postLd } from '../lib/seo.ts'

const JournalPostEditPanel = lazy(() => import('./journal/JournalEditPanel.tsx').then((m) => ({ default: m.JournalPostEditPanel })))

function listDepth(state: unknown): number {
  return typeof state === 'object' && state !== null && 'fromList' in state && typeof state.fromList === 'number' ? state.fromList : 0
}

/**
 * @param journal  the loader's post and its neighbours, as readers see them; empty for an unknown slug or a draft
 * @param english  the post has an English version of its own (postInEnglish)
 */
export default function JournalPostPage({ journal: reader, english }: { journal: ReadableJournal; english: boolean }) {
  const { slug = '' } = useParams<{ slug: string }>()
  const { lang } = useLang()
  const localePath = useLocalePath()
  const fromList = listDepth(useLocation().state)
  const t = JOURNAL_POST_LABELS[lang]
  const { editing } = useAdmin()
  const journal = useJournalContent(reader)
  const post = getJournalPost(journal, slug, lang)
  const content = slug ? journal.content[lang]?.[slug] : null
  const { prev, next } = getAdjacentPosts(journal, slug, lang)

  const sig = lang === 'zh' ? '— 德 溎 · TEKUEI' : '— W A D E · TEKUEI'

  if (!post || !content) {
    return (
      <div className="journal-page journal-page--post">
        <DefaultHead title="Not Found · Journal · TEKUEI" />
        <div className="journal-not-found">
          <div className="journal-not-found__num">—</div>
          <h1>{t.notFound}</h1>
          <Link to={localePath('/journal')}>{t.back}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="journal-page journal-page--post">
      <PostHead post={post} content={content} slug={slug} english={english} />
      <main>
      <article className="journal-post" lang={post.untranslated ? 'zh-Hant' : undefined}>
        <header className="journal-post__header">
          <div className="fade-in">
            <Breadcrumbs label={t.crumbs} className="journal-post__crumbs">
              <BreadcrumbsItem href={localePath('/')}>{t.home}</BreadcrumbsItem>
              <BreadcrumbsItem as={BackLink}>Journal</BreadcrumbsItem>
              <BreadcrumbsItem>{post.title}</BreadcrumbsItem>
            </Breadcrumbs>
          </div>
          <div className="journal-post__meta fade-in" style={{ '--i': 1 }}>
            <TagList tags={postTags(post)} />
            <span aria-hidden>·</span>
            <time dateTime={post.date.replace(/\./g, '-')}>{post.date}</time>
          </div>
          <div className="journal-post__num fade-in" style={{ '--i': 2 }}>{post.num}</div>
          <h1 className="journal-post__title fade-in" style={{ '--i': 3 }}>{post.title}</h1>
          <div className="journal-post__title-en fade-in" style={{ '--i': 4 }}>{post.titleEn}</div>
          <div className="fade-in" style={{ '--i': 5 }}>
            <ShareLinks />
          </div>
          {post.untranslated ? (
            <p className="journal-post__notice fade-in" lang="en" style={{ '--i': 6 }}>
              {t.untranslated}
            </p>
          ) : null}
        </header>

        <div className="journal-post__rule" aria-hidden />

        <div className="journal-post__body">
          <JournalPostBody slug={slug}>
            <RichText doc={getDoc(content)} />
          </JournalPostBody>
        </div>

        <footer className="journal-post__footer">
          <div className="journal-post__sig">{sig}</div>
          <nav className="journal-post__nav" aria-label="post navigation">
            {prev ? (
              <Link to={localePath(`/journal/${prev.slug}`)} state={fromList ? { fromList: fromList + 1 } : undefined} className="journal-post__nav-link journal-post__nav-link--prev">
                <span className="journal-post__nav-label">Previous</span>
                <span className="journal-post__nav-title">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={localePath(`/journal/${next.slug}`)} state={fromList ? { fromList: fromList + 1 } : undefined} className="journal-post__nav-link journal-post__nav-link--next">
                <span className="journal-post__nav-label">Next</span>
                <span className="journal-post__nav-title">{next.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
          <BackLink className="journal-post__back journal-post__back--end">
            <span className="journal-post__back-line" aria-hidden />
            {t.back}
          </BackLink>
        </footer>
      </article>
      </main>
      <SiteFooter />
      {editing ? (
        <Suspense fallback={null}>
          <JournalPostEditPanel slug={slug} />
        </Suspense>
      ) : null}
    </div>
  )
}

function PostHead({ post, content, slug, english }: { post: ReadablePost; content: Body; slug: string; english: boolean }) {
  const { lang } = useLang()
  const doc = getDoc(content)
  const image = firstImage(doc)
  const shown = english ? lang : 'zh'
  return (
    <PageHead
      title={`${post.title} · Journal · TEKUEI`}
      description={post.excerpt || docText(doc).slice(0, 120)}
      path={`/journal/${slug}`}
      type="article"
      image={image}
      ld={postLd(post, shown, pageUrl(`/journal/${slug}`, shown), image)}
      english={english}
    />
  )
}

function BackLink({ className, children }: { className: string; children: ReactNode }) {
  const navigate = useNavigate()
  const localePath = useLocalePath()
  const fromList = listDepth(useLocation().state)
  const back = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!fromList || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return // keep "open in new tab"
    e.preventDefault()
    navigate(-fromList)
  }
  return (
    <Link to={localePath('/journal')} className={className} onClick={back}>
      {children}
    </Link>
  )
}
