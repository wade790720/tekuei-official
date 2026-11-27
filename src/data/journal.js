import { hasBody } from '../lib/richText.js'

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
    loading: '文章載入中',
  },
  en: {
    pre: 'JOURNAL',
    desc: ['What I am working through right now: marketing, AI, engineering and the build process.'],
    loading: 'Loading posts',
  },
}

/**
 * The "journal" section in data.json (R2). Posts are listed once per language, in the same order.
 * @typedef {{ slug: string, num: string, tags: string[], date: string, title: string, titleEn: string, excerpt: string, draft?: boolean }} JournalPost
 * @typedef {{
 *   posts: { zh: JournalPost[], en: JournalPost[] },
 *   content: { zh: Record<string, { doc: object }>, en: Record<string, { doc: object }> },
 * }} JournalData
 */
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

/** A post's tags. Posts saved before tags existed have one `category`, which becomes the only tag. */
export const postTags = (post) => post.tags ?? (post.category ? [post.category] : [])

/** Every tag with its post count: most used first, then A to Z. */
export function tagCounts(posts) {
  const counts = new Map()
  for (const p of posts) for (const t of postTags(p)) counts.set(t, (counts.get(t) ?? 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

/** Edit-panel text to tags: split on commas (also ，、), trim, uppercase, drop blanks and repeats. */
export const parseTags = (text) => [...new Set(text.split(/[,，、]/).map((t) => t.trim().toUpperCase()).filter(Boolean))]

// No bundled posts: every post is written on the site and lives in R2. Until R2 answers, the journal is empty.
export const getDefaultJournal = () => ({ posts: { zh: [], en: [] }, content: { zh: {}, en: {} } })
export const cloneJournal = (j) => structuredClone(j)

/**
 * The copy each journal edit works on, made on every keystroke. Edits change post lists, post fields and
 * which body a slug points to, but never a body's inside: the editor always hands over a new document.
 * So the lists, posts and content maps are copied and the bodies are shared. An edit that changes a body
 * in place would also change the saved version; replace the body instead.
 */
export const copyJournalDraft = (j) => ({
  ...j,
  posts: Object.fromEntries(Object.entries(j.posts).map(([l, list]) => [l, list.map((p) => ({ ...p }))])),
  content: Object.fromEntries(Object.entries(j.content).map(([l, c]) => [l, { ...c }])),
})

/** @param {JournalData} journal @param {string} slug */

/**
 * The posts readers may see. A post marked `draft` (in either language) is left out, with its body, and the
 * rest are renumbered so the site never skips a number. The site, the SEO pages, the sitemap and llms.txt read this.
 * @param {JournalData} journal
 */
export function publishedJournal(journal) {
  const hidden = new Set(Object.values(journal.posts).flatMap((list) => list.filter((p) => p.draft).map((p) => p.slug)))
  if (!hidden.size) return journal
  const keep = (slug) => !hidden.has(slug)
  return {
    ...journal,
    posts: Object.fromEntries(
      Object.entries(journal.posts).map(([l, list]) => [
        l,
        list.filter((p) => keep(p.slug)).map((p, i) => ({ ...p, num: String(i + 1).padStart(2, '0') })),
      ]),
    ),
    content: Object.fromEntries(
      Object.entries(journal.content ?? {}).map(([l, c]) => [l, Object.fromEntries(Object.entries(c ?? {}).filter(([s]) => keep(s)))]),
    ),
  }
}

/**
 * The journal as readers see it: no drafts, and an English post with no body yet shows the Chinese post,
 * marked `untranslated`. For display only. The edit panel reads the stored journal, drafts included.
 * Both languages come from one result, so callers may pass a language and it is ignored.
 * @param {JournalData} journal
 */
export function readableJournal(journal) {
  // Journal data is replaced, never mutated, so one result per object is safe. Pages call this on every render.
  let readable = readableCache.get(journal)
  if (!readable) readableCache.set(journal, (readable = toReadable(publishedJournal(journal))))
  return readable
}

const readableCache = new WeakMap()

function toReadable(journal) {
  const zh = new Map((journal.posts.zh ?? []).map((z) => [z.slug, z]))
  const en = (journal.posts.en ?? []).map((p) =>
    hasBody(journal.content.en?.[p.slug]) ? p : { ...(zh.get(p.slug) ?? p), untranslated: true },
  )
  const fallback = Object.fromEntries(en.filter((p) => p.untranslated).map((p) => [p.slug, journal.content.zh?.[p.slug]]))
  return {
    ...journal,
    posts: { ...journal.posts, en },
    content: { ...journal.content, en: { ...journal.content.en, ...fallback } },
  }
}

export function getJournalPost(journal, slug, lang = 'zh') {
  return (journal.posts[lang] ?? journal.posts.zh).find((p) => p.slug === slug) ?? null
}

/** @param {JournalData} journal @param {string} slug */
export function getAdjacentPosts(journal, slug, lang = 'zh') {
  const posts = journal.posts[lang] ?? journal.posts.zh
  const i = posts.findIndex((p) => p.slug === slug)
  if (i < 0) return { prev: null, next: null }
  return {
    prev: i > 0 ? posts[i - 1] : null,
    next: i < posts.length - 1 ? posts[i + 1] : null,
  }
}

// Labels for the code, image and video cards in post bodies.


/**
 * True when the two journals differ only in one post (its fields, its bodies, the list numbering).
 * A draft autosaves only then, so it never carries other unsaved edits, such as a deleted post, along.
 * @param {JournalData} a @param {JournalData} b @param {string} slug
 */
export function differsOnlyIn(a, b, slug) {
  const rest = (j) =>
    JSON.stringify({
      ...j,
      posts: Object.fromEntries(
        Object.entries(j.posts).map(([l, list]) => [l, list.filter((p) => p.slug !== slug).map((p) => ({ ...p, num: undefined }))]),
      ),
      content: Object.fromEntries(
        Object.entries(j.content ?? {}).map(([l, c]) => [l, Object.fromEntries(Object.entries(c ?? {}).filter(([s]) => s !== slug))]),
      ),
    })
  return rest(a) === rest(b)
}
