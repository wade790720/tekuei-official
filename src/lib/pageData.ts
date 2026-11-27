import { getDefaultAbout } from '../data/about.ts'
import { getAdjacentPosts, getDefaultJournal, readableJournal } from '../data/journal.ts'
import type { ReadableJournal } from '../data/journal.ts'
import { cloneWork, getDefaultWork } from '../data/work.ts'
import { projectBody, projectLink, publishedWork } from './projectHref.ts'
import { LANGS } from './siteData.ts'
import type { AboutPageData, Body, CaseAssets, Lang, SiteData, WorkData } from './siteData.ts'

// What each page's loader sends: only what the page draws, in both languages, with no drafts. The pages show it
// as it is; only Wade's editor reads the whole section (with drafts) from /api/data.

const eachLang = <T>(f: (lang: Lang) => T): Record<Lang, T> => ({ zh: f('zh'), en: f('en') })

/** The Journal list: every published post's card, no bodies. */
export function journalList(site: SiteData): ReadableJournal {
  const { posts } = readableJournal(site.journal ?? getDefaultJournal())
  return { posts, content: { zh: {}, en: {} } }
}

/** One post with its body, and the posts before and after it for the links at the end. Null for an unknown slug or a draft. */
export function journalPost(site: SiteData, slug: string): ReadableJournal | null {
  const journal = readableJournal(site.journal ?? getDefaultJournal())
  if (!journal.content.zh[slug] || !journal.posts.zh.some((p) => p.slug === slug)) return null
  const shown = new Set([slug])
  for (const lang of LANGS) {
    const { prev, next } = getAdjacentPosts(journal, slug, lang)
    if (prev) shown.add(prev.slug)
    if (next) shown.add(next.slug)
  }
  return {
    posts: eachLang((lang) => journal.posts[lang].filter((p) => shown.has(p.slug))),
    content: eachLang((lang): Record<string, Body> => {
      const body = journal.content[lang][slug]
      return body ? { [slug]: body } : {}
    }),
  }
}

/** The work section as readers see it: the projects that began as code added, drafts left out. */
const readerWork = (site: SiteData): WorkData => publishedWork(cloneWork(site.work ?? getDefaultWork()))

/** The Projects list: the cards, each already pointing where it goes, without the pages' bodies. */
export function projectList(site: SiteData): WorkData {
  const work = readerWork(site)
  return { items: work.items.map((item) => ({ ...item, caseHref: projectLink(item, work) })) }
}

/** A project page: every card (for its number) and this project's body. */
export interface ProjectPageData {
  work: WorkData
  /** The pictures stored for one of the first three cases, whose text is code. */
  assets?: CaseAssets
  found: boolean
}

/** @param isCase  one of the first three cases (CASE_BY_SLUG), whose page is code */
export function projectPage(site: SiteData, slug: string, isCase: boolean): ProjectPageData {
  const work = readerWork(site)
  if (isCase) return { work: { items: work.items }, assets: site.cases?.[slug], found: true }
  // work.content still holds the drafts' bodies: only a published project's body leaves here.
  const found = work.items.some((x) => x.id === slug) && Boolean(projectBody(work, slug, 'zh'))
  const content = eachLang((lang): Record<string, Body> => {
    const body = found && projectBody(work, slug, lang)
    return body ? { [slug]: body } : {}
  })
  return { work: { items: work.items, content }, found }
}

export const aboutPage = (site: SiteData): AboutPageData => site.aboutPage ?? getDefaultAbout()
