import { Link } from 'react-router-dom'
import '../styles/homeHero.css'
import { HOME_HERO } from '../data/homepage.js'
import { useJournal } from '../context/journal.js'
import { postTags } from '../data/journal.js'
import { LivingPortrait } from '../labs/living-portrait/LivingPortrait.jsx'
import { Skeleton } from './Skeleton.jsx'
import { useLang } from '../i18n'

export function HomeHero() {
  const { lang } = useLang()
  const hero = HOME_HERO[lang]
  const { content, loading } = useJournal()
  const posts = content.posts[lang].slice(0, 3)
  return (
    <>
      <LivingPortrait name={hero.name} label={hero.ariaLabel} />

      <section className="home-latest" aria-labelledby="home-latest-title">
        <div className="home-latest__bar">
          <h2 id="home-latest-title">{hero.latestLabel}</h2>
          <Link to="/journal">
            {hero.viewAll} <span aria-hidden>↗</span>
          </Link>
        </div>
        {/* Until R2 answers, content holds the bundled default posts; show placeholders instead of swapping them out. */}
        {loading ? (
          <div className="home-latest__cards" role="status" aria-label={hero.loading}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="home-latest__card">
                <Skeleton className="home-latest__thumb" />
                <span className="home-latest__body">
                  <Skeleton className="home-latest__skeleton-meta" />
                  <Skeleton className="home-latest__skeleton-title" />
                  <Skeleton className="home-latest__skeleton-title home-latest__skeleton-title--short" />
                </span>
              </div>
            ))}
          </div>
        ) : (
          <ul className="home-latest__cards">
            {posts.map((post, i) => (
              <li key={post.slug}>
                <Link to={`/journal/${post.slug}`}>
                  <span className={`home-latest__thumb home-latest__thumb--${i + 1}`} aria-hidden />
                  <span className="home-latest__body">
                    <span className="home-latest__meta">
                      {postTags(post).join(', ')} · {post.readMin} MIN
                    </span>
                    <span className="home-latest__title">{post.title}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
