import { lazy, Suspense, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Skeleton } from './Skeleton.tsx'
import { Tag, TagList } from './Tag.tsx'
import { JOURNAL_FILTER, JOURNAL_HEADER, JOURNAL_META, postTags, readableJournal, tagCounts } from '../data/journal.ts'
import { useJournal } from '../context/journal.ts'
import { useAdmin } from '../context/admin.ts'
import { useLang } from '../i18n'
import { mountGlyphField } from '../lib/glyphField.ts'
import { SiteFooter } from './SiteFooter.tsx'
import '../styles/work.css'
import '../styles/journal.css'

// Only Wade edits, so the panel, SidePanel and cms.css load in edit mode, not for every visitor.
const JournalListEditPanel = lazy(() => import('./journal/JournalEditPanel.tsx').then((m) => ({ default: m.JournalListEditPanel })))

// Tells the post page it was opened from this list, so its back link can return here (JournalPostPage BackLink).
const FROM_LIST = { fromList: 1 }

export default function JournalListPage() {
  const { lang } = useLang()
  const meta = JOURNAL_META[lang]
  const header = JOURNAL_HEADER[lang]
  const { content, loading } = useJournal()
  const { editing } = useAdmin()
  // Until R2 answers, content holds the bundled default posts; show placeholders instead of swapping them out.
  const allPosts = loading ? [] : (editing ? content : readableJournal(content)).posts[lang]
  // The chosen tag lives in the URL (?tag=AI), so a filtered list can be shared.
  const [params, setParams] = useSearchParams()
  const tag = params.get('tag')?.toUpperCase() ?? null
  const posts = tag ? allPosts.filter((p) => postTags(p).includes(tag)) : allPosts
  const [latest, ...rest] = posts
  const chooseTag = (t) => setParams(t ? { tag: t } : {}, { replace: true, preventScrollReset: true })
  const glyphs = useRef(null)

  useEffect(() => mountGlyphField(glyphs.current), [])

  useEffect(() => {
    document.title = meta.title
    const metaEl = document.querySelector('meta[name="description"]')
    if (metaEl) metaEl.setAttribute('content', meta.description)
  }, [meta])

  return (
    <div className="journal-page">
      <main>
      <header className="journal-header">
        <canvas className="journal-header__glyphs" ref={glyphs} aria-hidden />
        <div className="journal-header__inner">
          <div className="fade-in">
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
          </div>
          <div className="journal-header__count" aria-hidden>
            {loading ? '—' : String(posts.length).padStart(2, '0')} Entries
          </div>
        </div>
        <div className="journal-header__slash" aria-hidden />
      </header>

      <div className="journal-list">
        {loading ? <ListSkeleton label={header.loading} /> : null}
        <TagFilter posts={allPosts} tag={tag} onChoose={chooseTag} />
        {latest ? <FeaturedPost post={latest} /> : null}
        {byYear(rest).map(([year, group]) => (
          <section className="journal-year" key={year} aria-label={year}>
            <div className="journal-year__label">{year}</div>
            <ol className="journal-year__rows">
              {group.map((post) => (
                <li key={post.slug}>
                  <Link to={`/journal/${post.slug}`} state={FROM_LIST} className="fade-in journal-row">
                    <span className="journal-row__num">{post.num}</span>
                    <span className="journal-row__title">{post.title}</span>
                    <span className="journal-row__tags">
                      <TagList tags={postTags(post)} />
                    </span>
                    <time className="journal-row__date" dateTime={post.date.replace(/\./g, '-')}>
                      {post.date.slice(5)}
                    </time>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      </main>

      <SiteFooter />
      {editing ? (
        <Suspense fallback={null}>
          <JournalListEditPanel />
        </Suspense>
      ) : null}
    </div>
  )
}

/** One row of tag pills over the list, each with its post count. Hidden when there is nothing to choose between. */
function TagFilter({ posts, tag, onChoose }) {
  const { lang } = useLang()
  const t = JOURNAL_FILTER[lang]
  const tags = tagCounts(posts)
  if (tags.length < 2) return null
  return (
    <div className="journal-filter tag-group" role="group" aria-label={t.label}>
      <Tag count={posts.length} selected={!tag} onClick={() => onChoose(null)}>
        {t.all}
      </Tag>
      {tags.map(([name, count]) => (
        <Tag key={name} count={count} selected={tag === name} onClick={() => onChoose(tag === name ? null : name)}>
          {name}
        </Tag>
      ))}
    </div>
  )
}

/** Placeholders in the shape of the featured card and three rows, using the same grids. */
function ListSkeleton({ label }) {
  return (
    <div className="journal-skeleton" role="status" aria-label={label}>
      <div className="journal-filter tag-group">
        {[64, 96, 88, 72].map((w) => (
          <Skeleton key={w} className="journal-skeleton__pill" style={{ width: w }} />
        ))}
      </div>
      <div className="journal-card">
        <div className="journal-card__index">
          <Skeleton className="journal-skeleton__num" />
        </div>
        <div className="journal-card__body">
          <Skeleton className="journal-skeleton__meta" />
          <Skeleton className="journal-skeleton__title" />
          <Skeleton className="journal-skeleton__title journal-skeleton__title--short" />
          <Skeleton className="journal-skeleton__line" />
          <Skeleton className="journal-skeleton__line journal-skeleton__line--short" />
        </div>
      </div>
      <div className="journal-year">
        <div className="journal-year__label">
          <Skeleton className="journal-skeleton__num" />
        </div>
        <div className="journal-year__rows">
          {[70, 55, 62].map((w) => (
            <div className="journal-row" key={w}>
              <span className="journal-row__num">
                <Skeleton className="journal-skeleton__num" />
              </span>
              <Skeleton className="journal-skeleton__row-title" style={{ width: `${w}%` }} />
              <span />
              <span className="journal-row__date">
                <Skeleton className="journal-skeleton__num" />
              </span>
              <span className="journal-row__min">
                <Skeleton className="journal-skeleton__num" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Posts in their stored order, grouped by the year of their date: [['2026', [...]], ...]. */
function byYear(posts) {
  const groups = new Map()
  for (const p of posts) {
    const year = p.date.slice(0, 4)
    groups.set(year, [...(groups.get(year) ?? []), p])
  }
  return [...groups]
}

function FeaturedPost({ post }) {
  return (
    <Link to={`/journal/${post.slug}`} state={FROM_LIST} className="fade-in journal-card">
      <div className="journal-card__index">
        <span className="journal-card__num">{post.num}</span>
        <span className="journal-card__line" aria-hidden />
      </div>
      <div className="journal-card__body">
        <div className="journal-card__meta">
          <TagList tags={postTags(post)} />
          <span className="journal-card__dot" aria-hidden>·</span>
          <time dateTime={post.date.replace(/\./g, '-')}>{post.date}</time>
        </div>
        <h2 className="journal-card__title">{post.title}</h2>
        <div className="journal-card__title-en">{post.titleEn}</div>
        <p className="journal-card__excerpt">{post.excerpt}</p>
      </div>
      <div className="journal-card__arrow" aria-hidden>
        <span className="journal-card__arrow-line" />
        <span>READ</span>
      </div>
    </Link>
  )
}
