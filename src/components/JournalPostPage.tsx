import { lazy, Suspense, useEffect } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { SiteFooter } from './SiteFooter.tsx'
import { TagList } from './Tag.tsx'
import { JournalPostBody } from './journal/JournalPostBody.tsx'
import { ShareLinks } from './journal/ShareLinks.tsx'
import { RichText } from './RichText.tsx'
import { Breadcrumbs, BreadcrumbsItem } from './Breadcrumbs.tsx'
import { getDoc } from '../lib/richText.ts'
import { useJournal } from '../context/journal.ts'
import { useAdmin } from '../context/admin.ts'
import { getAdjacentPosts, getJournalPost, JOURNAL_POST_LABELS, postTags, readableJournal } from '../data/journal.ts'
import type { ReadableJournal } from '../data/journal.ts'
import { useLang } from '../i18n'
import '../styles/work.css'
import '../styles/journal.css'

// Only Wade edits, so the panel, SidePanel and cms.css load in edit mode, not for every visitor.
const JournalPostEditPanel = lazy(() => import('./journal/JournalEditPanel.tsx').then((m) => ({ default: m.JournalPostEditPanel })))

/** How many posts were read since the list, from the history entry's state (0: not opened from the list). */
function listDepth(state: unknown): number {
  return typeof state === 'object' && state !== null && 'fromList' in state && typeof state.fromList === 'number' ? state.fromList : 0
}

export default function JournalPostPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { lang } = useLang()
  const fromList = listDepth(useLocation().state)
  const t = JOURNAL_POST_LABELS[lang]
  const { content: stored, loading } = useJournal()
  const { editing } = useAdmin()
  // While editing, the page shows the real English draft, even when it is still empty
  const journal: ReadableJournal = editing ? stored : readableJournal(stored)
  const post = getJournalPost(journal, slug, lang)
  const content = slug ? journal.content[lang]?.[slug] : null
  const { prev, next } = getAdjacentPosts(journal, slug, lang)

  const sig = lang === 'zh' ? '— 德 溎 · TEKUEI' : '— W A D E · TEKUEI'

  const title = post?.title
  useEffect(() => {
    document.title = title ? `${title} · Journal · TEKUEI` : 'Not Found · Journal · TEKUEI'
  }, [title]) // not `post`: in edit mode it is a new object on every keystroke

  // A post that only exists in R2 is missing until the remote data arrives.
  if ((!post || !content) && loading) return <div className="site-loading-bar" />

  if (!post || !content) {
    return (
      <div className="journal-page journal-page--post">
        <div className="journal-not-found">
          <div className="journal-not-found__num">—</div>
          <h1>{t.notFound}</h1>
          <Link to="/journal">{t.back}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="journal-page journal-page--post">
      <main>
      <article className="journal-post" lang={post.untranslated ? 'zh-Hant' : undefined}>
        <header className="journal-post__header">
          {/* Wrapped so the fade-in transition does not replace the links' hover transition */}
          <div className="fade-in">
            <Breadcrumbs label={t.crumbs} className="journal-post__crumbs">
              <BreadcrumbsItem href="/">{t.home}</BreadcrumbsItem>
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
          {/* Wrapped so the fade-in transition does not replace the buttons' own */}
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
              <Link to={`/journal/${prev.slug}`} state={fromList ? { fromList: fromList + 1 } : undefined} className="journal-post__nav-link journal-post__nav-link--prev">
                <span className="journal-post__nav-label">Previous</span>
                <span className="journal-post__nav-title">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={`/journal/${next.slug}`} state={fromList ? { fromList: fromList + 1 } : undefined} className="journal-post__nav-link journal-post__nav-link--next">
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

/**
 * Back to the Journal list. Opened from the list, it steps back through history instead, so the list
 * returns with its tag filter and scroll position. `fromList` counts the posts read since the list
 * (previous / next add one). Opened from anywhere else, it is a plain link to /journal.
 */
function BackLink({ className, children }: { className: string; children: ReactNode }) {
  const navigate = useNavigate()
  const fromList = listDepth(useLocation().state)
  const back = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!fromList || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return // keep "open in new tab"
    e.preventDefault()
    navigate(-fromList)
  }
  return (
    <Link to="/journal" className={className} onClick={back}>
      {children}
    </Link>
  )
}
