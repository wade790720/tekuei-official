/**
 * Requests every page of the site from a running server and fails on any 5xx or an unexpected status, Location or
 * title count. Usage: node scripts/checkPages.ts <base URL> [--dev]
 * The list and the expectations live here; a PR that adds or moves a page changes them in the same commit.
 */

interface Expect {
  path: string
  status: number
  /** Where a redirect points, as a path. */
  location?: string
  /** HTML pages carry exactly one <title>; other responses set this to false. */
  html?: boolean
  /** What vite dev answers instead: it serves public/ without applying public/_redirects. */
  dev?: Omit<Expect, 'path' | 'dev'>
}

// Every URL is served by the catch-all route (PR2): unknown slugs and typos still answer 200 and the app shows
// its not-found screen. Later PRs turn those into 404s and the old /cases URLs into 301s.
export const PAGES: Expect[] = [
  { path: '/', status: 200 },
  { path: '/about', status: 200 },
  { path: '/journal', status: 200 },
  { path: '/journal?tag=AI', status: 200 },
  { path: '/journal/respect-the-effort', status: 200 },
  { path: '/journal/no-such-post', status: 200 },
  { path: '/projects', status: 200 },
  { path: '/projects/matsu-biennial', status: 200 },
  { path: '/projects/monolab', status: 200 },
  { path: '/projects/lustre-yellow', status: 200 },
  { path: '/projects/sre', status: 200 },
  { path: '/projects/chaos-experiment', status: 200 },
  { path: '/projects/no-such-project', status: 200 },
  { path: '/labs/living-portrait', status: 200 },
  { path: '/labs/falling-figure', status: 200 },
  { path: '/labs/shatter-footer', status: 200 },
  { path: '/labs/living-portrait/live', status: 200 },
  { path: '/labs/falling-figure/live', status: 200 },
  { path: '/labs/shatter-footer/live', status: 200 },
  { path: '/labs/no-such-lab', status: 200 },
  { path: '/how-to-checkin', status: 200 },
  { path: '/checkin', status: 200 },
  // Old URLs
  { path: '/work', status: 301, location: '/projects', html: false, dev: { status: 200 } },
  { path: '/cases/matsu-biennial', status: 200 },
  { path: '/cases/living-portrait', status: 200 },
  // A typo
  { path: '/jounral', status: 200 },
  // Not pages, but served by the same Worker
  { path: '/sitemap.xml', status: 200, html: false },
  { path: '/llms.txt', status: 200, html: false },
  { path: '/api/data', status: 200, html: false },
  { path: '/api/file/images/no-such-file.png', status: 404, html: false },
  { path: '/robots.txt', status: 200, html: false },
]

const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")

async function check(base: string, url: Expect): Promise<string[]> {
  const page = dev && url.dev ? { ...url, ...url.dev, location: url.dev.location, html: url.dev.html } : url
  const res = await fetch(new URL(page.path, base), { redirect: 'manual' })
  const body = await res.text()
  const raw = res.headers.get('Location')
  const location = raw ? new URL(raw, base).pathname : undefined
  const titles = [...body.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/g)].map((m) => decode(m[1]))
  console.log(`${res.status} ${page.path}${location ? ` -> ${location}` : ''}${titles.length ? `  ${titles.join(' | ')}` : ''}`)

  const problems: string[] = []
  if (res.status >= 500) problems.push(`${page.path}: ${res.status}`)
  if (res.status !== page.status) problems.push(`${page.path}: status ${res.status}, expected ${page.status}`)
  if (location !== page.location) problems.push(`${page.path}: Location ${location}, expected ${page.location}`)
  if (page.html !== false && titles.length !== 1) problems.push(`${page.path}: ${titles.length} <title> elements, expected 1`)
  return problems
}

const [base, mode] = process.argv.slice(2)
const dev = mode === '--dev'
if (!base) {
  console.error('Usage: node scripts/checkPages.ts <base URL> [--dev]')
  process.exit(2)
}
const problems: string[] = []
for (const page of PAGES) problems.push(...(await check(base, page)))
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n${problems.join('\n')}`)
  process.exit(1)
}
console.log(`\nAll ${PAGES.length} URLs as expected.`)
