import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HomeFadeIn } from './HomeFadeIn.jsx'
import { JOURNAL_META, JOURNAL_POSTS } from '../data/journal.js'
import '../styles/work.css'
import '../styles/journal.css'

export default function JournalListPage() {
  useEffect(() => {
    document.title = JOURNAL_META.title
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', JOURNAL_META.description)
  }, [])

  return (
    <div className="journal-page">
      <header className="journal-header">
        <div className="journal-header__inner">
          <HomeFadeIn>
            <div className="journal-header__pre">J O U R N A L · 隨 筆</div>
            <h1 className="journal-header__title">Journal</h1>
            <p className="journal-header__desc">
              關於留白、水墨、新東方主義與品牌美學的思考。
              <br />
              在黑白之間，尋找呼吸的節奏。
            </p>
          </HomeFadeIn>
          <div className="journal-header__count" aria-hidden>
            {String(JOURNAL_POSTS.length).padStart(2, '0')} Entries
          </div>
        </div>
        <div className="journal-header__slash" aria-hidden />
      </header>

      <div className="journal-list" role="list">
        {JOURNAL_POSTS.map((post, index) => (
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
            {index < JOURNAL_POSTS.length - 1 ? (
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
