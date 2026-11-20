import { useEffect } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { FadeIn } from './FadeIn.jsx'
import { TagList } from './Tag.jsx'
import { JournalPostBody, JournalPostEditPanel } from './journal/JournalEditPanel.jsx'
import { RichText } from './RichText.jsx'
import { getDoc } from '../lib/richText.js'
import { useJournal } from '../context/journal.js'
import { getAdjacentPosts, getJournalPost, JOURNAL_POST_LABELS, postTags } from '../data/journal.js'
import { useLang } from '../i18n'
import '../styles/work.css'
import '../styles/journal.css'

export default function JournalPostPage() {
  const { slug } = useParams()
  const { lang } = useLang()
  const fromList = useLocation().state?.fromList
  const t = JOURNAL_POST_LABELS[lang]
  const { content: journal, loading } = useJournal()
  const post = getJournalPost(journal, slug, lang)
  const content = slug ? journal.content[lang]?.[slug] : null
  const { prev, next } = getAdjacentPosts(journal, slug ?? '', lang)

  const sig = lang === 'zh' ? '— 德 溎 · TEKUEI' : '— W A D E · TEKUEI'

  useEffect(() => {
    document.title = post ? `${post.title} · Journal · TEKUEI` : 'Not Found · Journal · TEKUEI'
  }, [post])

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

      <article className="journal-post">
        <header className="journal-post__header">
          <FadeIn>
            <BackLink className="journal-post__back">
              <span className="journal-post__back-line" aria-hidden />
              JOURNAL
            </BackLink>
            <div className="journal-post__meta">
              <TagList tags={postTags(post)} />
              <span aria-hidden>·</span>
              <time dateTime={post.date.replace(/\./g, '-')}>{post.date}</time>
              <span aria-hidden>·</span>
              <span>{post.readMin} min read</span>
            </div>
            <div className="journal-post__num">{post.num}</div>
            <h1 className="journal-post__title">{post.title}</h1>
            <div className="journal-post__title-en">{post.titleEn}</div>
          </FadeIn>
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
              <Link to={`/journal/${prev.slug}`} state={fromList && { fromList: fromList + 1 }} className="journal-post__nav-link journal-post__nav-link--prev">
                <span className="journal-post__nav-label">Previous</span>
                <span className="journal-post__nav-title">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={`/journal/${next.slug}`} state={fromList && { fromList: fromList + 1 }} className="journal-post__nav-link journal-post__nav-link--next">
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
      <JournalPostEditPanel slug={slug} />
    </div>
  )
}

/**
 * Back to the Journal list. Opened from the list, it steps back through history instead, so the list
 * returns with its tag filter and scroll position. `fromList` counts the posts read since the list
 * (previous / next add one). Opened from anywhere else, it is a plain link to /journal.
 */
function BackLink({ className, children }) {
  const navigate = useNavigate()
  const fromList = useLocation().state?.fromList
  const back = (e) => {
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
