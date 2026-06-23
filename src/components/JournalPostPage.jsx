import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { HomeFadeIn } from './HomeFadeIn.jsx'
import {
  getAdjacentPosts,
  getJournalPost,
  JOURNAL_CONTENT,
} from '../data/journal.js'
import { useLang } from '../i18n'
import '../styles/work.css'
import '../styles/journal.css'

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
  const { lang } = useLang()
  const post = getJournalPost(slug, lang)
  const content = slug ? JOURNAL_CONTENT[lang]?.[slug] : null
  const { prev, next } = getAdjacentPosts(slug ?? '', lang)

  const sig = lang === 'zh' ? '— 德 溎 · TEKUEI' : '— W A D E · TEKUEI'
  const notFoundText = lang === 'zh' ? '文章不存在' : 'Post not found'
  const backText = lang === 'zh' ? '返回 Journal' : 'Back to Journal'

  useEffect(() => {
    if (content) {
      document.title = content.documentTitle
    } else {
      document.title = 'Not Found · Journal · TEKUEI'
    }
  }, [content])

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
    </div>
  )
}
