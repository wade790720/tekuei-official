import { hasBody } from '../lib/richText.ts'
import { LANGS } from '../lib/siteData.ts'
import type { Body, JournalData, JournalPost, Lang, Localized } from '../lib/siteData.ts'

export const JOURNAL_META = {
  zh: {
    title: 'Journal · TEKUEI',
    description: 'Wade 當下遇到的事：行銷、AI、技術、實作過程',
  },
  en: {
    title: 'Journal · TEKUEI',
    description: 'What Wade is working through right now: marketing, AI, engineering and the build process.',
  },
}

export const JOURNAL_HEADER = {
  zh: {
    pre: 'JOURNAL · 隨筆',
    desc: ['我當下遇到的事：行銷、AI、技術、實作過程'],
  },
  en: {
    pre: 'JOURNAL',
    desc: ['What I am working through right now: marketing, AI, engineering and the build process.'],
  },
}

/** Filter bar labels on the Journal list. */
export const JOURNAL_FILTER = {
  zh: { label: '依標籤篩選', all: '全部' },
  en: { label: 'Filter by tag', all: 'ALL' },
}

/** Text on a post page outside the post itself. */
export const JOURNAL_POST_LABELS = {
  zh: { back: '返回 Journal', notFound: '文章不存在', crumbs: '導覽路徑', home: '首頁', untranslated: '這篇文章目前只有中文', share: '分享這篇文章', shareTo: '分享到', copy: '複製連結', copied: '已複製', copyFailed: '複製失敗' },
  en: { back: 'Back to Journal', notFound: 'Post not found', crumbs: 'Breadcrumb', home: 'Home', untranslated: 'This post is only in Chinese for now.', share: 'Share this post', shareTo: 'Share on', copy: 'Copy link', copied: 'Copied', copyFailed: 'Copy failed' },
}

/** A post as readers see it: an English post with no body yet shows the Chinese one, marked `untranslated`. */
export type ReadablePost = JournalPost & { untranslated?: boolean }
export type ReadableJournal = JournalData<ReadablePost>

const eachLang = <T, U>(o: Localized<T>, f: (v: T) => U): Localized<U> => ({ ...o, zh: f(o.zh), en: f(o.en) })

/** A post's tags. Posts saved before tags existed have one `category`, which becomes the only tag. */
export const postTags = (post: { tags?: string[]; category?: string }): string[] => post.tags ?? (post.category ? [post.category] : [])

/** Every tag with its post count: most used first, then A to Z. */
export function tagCounts(posts: JournalPost[]): [string, number][] {
  const counts = new Map<string, number>()
  for (const p of posts) for (const t of postTags(p)) counts.set(t, (counts.get(t) ?? 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

/** Edit-panel text to tags: split on commas (also ，、), trim, uppercase, drop blanks and repeats. */
export const parseTags = (text: string): string[] => [...new Set(text.split(/[,，、]/).map((t) => t.trim().toUpperCase()).filter(Boolean))]

export const getDefaultJournal = (): JournalData => ({ posts: { zh: [], en: [] }, content: { zh: {}, en: {} } })
export const cloneJournal = (j: JournalData): JournalData => structuredClone(j)

/**
 * The copy each journal edit works on, made on every keystroke. Edits change post lists, post fields and
 * which body a slug points to, but never a body's inside: the editor always hands over a new document.
 * So the lists, posts and content maps are copied and the bodies are shared. An edit that changes a body
 * in place would also change the saved version; replace the body instead.
 */
export const copyJournalDraft = (j: JournalData): JournalData => ({
  ...j,
  posts: eachLang(j.posts, (list) => list.map((p) => ({ ...p }))),
  content: eachLang(j.content, (c) => ({ ...c })),
})

/**
 * The posts readers may see. A post marked `draft` (in either language) is left out, with its body, and the
 * rest are renumbered so the site never skips a number. The site, the SEO pages, the sitemap and llms.txt read this.
 */
export function publishedJournal(journal: JournalData): JournalData {
  const hidden = new Set([...journal.posts.zh, ...journal.posts.en].filter((p) => p.draft).map((p) => p.slug))
  if (!hidden.size) return journal
  const keep = (slug: string) => !hidden.has(slug)
  return {
    ...journal,
    posts: eachLang(journal.posts, (list) => list.filter((p) => keep(p.slug)).map((p, i) => ({ ...p, num: String(i + 1).padStart(2, '0') }))),
    content: eachLang(journal.content, (c) => Object.fromEntries(Object.entries(c).filter(([s]) => keep(s)))),
  }
}

/**
 * The journal as readers see it: no drafts, and an English post with no body yet shows the Chinese post,
 * marked `untranslated`. For display only. The edit panel reads the stored journal, drafts included.
 * Both languages come from one result, so callers may pass a language and it is ignored.
 */
export function readableJournal(journal: JournalData): ReadableJournal {
  let readable = readableCache.get(journal)
  if (!readable) readableCache.set(journal, (readable = toReadable(publishedJournal(journal))))
  return readable
}

const readableCache = new WeakMap<JournalData, ReadableJournal>()

/** The post has an English version of its own. Without one its English URL shows the Chinese text. */
export const postInEnglish = (journal: JournalData, slug: string): boolean => hasBody(journal.content.en[slug])

function toReadable(journal: JournalData): ReadableJournal {
  const zh = new Map(journal.posts.zh.map((z) => [z.slug, z]))
  const en: ReadablePost[] = journal.posts.en.map((p) =>
    postInEnglish(journal, p.slug) ? p : { ...(zh.get(p.slug) ?? p), untranslated: true },
  )
  const fallback: Record<string, Body> = {}
  for (const p of en) {
    const body = journal.content.zh[p.slug]
    if (p.untranslated && body) fallback[p.slug] = body
  }
  return {
    ...journal,
    posts: { ...journal.posts, en },
    content: { ...journal.content, en: { ...journal.content.en, ...fallback } },
  }
}

export function getJournalPost<P extends JournalPost>(journal: JournalData<P>, slug: string, lang: Lang = 'zh'): P | null {
  return (journal.posts[lang] ?? journal.posts.zh).find((p) => p.slug === slug) ?? null
}

export function getAdjacentPosts<P extends JournalPost>(journal: JournalData<P>, slug: string, lang: Lang = 'zh'): { prev: P | null; next: P | null } {
  const posts = journal.posts[lang] ?? journal.posts.zh
  const i = posts.findIndex((p) => p.slug === slug)
  if (i < 0) return { prev: null, next: null }
  return {
    prev: i > 0 ? posts[i - 1] : null,
    next: i < posts.length - 1 ? posts[i + 1] : null,
  }
}

export const today = (d = new Date()): string =>
  [d.getFullYear(), d.getMonth() + 1, d.getDate()].map((n) => String(n).padStart(2, '0')).join('.')

/**
 * Marks each post whose fields or body changed since `saved` as `updated` on `day`, in every language.
 * The list number and the mark itself do not count as a change. Edits `next` in place.
 */
export function stampUpdated(next: JournalData, saved: JournalData, day: string): void {
  const slugs = new Set([...next.posts.zh, ...next.posts.en].map((p) => p.slug))
  const state = (j: JournalData, slug: string) =>
    JSON.stringify(
      LANGS.map((l) => {
        const post = j.posts[l].find((p) => p.slug === slug)
        return [post && { ...post, num: undefined, updated: undefined }, j.content[l][slug]]
      }),
    )
  for (const slug of slugs) {
    if (state(next, slug) === state(saved, slug)) continue
    for (const l of LANGS) {
      const post = next.posts[l].find((p) => p.slug === slug)
      if (post) post.updated = day
    }
  }
}

/**
 * True when the two journals differ only in one post (its fields, its bodies, the list numbering).
 * A draft autosaves only then, so it never carries other unsaved edits, such as a deleted post, along.
 */
export function differsOnlyIn(a: JournalData, b: JournalData, slug: string): boolean {
  const rest = (j: JournalData) =>
    JSON.stringify({
      ...j,
      posts: eachLang(j.posts, (list) => list.filter((p) => p.slug !== slug).map((p) => ({ ...p, num: undefined }))),
      content: eachLang(j.content, (c) => Object.fromEntries(Object.entries(c).filter(([s]) => s !== slug))),
    })
  return rest(a) === rest(b)
}
