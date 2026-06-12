import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CustomCursor } from './CustomCursor.jsx'
import { HomeFadeIn } from './HomeFadeIn.jsx'
import { TekueiSiteNav } from './TekueiSiteNav.jsx'
import {
  getAdjacentPosts,
  getJournalPost,
  JOURNAL_CONTENT,
} from '../data/journal.js'
import '../styles/tekueiWork.css'
import '../styles/tekueiJournal.css'

function PostBlock({ block }) {
  if (block.type === 'lead') {
    return <p className="journal-post__lead">{block.text}</p>
  }
  if (block.type === 'h2') {
    return <h2 className="journal-post__h2">{block.text}</h2>
  }
  if (block.type === 'quote') {
    return (
      <blockquote className="journal-post__quote">
        <p>{block.text}</p>
        {block.attr ? <cite>{block.attr}</cite> : null}
      </blockquote>
    )
  }
  return <p className="journal-post__p">{block.text}</p>
}

export default function JournalPostPage() {
  const { slug } = useParams()
  const post = getJournalPost(slug)
  const content = slug ? JOURNAL_CONTENT[slug] : null
  const { prev, next } = getAdjacentPosts(slug ?? '')

  useEffect(() => {
    if (content) {
      document.title = content.documentTitle
    } else {
      document.title = 'Not Found · Journal · TEKUEI'
    }
  }, [content])

  if (!post || !content) {
    return (
      <div className="tekuei-journal-page tekuei-journal-page--post">
        <CustomCursor interactiveSelector="a" />
        <TekueiSiteNav highlightJournal />
        <div className="journal-not-found">
          <div className="journal-not-found__num">—</div>
          <h1>文章不存在</h1>
          <Link to="/journal">返回 Journal</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="tekuei-journal-page tekuei-journal-page--post">
      <CustomCursor interactiveSelector="a" />
      <TekueiSiteNav highlightJournal />

      <article className="journal-post">
        <header className="journal-post__header">
          <HomeFadeIn>
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
          </HomeFadeIn>
        </header>

        <div className="journal-post__rule" aria-hidden />

        <div className="journal-post__body">
          {content.blocks.map((block, i) => (
            <HomeFadeIn key={`${block.type}-${i}`}>
              <PostBlock block={block} />
            </HomeFadeIn>
          ))}
        </div>

        <footer className="journal-post__footer">
          <div className="journal-post__sig">— 德 溎 · TEKUEI</div>
          <nav className="journal-post__nav" aria-label="文章導覽">
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
    </div>
  )
}
