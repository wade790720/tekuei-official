import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HomeFadeIn } from './HomeFadeIn.jsx'
import { JOURNAL_HEADER, JOURNAL_META, JOURNAL_POSTS } from '../data/journal.js'
import { useLang } from '../i18n'
import '../styles/work.css'
import '../styles/journal.css'

export default function JournalListPage() {
  const { lang } = useLang()
  const meta = JOURNAL_META[lang]
  const header = JOURNAL_HEADER[lang]
  const posts = JOURNAL_POSTS[lang]

  useEffect(() => {
    document.title = meta.title
    const metaEl = document.querySelector('meta[name="description"]')
    if (metaEl) metaEl.setAttribute('content', meta.description)
  }, [meta])

  return (
    <div className="journal-page">
      <header className="journal-header">
        <div className="journal-header__inner">
          <HomeFadeIn>
            <div className="journal-header__pre">{header.pre}</div>
            <h1 className="journal-header__title">Journal</h1>
            <p className="journal-header__desc">
              {header.desc.map((line, i) => (
                <span key={line}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </p>
          </HomeFadeIn>
          <div className="journal-header__count" aria-hidden>
            {String(posts.length).padStart(2, '0')} Entries
          </div>
        </div>
        <div className="journal-header__slash" aria-hidden />
      </header>

      <div className="journal-list" role="list">
        {posts.map((post, index) => (
          <HomeFadeIn key={post.slug} as={Link} to={`/journal/${post.slug}`} className="journal-card" role="listitem">
            <div className="journal-card__index">
              <span className="journal-card__num">{post.num}</span>
              <span className="journal-card__line" aria-hidden />
            </div>
            <div className="journal-card__body">
              <div className="journal-card__meta">
                <span className="journal-card__category">{post.category}</span>
                <span className="journal-card__dot" aria-hidden>·</span>
                <time dateTime={post.date.replace(/\./g, '-')}>{post.date}</time>
                <span className="journal-card__dot" aria-hidden>·</span>
                <span>{post.readMin} min</span>
              </div>
              <h2 className="journal-card__title">{post.title}</h2>
              <div className="journal-card__title-en">{post.titleEn}</div>
              <p className="journal-card__excerpt">{post.excerpt}</p>
            </div>
            <div className="journal-card__arrow" aria-hidden>
              <span className="journal-card__arrow-line" />
              <span>READ</span>
            </div>
            {index < posts.length - 1 ? (
              <div className="journal-card__rule" aria-hidden />
            ) : null}
          </HomeFadeIn>
        ))}
      </div>

      <footer className="journal-footer">
        <div className="journal-footer__mark">T E K U E I · J O U R N A L</div>
        <Link to="/" className="journal-footer__back">
          ← Back to Home
        </Link>
      </footer>
    </div>
  )
}
