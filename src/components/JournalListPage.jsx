import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Skeleton } from './Skeleton.jsx'
import { Tag, TagList } from './Tag.jsx'
import { JOURNAL_FILTER, JOURNAL_HEADER, JOURNAL_META, postTags, tagCounts } from '../data/journal.js'
import { useJournal } from '../context/journal.js'
import { JournalListEditPanel } from './journal/JournalEditPanel.jsx'
import { HOME_FOOTER } from '../data/homepage.js'
import { useLang } from '../i18n'
import { mountGlyphField } from '../lib/glyphField.js'
import { mountShatterImage } from '../lib/shatterImage.js'
import seaImage from '../assets/journal/footer-sea.webp'
import '../styles/work.css'
import '../styles/journal.css'

// Tells the post page it was opened from this list, so its back link can return here (JournalPostPage BackLink).
const FROM_LIST = { fromList: 1 }

export default function JournalListPage() {
  const { lang } = useLang()
  const meta = JOURNAL_META[lang]
  const header = JOURNAL_HEADER[lang]
  const { content, loading } = useJournal()
  // Until R2 answers, content holds the bundled default posts; show placeholders instead of swapping them out.
  const allPosts = loading ? [] : content.posts[lang]
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
                    <span className="journal-row__min">{post.readMin} min</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <JournalFooter posts={allPosts} />
      <JournalListEditPanel />
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
    </Link>
  )
}

function FooterLink({ href, i, children }) {
  const props = { className: 'journal-footer__link', style: { '--i': i } }
  // An entry without an address is listed as plain text.
  if (!href) return <span {...props}>{children}</span>
  return href.startsWith('/') ? (
    <Link to={href} {...props}>
      {children}
    </Link>
  ) : (
    <a href={href} {...props}>
      {children}
    </a>
  )
}

/** @param {{ posts: { slug: string, title: string }[] }} props  newest first; the Latest column lists three */
function JournalFooter({ posts }) {
  const { lang } = useLang()
  const footer = HOME_FOOTER[lang]
  const root = useRef(null)
  const sea = useRef(null)

  useEffect(
    () =>
      mountShatterImage(sea.current, {
        src: seaImage,
        crop: [0, 583, 1920, 705], // the bottom strip of the 1920 × 1288 image, in the canvas's 1280:470 ratio
        onPlay: () => root.current?.classList.add('is-in'),
      }),
    [],
  )

  const columns = [
    { title: footer.titles.explore, links: footer.explore },
    { title: footer.titles.latest, links: posts.slice(0, 3).map((p) => ({ label: p.title, href: `/journal/${p.slug}` })) },
    { title: footer.titles.contact, links: footer.contact },
  ]

  return (
    <footer className="journal-footer" ref={root}>
      <div className="journal-footer__rules" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="journal-footer__cols">
        <div className="journal-footer__col">
          <Link to="/" className="journal-footer__brand journal-footer__r" style={{ '--i': 0 }}>
            T E K U E I
          </Link>
          <div className="journal-footer__sub journal-footer__r" style={{ '--i': 1 }}>
            德 溎
          </div>
          <div className="journal-footer__copy journal-footer__r" style={{ '--i': 3 }}>
            © 2026 TEKUEI
          </div>
        </div>
        {columns.map((col, c) => (
          <div className="journal-footer__col" key={c}>
            <div className="journal-footer__title journal-footer__r" style={{ '--i': c * 2 + 2 }}>
              {col.title}
            </div>
            {col.links.map((link, k) => (
              <FooterLink key={link.label} href={link.href} i={c * 2 + 3 + k}>
                {link.label}
              </FooterLink>
            ))}
          </div>
        ))}
      </div>
      <canvas className="journal-footer__sea" ref={sea} aria-hidden />
    </footer>
  )
}
