import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FadeIn } from './FadeIn.jsx'
import { JournalPostEditPanel } from './journal/JournalEditPanel.jsx'
import { RichText } from './RichText.jsx'
import { getDoc } from '../lib/richText.js'
import { useJournal } from '../context/journal.js'
import { getAdjacentPosts, getJournalPost } from '../data/journal.js'
import { useLang } from '../i18n'
import '../styles/work.css'
import '../styles/journal.css'

export default function JournalPostPage() {
  const { slug } = useParams()
  const { lang } = useLang()
  const { content: journal, loading } = useJournal()
  const post = getJournalPost(journal, slug, lang)
  const content = slug ? journal.content[lang]?.[slug] : null
  const { prev, next } = getAdjacentPosts(journal, slug ?? '', lang)

  const sig = lang === 'zh' ? '— 德 溎 · TEKUEI' : '— W A D E · TEKUEI'
  const notFoundText = lang === 'zh' ? '文章不存在' : 'Post not found'
  const backText = lang === 'zh' ? '返回 Journal' : 'Back to Journal'

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
          <h1>{notFoundText}</h1>
          <Link to="/journal">{backText}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="journal-page journal-page--post">

      <article className="journal-post">
        <header className="journal-post__header">
          <FadeIn>
            <Link to="/journal" className="journal-post__back">
              <span className="journal-post__back-line" aria-hidden />
              JOURNAL
            </Link>
            <div className="journal-post__meta">
              <span>{post.category}</span>
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
          <RichText doc={getDoc(content)} />
        </div>

        <footer className="journal-post__footer">
          <div className="journal-post__sig">{sig}</div>
          <nav className="journal-post__nav" aria-label="post navigation">
            {prev ? (
              <Link to={`/journal/${prev.slug}`} className="journal-post__nav-link journal-post__nav-link--prev">
                <span className="journal-post__nav-label">Previous</span>
                <span className="journal-post__nav-title">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={`/journal/${next.slug}`} className="journal-post__nav-link journal-post__nav-link--next">
                <span className="journal-post__nav-label">Next</span>
                <span className="journal-post__nav-title">{next.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </footer>
      </article>
      <JournalPostEditPanel slug={slug} />
    </div>
  )
}
