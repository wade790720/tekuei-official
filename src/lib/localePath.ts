import type { Lang } from './siteData.ts'

// Chinese pages live at the root and the same pages in English under /en (/journal/abc and /en/journal/abc).
// A few URLs have only one address: /checkin is registered in the LINE console, a lab's live page is the lab
// page's iframe, and the rest are not pages.
const ONE_URL = /^\/(checkin|labs\/[^/]+\/live|dev\/|sitemap\.xml|llms\.txt|api\/)/

export const langOf = (pathname: string): Lang => (pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'zh')

/** The path without its language: "/en" is "/", "/en/journal" is "/journal". */
export const stripLang = (pathname: string): string => (langOf(pathname) === 'en' ? pathname.slice(3) || '/' : pathname)

/** False for the URLs that have no English address. */
export const hasEnglish = (pathname: string): boolean => !ONE_URL.test(stripLang(pathname))

/**
 * A site path in one language. Paths in src/data and R2 are written without a language; this adds it.
 * Anything that is not a site path (an outside link, mailto:, #top) comes back unchanged.
 */
export function localePath(path: string, lang: Lang): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path
  // "/en//x" would leave "//x", which a browser reads as another host.
  const plain = stripLang(path).replace(/^\/+/, '/')
  if (lang === 'zh' || !hasEnglish(plain)) return plain
  return plain === '/' ? '/en' : plain.startsWith('/?') || plain.startsWith('/#') ? `/en${plain.slice(1)}` : `/en${plain}`
}

/** True when two paths are the same page, in the same or the other language. */
export const samePage = (a: string, b: string): boolean => stripLang(a) === stripLang(b)

/** The same page in the other language, or null when it has only one address. */
export const otherLangPath = (pathname: string): string | null =>
  hasEnglish(pathname) ? localePath(stripLang(pathname), langOf(pathname) === 'en' ? 'zh' : 'en') : null

// React Router matches paths ignoring case, so /EN/Journal would be a second copy of /en/journal. Slugs keep their case.
const FIXED = new Set(['en', 'about', 'journal', 'projects', 'labs', 'live', 'how-to-checkin', 'checkin', 'work', 'cases'])

/** The path a page is served at: no trailing slash, and the site's own words in lower case. */
export const servedPath = (pathname: string): string =>
  pathname
    .replace(/(.)\/+$/, '$1')
    .split('/')
    .map((seg) => (FIXED.has(seg.toLowerCase()) ? seg.toLowerCase() : seg))
    .join('/')
