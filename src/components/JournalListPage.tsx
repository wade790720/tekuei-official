import { lazy, Suspense, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Tag, TagList } from './Tag.tsx'
import { JOURNAL_FILTER, JOURNAL_HEADER, JOURNAL_META, postTags, tagCounts } from '../data/journal.ts'
import { useJournalContent } from '../context/journal.ts'
import { useAdmin } from '../context/admin.ts'
import { useLang, useLocalePath } from '../i18n'
import { mountGlyphField } from '../lib/glyphField.ts'
import { SiteFooter } from './SiteFooter.tsx'
import { PageHead } from './PageHead.tsx'
import { blogLd } from '../lib/seo.ts'
import type { ReadableJournal, ReadablePost } from '../data/journal.ts'
import type { JournalPost } from '../lib/siteData.ts'
import '../styles/work.css'
import '../styles/journal.css'

const JournalListEditPanel = lazy(() => import('./journal/JournalEditPanel.tsx').then((m) => ({ default: m.JournalListEditPanel })))

const FROM_LIST = { fromList: 1 }

/** @param journal  the loader's published posts, without bodies */
export default function JournalListPage({ journal }: { journal: ReadableJournal }) {
  const { lang } = useLang()
  const localePath = useLocalePath()
  const meta = JOURNAL_META[lang]
  const header = JOURNAL_HEADER[lang]
  const { editing } = useAdmin()
  const allPosts: ReadablePost[] = useJournalContent(journal).posts[lang]
  const [params, setParams] = useSearchParams()
  const tag = params.get('tag')?.toUpperCase() ?? null
  const posts = tag ? allPosts.filter((p) => postTags(p).includes(tag)) : allPosts
  const [latest, ...rest] = posts
  const chooseTag = (t: string | null) => setParams(t ? { tag: t } : {}, { replace: true, preventScrollReset: true })
  const glyphs = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!glyphs.current) return
    return mountGlyphField(glyphs.current)
  }, [])

  return (
    <div className="journal-page">
      <PageHead title={meta.title} description={meta.description} path="/journal" ld={blogLd(meta, allPosts, lang)} />
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
                  <Link to={localePath(`/journal/${post.slug}`)} state={FROM_LIST} className="fade-in journal-row">
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

interface TagFilterProps {
  posts: JournalPost[]
  tag: string | null
  onChoose: (tag: string | null) => void
}

function TagFilter({ posts, tag, onChoose }: TagFilterProps) {
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

function byYear<P extends JournalPost>(posts: P[]): [string, P[]][] {
  const groups = new Map<string, P[]>()
  for (const p of posts) {
    const year = p.date.slice(0, 4)
    groups.set(year, [...(groups.get(year) ?? []), p])
  }
  return [...groups]
}

function FeaturedPost({ post }: { post: JournalPost }) {
  const localePath = useLocalePath()
  return (
    <Link to={localePath(`/journal/${post.slug}`)} state={FROM_LIST} className="fade-in journal-card">
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
