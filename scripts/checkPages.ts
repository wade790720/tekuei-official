/**
 * Requests every page of the site, in Chinese and in English, from a running server and fails on any 5xx or an
 * unexpected status, Location, Cache-Control, <html lang> or head (one title, a canonical, the hreflang links,
 * og:image, JSON-LD that parses). It requests every address in sitemap.xml and llms.txt, and reads /api/data to
 * check that a published post's title and first paragraph are in its HTML and that no draft shows up anywhere.
 * Usage: node scripts/checkPages.ts <base URL> [--r2=broken|missing]
 *   --r2=broken   the local bucket's data.json is not valid JSON: every page that reads R2 answers 503
 *   --r2=missing  the local bucket has no data.json: those pages draw the bundled defaults (200)
 * The list and the expectations live here; a PR that adds or moves a page changes them in the same commit.
 */
import { publishedJournal, readableJournal } from '../src/data/journal.ts'
import { docText, getDoc } from '../src/lib/richText.ts'
import { parseSiteData } from '../src/lib/siteData.ts'
import type { Doc, SiteData } from '../src/lib/siteData.ts'

interface Expect {
  path: string
  status: number
  /** Where a redirect points, as a path. */
  location?: string
  /** HTML pages carry exactly one <title>; other responses set this to false. */
  html?: boolean
  /** The page reads R2: 503 when R2 is broken. */
  r2?: boolean
  /** Only one URL: no /en counterpart. */
  oneUrl?: boolean
  /** The status with no data.json in the bucket, when it differs: the page exists only in R2. */
  missing?: number
}

// Each of these is requested as it is and, unless oneUrl, under /en with the same expectations.
const PAGES: Expect[] = [
  { path: '/', status: 200 },
  { path: '/about', status: 200, r2: true },
  { path: '/journal', status: 200, r2: true },
  { path: '/journal?tag=AI', status: 200, r2: true },
  { path: '/journal/respect-the-effort', status: 200, r2: true, missing: 404 },
  { path: '/journal/no-such-post', status: 404, r2: true },
  { path: '/projects', status: 200, r2: true },
  { path: '/projects/matsu-biennial', status: 200, r2: true },
  { path: '/projects/monolab', status: 200, r2: true },
  { path: '/projects/lustre-yellow', status: 200, r2: true },
  { path: '/projects/sre', status: 200, r2: true },
  { path: '/projects/chaos-experiment', status: 200, r2: true, missing: 404 },
  { path: '/projects/no-such-project', status: 404, r2: true },
  { path: '/labs/living-portrait', status: 200 },
  { path: '/labs/falling-figure', status: 200 },
  { path: '/labs/shatter-footer', status: 200 },
  { path: '/labs/no-such-lab', status: 404 },
  { path: '/labs/constructor', status: 404 },
  { path: '/how-to-checkin', status: 200 },
  { path: '/labs/living-portrait/live', status: 200, oneUrl: true },
  { path: '/labs/falling-figure/live', status: 200, oneUrl: true },
  { path: '/labs/shatter-footer/live', status: 200, oneUrl: true },
  { path: '/checkin', status: 200, oneUrl: true },
  // Old URLs
  { path: '/work', status: 301, location: '/projects', html: false },
  { path: '/cases/matsu-biennial', status: 301, location: '/projects/matsu-biennial', html: false },
  { path: '/cases/living-portrait', status: 301, location: '/labs/living-portrait', html: false },
  { path: '/journal/', status: 301, location: '/journal', html: false },
  // The site's own words in another case: one URL each
  { path: '/EN/Journal', status: 301, location: '/en/journal', html: false, oneUrl: true },
  { path: '/Projects/matsu-biennial', status: 301, location: '/projects/matsu-biennial', html: false, oneUrl: true },
  // A typo
  { path: '/jounral', status: 404 },
  // Not pages, but served by the same Worker
  { path: '/sitemap.xml', status: 200, html: false, oneUrl: true, r2: true },
  { path: '/llms.txt', status: 200, html: false, oneUrl: true, r2: true },
  { path: '/api/data', status: 200, html: false, oneUrl: true },
  { path: '/api/file/images/no-such-file.png', status: 404, html: false, oneUrl: true },
  { path: '/robots.txt', status: 200, html: false, oneUrl: true },
]

const REVALIDATE = 'public, max-age=0, must-revalidate'
const SITE = 'https://tekuei.com'
// sitemap.xml and llms.txt, which crawlers read now and then
const FILE_CACHE = 'public, max-age=3600'

const english = (page: Expect): Expect => {
  const en = (p: string) => (p === '/' ? '/en' : `/en${p}`)
  return { ...page, path: en(page.path), location: page.location && en(page.location) }
}
const HTML = [...PAGES, ...PAGES.filter((p) => !p.oneUrl).map(english), { path: '/en/', status: 301, location: '/en', html: false }]
// The data a client-side navigation fetches carries the same status and Cache-Control as the page.
const DATA = HTML.filter((p) => p.r2 && p.html !== false && !p.path.includes('?')).map((p) => ({ ...p, path: `${p.path}.data`, html: false }))
const ALL = [...HTML, ...DATA]

const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
/** The text a reader sees: no scripts (the loader data is in one), no tags. */
const visibleText = (html: string) => decode(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ''))

const [base, ...flags] = process.argv.slice(2)
const r2 = flags.find((f) => f.startsWith('--r2='))?.slice(5)
if (!base || (r2 && r2 !== 'broken' && r2 !== 'missing')) {
  console.error('Usage: node scripts/checkPages.ts <base URL> [--r2=broken|missing]')
  process.exit(2)
}

const pages = new Map<string, string>()
async function check(url: Expect): Promise<string[]> {
  let page = url
  if (r2 === 'broken' && url.r2) page = { ...url, status: 503 }
  if (r2 === 'missing' && url.path.endsWith('/api/data')) page = { ...url, status: 404 }
  if (r2 === 'missing' && url.missing) page = { ...url, status: url.missing }
  const res = await fetch(new URL(page.path, base), { redirect: 'manual' })
  const body = await res.text()
  if (page.html !== false || /\.(data|xml|txt)$/.test(page.path)) pages.set(page.path, body)
  const raw = res.headers.get('Location')
  const location = raw ? new URL(raw, base).pathname : undefined
  const cache = res.headers.get('Cache-Control')
  const titles = [...body.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/g)].map((m) => decode(m[1]))
  const lang = body.match(/<html[^>]*\slang="([^"]+)"/)?.[1]
  console.log(`${res.status} ${page.path}${location ? ` -> ${location}` : ''}${cache ? ` [${cache}]` : ''}${titles.length ? `  ${titles.join(' | ')}` : ''}`)

  const problems: string[] = []
  if (res.status >= 500 && page.status < 500) problems.push(`${page.path}: ${res.status}`)
  if (res.status !== page.status) problems.push(`${page.path}: status ${res.status}, expected ${page.status}`)
  if (location !== page.location) problems.push(`${page.path}: Location ${location}, expected ${page.location}`)
  if (page.html !== false) {
    if (titles.length !== 1) problems.push(`${page.path}: ${titles.length} <title> elements, expected 1`)
    const wantLang = page.path === '/en' || page.path.startsWith('/en/') ? 'en' : 'zh-Hant'
    if (!page.oneUrl && lang !== wantLang) problems.push(`${page.path}: <html lang="${lang}">, expected ${wantLang}`)
    if (res.status === 200) problems.push(...headProblems(page, body))
  }
  // Pages that read R2 are checked again on every visit when they are fine, never stored when missing or failing.
  if (page.r2) {
    const fine = /\.(xml|txt)$/.test(page.path) ? FILE_CACHE : REVALIDATE
    const want = res.status === 200 ? fine : 'no-store'
    if (cache !== want) problems.push(`${page.path}: Cache-Control ${cache}, expected ${want}`)
  }
  return problems
}

const attr = (tag: string, name: string) => decode(tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'))?.[1] ?? '')
const tagsOf = (head: string, pattern: RegExp) => [...head.matchAll(pattern)].map((m) => m[0])

/**
 * The head a search engine reads: a canonical (the page itself, or the Chinese page for an English page that still
 * shows the Chinese text), hreflang for both languages and x-default unless the page has one URL, og:image, a
 * description, and JSON-LD that parses.
 */
function headProblems(page: Expect, html: string): string[] {
  const problems: string[] = []
  const head = html.slice(0, html.indexOf('</head>'))
  const path = page.path.split('?')[0]
  const self = `${SITE}${path}`
  const zh = `${SITE}${path === '/en' ? '/' : path.replace(/^\/en(?=\/)/, '')}`
  const canonicals = tagsOf(head, /<link[^>]*rel="canonical"[^>]*>/g).map((t) => attr(t, 'href'))
  const alternates = new Map(tagsOf(head, /<link[^>]*rel="alternate"[^>]*>/g).map((t) => [attr(t, 'hreflang'), attr(t, 'href')]))
  if (canonicals.length !== 1) problems.push(`${page.path}: ${canonicals.length} canonical links, expected 1`)
  const canonical = canonicals[0]
  const chineseOnly = path.startsWith('/en') && canonical === zh
  if (canonical !== self && !chineseOnly) problems.push(`${page.path}: canonical ${canonical}, expected ${self}`)
  if (page.oneUrl) {
    if (alternates.size) problems.push(`${page.path}: hreflang on a page with one URL`)
  } else {
    const en = `${SITE}${path.startsWith('/en') ? path : path === '/' ? '/en' : `/en${path}`}`
    const want: [string, string | undefined][] = [['zh-Hant', zh], ['en', chineseOnly ? undefined : en], ['x-default', zh]]
    for (const [lang, href] of want) if (alternates.get(lang) !== href) problems.push(`${page.path}: hreflang ${lang} ${alternates.get(lang)}, expected ${href}`)
    if (alternates.size !== (chineseOnly ? 2 : 3)) problems.push(`${page.path}: ${alternates.size} hreflang links`)
  }
  if (tagsOf(head, /<meta[^>]*property="og:image"[^>]*>/g).length !== 1) problems.push(`${page.path}: not one og:image`)
  if (tagsOf(head, /<meta[^>]*name="description"[^>]*>/g).length !== 1) problems.push(`${page.path}: not one description`)
  const lds = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  if (!lds.length) problems.push(`${page.path}: no JSON-LD`)
  for (const [, json] of lds) {
    try {
      JSON.parse(json)
    } catch {
      problems.push(`${page.path}: JSON-LD does not parse`)
    }
  }
  return problems
}

/** Every address listed in sitemap.xml and llms.txt answers 200 here. */
async function checkListed(): Promise<string[]> {
  const listed = new Set<string>()
  for (const file of ['/sitemap.xml', '/llms.txt']) {
    for (const [url] of (pages.get(file) ?? '').matchAll(/https:\/\/tekuei\.com[^\s<>")]*/g)) listed.add(url.slice(SITE.length) || '/')
  }
  const problems: string[] = []
  for (const path of listed) {
    const res = await fetch(new URL(path, base), { redirect: 'manual' })
    await res.body?.cancel()
    if (res.status !== 200) problems.push(`${path} is listed in sitemap.xml or llms.txt but answers ${res.status}`)
  }
  console.log(`\nListed: ${listed.size} addresses in sitemap.xml and llms.txt, each requested.`)
  return problems
}

/** A published post's title and first paragraph are in its HTML, and no draft appears anywhere. */
async function checkContent(site: SiteData): Promise<string[]> {
  const problems: string[] = []
  const journal = site.journal
  const post = journal && publishedJournal(journal).posts.zh[0]
  if (journal && post) {
    const html = await (await fetch(new URL(`/journal/${post.slug}`, base))).text()
    const doc = getDoc(journal.content.zh[post.slug])
    const first = (doc.content ?? []).map((n: Doc) => docText(n).trim()).find(Boolean)
    const text = visibleText(html)
    if (!text.includes(post.title)) problems.push(`/journal/${post.slug}: title "${post.title}" not in the HTML`)
    if (first && !text.includes(first)) problems.push(`/journal/${post.slug}: first paragraph not in the HTML`)
    console.log(`\nPost body: /journal/${post.slug} has its title and first paragraph (${first?.length ?? 0} characters).`)
  }

  // A draft's title may also be written in a published post (an excerpt that names a draft project): skip those.
  const work = site.work
  const published = JSON.stringify([readableJournal(journal ?? { posts: { zh: [], en: [] }, content: { zh: {}, en: {} } }), work?.items.filter((i) => !i.draft)])
  const drafts = [
    ...[...(journal?.posts.zh ?? []), ...(journal?.posts.en ?? [])].filter((p) => p.draft).flatMap((p) => [p.slug, p.title]),
    ...(work?.items ?? []).filter((i) => i.draft).flatMap((i) => [i.id, i.title ?? '']),
  ].filter((s) => s && !published.includes(s))
  for (const [path, html] of pages) {
    for (const marker of new Set(drafts)) if (html.includes(marker)) problems.push(`${path}: shows the draft "${marker}"`)
  }
  console.log(`Drafts: ${new Set(drafts).size} draft slugs and titles looked for in ${pages.size} pages, their loader data, sitemap.xml and llms.txt.`)
  return problems
}

const problems: string[] = []
for (const page of ALL) problems.push(...(await check(page)))
if (r2 !== 'broken') problems.push(...(await checkListed()))
if (!r2) {
  const res = await fetch(new URL('/api/data', base))
  problems.push(...(await checkContent(parseSiteData(await res.json()).data)))
}
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n${problems.join('\n')}`)
  process.exit(1)
}
console.log(`\nAll ${ALL.length} URLs as expected.`)
