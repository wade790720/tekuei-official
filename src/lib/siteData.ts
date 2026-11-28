import type { JSONContent } from '@tiptap/react'

export type Lang = 'zh' | 'en'
export const LANGS: readonly Lang[] = ['zh', 'en']
/** Bilingual content: one value per language. */
export type Localized<T> = Record<Lang, T>

export type Doc = JSONContent

/** A post body from before Tiptap. richText's getDoc turns it into a Doc on read. */
export interface LegacyBlock {
  type?: string
  text?: string
  attr?: string
  lang?: string
  filename?: string
  code?: string
  src?: string
  alt?: string
  caption?: string
  poster?: string
  frame?: boolean
  loop?: boolean
}

/** One stored body: a Tiptap document, or the old block list. */
export type Body = { doc: Doc } | { blocks: LegacyBlock[] }

export interface ImageRef {
  alt?: string
  url: string
}

export interface JournalPost {
  slug: string
  num: string
  tags: string[]
  date: string
  title: string
  titleEn: string
  excerpt: string
  draft?: boolean
  /** Date of the last save that changed this post (journal.ts stampUpdated). */
  updated?: string
  /** Before tags: one category. The parser copies it into `tags`. */
  category?: string
}

/** Posts are listed once per language, in the same order. */
export interface JournalData<P extends JournalPost = JournalPost> {
  posts: Localized<P[]>
  content: Localized<Record<string, Body>>
}

export type ProjectType = 'web' | 'exhibition' | 'side'

export interface WorkItem {
  id: string
  type?: ProjectType
  num?: string
  caseHref?: string
  client?: string
  title?: string
  titleEmWord?: string
  titleEm?: boolean
  subtitle?: string
  descriptionLines?: string[]
  tags?: string[]
  link?: string
  thumbBg?: string
  thumbSvg?: string
  /** The cover: the list card and the top of the project page. */
  thumbImage?: ImageRef
  draft?: boolean
  /** English written in the edit panel; empty fields fall back to the bundled or Chinese text. */
  en?: { client?: string; title?: string }
}

export interface WorkData {
  items: WorkItem[]
  /** Project pages written in the editor, by item id. */
  content?: Partial<Localized<Record<string, Body>>>
  /** Ids of code projects Wade deleted, so they are not added back. */
  removed?: string[]
  meta?: Record<string, unknown>
  header?: Record<string, unknown>
  footer?: Record<string, unknown>
}

export interface AboutPageData {
  zh: Body
  en?: Body
}

/** Pictures stored for the first three case pages, whose text is in src/data/cases. */
export interface CaseAssets {
  hero?: { image?: ImageRef }
  media?: { fullWidthImage?: ImageRef; inlineImage?: ImageRef }
}

/** The sections an editor saves whole, by their key in data.json. */
export interface EditableSections {
  journal: JournalData
  work: WorkData
  aboutPage: AboutPageData
}
export type SectionKey = keyof EditableSections

export interface SiteData extends Partial<EditableSections> {
  cases?: Record<string, CaseAssets>
  /** Old About copy. No page reads it; it is kept so no save replaces it. */
  about?: unknown
}

export type SectionName = 'journal' | 'work' | 'aboutPage' | 'cases'

export interface ParsedSiteData {
  data: SiteData
  /** Sections R2 has but in a shape the site cannot read. They are left out of `data`. */
  invalid: SectionName[]
}

type Json = Record<string, unknown>
const isRecord = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v)
const isString = (v: unknown): v is string => typeof v === 'string'
const isStrings = (v: unknown): v is string[] => Array.isArray(v) && v.every(isString)
const isImage = (v: unknown): v is ImageRef => isRecord(v) && isString(v.url) && fieldsOk(v, { alt: 'string' })

const CHECKS = {
  string: isString,
  boolean: (v: unknown) => typeof v === 'boolean',
  strings: isStrings,
  image: isImage,
  projectType: (v: unknown) => v === 'web' || v === 'exhibition' || v === 'side',
  record: isRecord,
}
type Spec = Record<string, keyof typeof CHECKS>
const fieldsOk = (o: Json, spec: Spec) => Object.entries(spec).every(([k, kind]) => o[k] === undefined || CHECKS[kind](o[k]))

const POST_TEXT = ['num', 'date', 'title', 'titleEn', 'excerpt'] as const
const POST_SPEC: Spec = { ...Object.fromEntries(POST_TEXT.map((k) => [k, 'string'])), tags: 'strings', category: 'string', draft: 'boolean', updated: 'string' }
const BLOCK_SPEC: Spec = { type: 'string', text: 'string', attr: 'string', lang: 'string', filename: 'string', code: 'string', src: 'string', alt: 'string', caption: 'string', poster: 'string', frame: 'boolean', loop: 'boolean' }
const ITEM_SPEC: Spec = {
  type: 'projectType',
  num: 'string',
  caseHref: 'string',
  client: 'string',
  title: 'string',
  titleEmWord: 'string',
  titleEm: 'boolean',
  subtitle: 'string',
  descriptionLines: 'strings',
  tags: 'strings',
  link: 'string',
  thumbBg: 'string',
  thumbSvg: 'string',
  thumbImage: 'image',
  draft: 'boolean',
  en: 'record',
}

function parseBody(v: unknown): Body | null {
  if (!isRecord(v)) return null
  if (isRecord(v.doc)) return v as { doc: Doc }
  if (Array.isArray(v.blocks) && v.blocks.every((b) => isRecord(b) && fieldsOk(b, BLOCK_SPEC))) return v as { blocks: LegacyBlock[] }
  return null
}

function parseBodies(v: unknown): Record<string, Body> | null {
  if (!isRecord(v)) return null
  const out: Record<string, Body> = {}
  for (const [key, body] of Object.entries(v)) {
    const parsed = parseBody(body)
    if (!parsed) return null
    out[key] = parsed
  }
  return out
}

function parsePost(v: unknown): JournalPost | null {
  if (!isRecord(v) || !isString(v.slug) || !fieldsOk(v, POST_SPEC)) return null
  const text = (k: (typeof POST_TEXT)[number]) => (isString(v[k]) ? v[k] : '')
  const tags = isStrings(v.tags) ? v.tags : isString(v.category) && v.category ? [v.category] : []
  return { ...v, slug: v.slug, num: text('num'), date: text('date'), title: text('title'), titleEn: text('titleEn'), excerpt: text('excerpt'), tags }
}

function parseJournal(v: unknown): JournalData | null {
  if (!isRecord(v) || !isRecord(v.posts) || !(v.content === undefined || isRecord(v.content))) return null
  const posts: Partial<Localized<JournalPost[]>> = {}
  const content: Partial<Localized<Record<string, Body>>> = {}
  for (const l of LANGS) {
    const list = v.posts[l] ?? []
    if (!Array.isArray(list)) return null
    const parsed = list.map(parsePost)
    if (!parsed.every((p) => p !== null)) return null
    const bodies = parseBodies(v.content?.[l] ?? {})
    if (!bodies) return null
    posts[l] = parsed
    content[l] = bodies
  }
  return { ...v, posts: { ...v.posts, zh: posts.zh ?? [], en: posts.en ?? [] }, content: { ...v.content, zh: content.zh ?? {}, en: content.en ?? {} } }
}

const parseItem = (v: unknown): v is WorkItem =>
  isRecord(v) && isString(v.id) && fieldsOk(v, ITEM_SPEC) && (v.en === undefined || (isRecord(v.en) && fieldsOk(v.en, { client: 'string', title: 'string' })))

function parseWork(v: unknown): WorkData | null {
  if (!isRecord(v) || !Array.isArray(v.items) || !v.items.every(parseItem)) return null
  if (!fieldsOk(v, { removed: 'strings', meta: 'record', header: 'record', footer: 'record', content: 'record' })) return null
  if (isRecord(v.content) && !LANGS.every((l) => isRecord(v.content) && (v.content[l] === undefined || parseBodies(v.content[l])))) return null
  return v as unknown as WorkData
}

function parseAboutPage(v: unknown): AboutPageData | null {
  if (!isRecord(v) || !parseBody(v.zh) || !(v.en === undefined || parseBody(v.en))) return null
  return v as unknown as AboutPageData
}

const caseOk = (v: unknown) =>
  isRecord(v) &&
  (v.hero === undefined || (isRecord(v.hero) && fieldsOk(v.hero, { image: 'image' }))) &&
  (v.media === undefined || (isRecord(v.media) && fieldsOk(v.media, { fullWidthImage: 'image', inlineImage: 'image' })))

function parseCases(v: unknown): Record<string, CaseAssets> | null {
  return isRecord(v) && Object.values(v).every(caseOk) ? (v as Record<string, CaseAssets>) : null
}

/**
 * Reads data.json. Throws when it is not a JSON object at all. A section in a shape the site cannot read is
 * named in `invalid` and left out, so its page falls back and its editor refuses to save over the real one.
 */
export function parseSiteData(raw: unknown): ParsedSiteData {
  if (!isRecord(raw)) throw new Error('data.json is not an object')
  const data: SiteData = {}
  const invalid: SectionName[] = []
  const read = <K extends SectionName>(key: K, parse: (v: unknown) => SiteData[K] | null) => {
    if (raw[key] === undefined) return
    const parsed = parse(raw[key])
    if (parsed) data[key] = parsed
    else invalid.push(key)
  }
  read('journal', parseJournal)
  read('work', parseWork)
  read('aboutPage', parseAboutPage)
  read('cases', parseCases)
  if (raw.about !== undefined) data.about = raw.about
  return { data, invalid }
}
