import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FadeIn } from './FadeIn.jsx'
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
  const allPosts = useJournal().content.posts[lang]
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
          <FadeIn>
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
          </FadeIn>
          <div className="journal-header__count" aria-hidden>
            {String(posts.length).padStart(2, '0')} Entries
          </div>
        </div>
        <div className="journal-header__slash" aria-hidden />
      </header>

      <div className="journal-list">
        <TagFilter posts={allPosts} tag={tag} onChoose={chooseTag} />
        {latest ? <FeaturedPost post={latest} /> : null}
        {byYear(rest).map(([year, group]) => (
          <section className="journal-year" key={year} aria-label={year}>
            <div className="journal-year__label">{year}</div>
            <ol className="journal-year__rows">
              {group.map((post) => (
                <li key={post.slug}>
                  <FadeIn as={Link} to={`/journal/${post.slug}`} state={FROM_LIST} className="journal-row">
                    <span className="journal-row__num">{post.num}</span>
                    <span className="journal-row__title">{post.title}</span>
                    <span className="journal-row__tags">
                      <TagList tags={postTags(post)} />
                    </span>
                    <time className="journal-row__date" dateTime={post.date.replace(/\./g, '-')}>
                      {post.date.slice(5)}
                    </time>
                    <span className="journal-row__min">{post.readMin} min</span>
                  </FadeIn>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <JournalFooter />
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
    <FadeIn as={Link} to={`/journal/${post.slug}`} state={FROM_LIST} className="journal-card">
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
    </FadeIn>
  )
}

function FooterLink({ href, i, children }) {
  const props = { className: 'journal-footer__link', style: { '--i': i } }
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

function JournalFooter() {
  const { lang } = useLang()
  const footer = HOME_FOOTER[lang]
  const root = useRef(null)
  const sea = useRef(null)

  useEffect(
    () =>
      mountShatterImage(sea.current, {
        src: seaImage,
        crop: [0, 389, 1280, 470],
        onPlay: () => root.current?.classList.add('is-in'),
      }),
    [],
  )

  const columns = [
    { title: 'Explore', links: footer.explore },
    { title: 'Contact', links: footer.contact },
  ]

  return (
    <footer className="journal-footer" ref={root}>
      <div className="journal-footer__rules" aria-hidden>
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
          <div className="journal-footer__col" key={col.title}>
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
