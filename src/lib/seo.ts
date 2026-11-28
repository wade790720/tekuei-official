// What search engines and AI readers get besides the page itself: JSON-LD, the preview image, sitemap.xml and
// llms.txt. The pages draw their head with these (PageHead); the resource routes call the last two.

import { getDefaultJournal, postInEnglish, postTags, publishedJournal } from '../data/journal.ts'
import { labLinks } from '../labs/index.ts'
import { localePath } from './localePath.ts'
import { projectInEnglish, projectLink, projectTitle } from './projectHref.ts'
import { SITE_URL } from './siteUrl.ts'
import type { Doc, JournalData, JournalPost, Lang, SiteData, WorkData, WorkItem } from './siteData.ts'

/** A project or lab with a page here, at its own address. */
export type CaseLink = Pick<WorkItem, 'id' | 'client' | 'title' | 'titleEmWord' | 'tags' | 'descriptionLines'> & {
  caseHref: string
  /** False for a project written in the editor whose English body is still empty. */
  english: boolean
}

export const SITE_NAME = 'TEKUEI 德溎'

export const PERSON = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: 'Wade',
  alternateName: 'TEKUEI 德溎',
  url: `${SITE_URL}/about`,
  jobTitle: '軟體工程師、策展人',
  description: '10 年軟體工程師經歷，策劃過 10 餘檔展覽，同時是 MONOLAB 共同創辦人。目前專注記錄日常想法，以及行銷、軟體工程、AI 相關的內容創作。',
  knowsAbout: ['軟體工程', '美學', '設計', '行銷', 'AI'],
}

const SITE_DESCRIPTION = '遵循內心並實踐創造，追求卓越，為熱愛而學習，勇於面對未知與挑戰。'

const IN_LANGUAGE: Record<Lang, string> = { zh: 'zh-Hant', en: 'en' }

/** The address of a site path in one language. */
export const pageUrl = (path: string, lang: Lang): string => {
  const p = localePath(path, lang)
  return p === '/' ? `${SITE_URL}/` : `${SITE_URL}${p}`
}

export interface HeadLinks {
  canonical: string
  /** hreflang and URL */
  alternates: [string, string][]
  /** og:locale, and og:locale:alternate when the page has the other language */
  locale: string
  localeAlternate?: string
}

const OG_LOCALE: Record<Lang, string> = { zh: 'zh_TW', en: 'en_US' }

/**
 * The links that tie a page's two languages together. A page with no English version of its own (its English URL
 * shows the Chinese text) has one page as far as search engines go: both URLs name the Chinese one as canonical and
 * neither names an English version, as the sitemap does.
 * @param english  postInEnglish, projectInEnglish or aboutInEnglish; the same rule the sitemap uses
 */
export function headLinks(path: string, lang: Lang, english: boolean): HeadLinks {
  const zh = pageUrl(path, 'zh')
  if (!english) return { canonical: zh, alternates: [['zh-Hant', zh], ['x-default', zh]], locale: OG_LOCALE.zh }
  const en = pageUrl(path, 'en')
  return {
    canonical: lang === 'en' ? en : zh,
    alternates: [['zh-Hant', zh], ['en', en], ['x-default', zh]],
    locale: OG_LOCALE[lang],
    localeAlternate: OG_LOCALE[lang === 'zh' ? 'en' : 'zh'],
  }
}

/** WebSite and Person, on every page. */
export const siteLd = (lang: Lang) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: pageUrl('/', lang),
      inLanguage: IN_LANGUAGE[lang],
      description: SITE_DESCRIPTION,
      author: { '@id': `${SITE_URL}/#person` },
    },
    PERSON,
  ],
})

// "</script>" inside JSON-LD would end the script tag early.
export const ldJson = (obj: unknown): string => JSON.stringify(obj).replace(/</g, '\\u003c')

/** The journal as the site shows it: R2's copy when it exists, else the bundled default. Drafts never leave here. */
export function siteJournal(r2Data: SiteData | null): JournalData {
  return publishedJournal(r2Data?.journal ?? getDefaultJournal())
}

export const isoDate = (d: string | undefined): string => String(d ?? '').replace(/\./g, '-')

// Social sites fetch the preview image themselves, so it needs a full URL. An inline data: picture is not one.
export const imageUrl = (src: unknown) => (typeof src === 'string' && /^(https?:|\/)/.test(src) ? new URL(src, SITE_URL).href : undefined)

/** The first picture in a doc: an image card, a picture set's first slide, or a video's poster. */
export function firstImage(node: Doc): string | undefined {
  const a = node.attrs ?? {}
  const own = node.type === 'imageCard' ? a.src : node.type === 'slidesCard' ? a.slides?.[0]?.src : node.type === 'videoCard' ? a.poster : undefined
  if (imageUrl(own)) return imageUrl(own)
  for (const kid of node.content ?? []) {
    const found = firstImage(kid)
    if (found) return found
  }
  return undefined
}

export function postLd(post: JournalPost, lang: Lang, url: string, image: string | undefined) {
  const tags = postTags(post)
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: isoDate(post.date),
    dateModified: isoDate(post.updated || post.date),
    ...(image ? { image } : {}),
    inLanguage: IN_LANGUAGE[lang],
    url,
    mainEntityOfPage: url,
    author: PERSON,
    publisher: PERSON,
    ...(tags.length ? { articleSection: tags[0], keywords: tags.join(', ') } : {}),
  }
}

/** @param posts  as readers see them: an untranslated English post is listed at its Chinese URL */
export function blogLd(meta: { title: string; description: string }, posts: (JournalPost & { untranslated?: boolean })[], lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: meta.title,
    description: meta.description,
    url: pageUrl('/journal', lang),
    inLanguage: IN_LANGUAGE[lang],
    author: PERSON,
    blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: pageUrl(`/journal/${p.slug}`, p.untranslated ? 'zh' : lang), datePublished: isoDate(p.date) })),
  }
}

export function creativeWorkLd(page: { name: string; description: string | undefined; url: string; tags?: string[] }, lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: page.name,
    description: page.description,
    inLanguage: IN_LANGUAGE[lang],
    url: page.url,
    mainEntityOfPage: page.url,
    creator: PERSON,
    ...(page.tags?.length ? { keywords: page.tags.join(', ') } : {}),
  }
}

/** @param cases  `english` false (projectInEnglish): listed at its Chinese URL, which is its canonical */
export function collectionLd(meta: { title: string; description: string }, cases: { name: string; href: string; english: boolean }[], lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: meta.title,
    description: meta.description,
    url: pageUrl('/projects', lang),
    inLanguage: IN_LANGUAGE[lang],
    author: PERSON,
    hasPart: cases.map((w) => ({ '@type': 'CreativeWork', name: w.name, url: pageUrl(w.href, w.english ? lang : 'zh') })),
  }
}

export const profileLd = (lang: Lang) => ({
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  url: pageUrl('/about', lang),
  inLanguage: IN_LANGUAGE[lang],
  mainEntity: PERSON,
})

/**
 * Pages for sitemap and llms.txt: the client cases (R2 work items, at their /projects links), then the labs.
 * @param work  the work section the items came from, so a project with a page written in the editor is found
 */
export const siteCases = (workItems: WorkItem[], work?: WorkData, lang: Lang = 'zh'): CaseLink[] => [
  ...workItems
    .filter((w) => !w.draft)
    .map((w) => ({ ...w, caseHref: projectLink(w, work), english: projectInEnglish(work, w.id) }))
    // A card that only links to another site has no page here
    .filter((w) => w.caseHref.startsWith('/')),
  ...labLinks(lang).map((l) => ({ ...l, english: true })),
]

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const esc = (s: unknown): string => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c])

interface SitemapPage {
  path: string
  lastmod?: string
  /** The page has an English version of its own (an untranslated one points search engines at the Chinese). */
  english: boolean
}

/** One <url> per address, each naming the other language (Google: every language version lists all of them). */
export function sitemapXml(journal: JournalData, cases: CaseLink[], aboutEnglish: boolean): string {
  const pages: SitemapPage[] = [
    { path: '/', english: true },
    { path: '/journal', english: true },
    { path: '/projects', english: true },
    { path: '/about', english: aboutEnglish },
    ...journal.posts.zh.map((p) => ({ path: `/journal/${p.slug}`, lastmod: isoDate(p.updated || p.date), english: postInEnglish(journal, p.slug) })),
    ...cases.map((w) => ({ path: w.caseHref, english: w.english })),
  ]
  const urls = pages.flatMap((page) => {
    const zh = pageUrl(page.path, 'zh')
    const en = pageUrl(page.path, 'en')
    const links =
      `<xhtml:link rel="alternate" hreflang="zh-Hant" href="${esc(zh)}"/>` +
      (page.english ? `<xhtml:link rel="alternate" hreflang="en" href="${esc(en)}"/>` : '') +
      `<xhtml:link rel="alternate" hreflang="x-default" href="${esc(zh)}"/>`
    const lastmod = page.lastmod ? `<lastmod>${esc(page.lastmod)}</lastmod>` : ''
    return (page.english ? [zh, en] : [zh]).map((loc) => `<url><loc>${esc(loc)}</loc>${lastmod}${links}</url>`)
  })
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>`
  )
}

/**
 * llms.txt (llmstxt.org): a Markdown map of the site for AI readers, the Chinese pages and then the English ones.
 * @param enCases  siteCases in English
 */
export function llmsTxt(journal: JournalData, cases: CaseLink[], enCases: CaseLink[], aboutEnglish: boolean): string {
  const english = journal.posts.en.filter((p) => postInEnglish(journal, p.slug))
  return [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    `Wade：${PERSON.description}`,
    '',
    `主題：${PERSON.knowsAbout.join('、')}`,
    '',
    '## Journal',
    ...journal.posts.zh.map((p) => `- [${p.title}](${pageUrl(`/journal/${p.slug}`, 'zh')}): ${p.excerpt}`),
    '',
    '## Projects',
    ...cases.map((w) => `- [${projectTitle(w)}](${pageUrl(w.caseHref, 'zh')}): ${w.client}`),
    '',
    '## Pages',
    `- [About](${pageUrl('/about', 'zh')})`,
    '',
    '## English',
    '',
    '### Journal',
    ...english.map((p) => `- [${p.title}](${pageUrl(`/journal/${p.slug}`, 'en')}): ${p.excerpt}`),
    '',
    '### Projects',
    ...enCases.filter((w) => w.english).map((w) => `- [${projectTitle(w)}](${pageUrl(w.caseHref, 'en')}): ${w.client}`),
    '',
    ...(aboutEnglish ? ['### Pages', `- [About](${pageUrl('/about', 'en')})`, ''] : []),
  ].join('\n')
}

// Old links that are already in search indexes: the two labs went to /labs/, every other case to /projects/.
export const MOVED: Record<string, string> = {
  '/cases/living-portrait': '/labs/living-portrait',
  '/cases/falling-figure': '/labs/falling-figure',
}
