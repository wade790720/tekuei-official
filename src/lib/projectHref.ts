import { hasBody, safeHref } from './richText.ts'
import type { Body, Lang, Localized, WorkData, WorkItem } from './siteData.ts'

// Case pages moved from /cases/<slug> to /projects/<slug>. R2 and data.json still store the old links.
export function projectHref(href: string): string
export function projectHref(href: string | undefined): string | undefined
export function projectHref(href: string | undefined) {
  return typeof href === 'string' ? href.replace(/^\/cases\//, '/projects/') : href
}

export const projectTitle = (item: Pick<WorkItem, 'titleEmWord' | 'title'>): string => [item.titleEmWord, item.title].filter(Boolean).join(' ')

/** A project's page body in one language, or null: the first three cases have pages written in code instead. */
export const projectBody = (work: WorkData | undefined, id: string, lang: Lang): Body | null => work?.content?.[lang]?.[id] ?? null

/** The project has an English version of its own: a case written in code always does, a page written in the editor once its English body is. */
export const projectInEnglish = (work: WorkData | undefined, id: string): boolean =>
  !projectBody(work, id, 'zh') || hasBody(projectBody(work, id, 'en'))

/**
 * Where a project's card goes: its own page when it has one, written in code or in the editor.
 * Only a project with no page goes straight to its outside link.
 * @param work  the work section, for the pages written in the editor
 */
export function projectLink(item: WorkItem, work?: WorkData): string {
  const link = safeHref(item.link)
  if (link && !item.caseHref && !projectBody(work, item.id, 'zh')) return link
  return safeHref(projectHref(item.caseHref)) ?? `/projects/${item.id}`
}

/** The English fields written in the edit panel, without the empty ones. */
function ownEnglish(item: WorkItem): Partial<WorkItem> {
  const own: Partial<WorkItem> = {}
  if (item.en?.client) own.client = item.en.client
  if (item.en?.title) own.title = item.en.title
  return own
}

/**
 * The work section in one language. A project's English text is its own `en`, written in the edit panel,
 * else the bundled translation, else the Chinese.
 * @param bundledEn  English fields of the first cases, by id
 */
export function localizeWork(work: WorkData, lang: Lang, bundledEn: Record<string, Partial<WorkItem>> = {}): WorkData {
  if (lang !== 'en') return work
  return {
    ...work,
    items: work.items.map((item) => {
      const own = ownEnglish(item)
      // An English title of its own replaces both halves of the bundled one
      return { ...item, ...bundledEn[item.id], ...own, ...(own.title ? { titleEmWord: '' } : {}) }
    }),
  }
}

/** What readers see: drafts stay in the editor. */
export const publishedWork = (work: WorkData): WorkData => ({ ...work, items: work.items.filter((item) => !item.draft) })

const paragraph = (text: string): Body => ({ doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] } })

/** A project that began as code, with the text its page starts with. */
export type CodeProject = WorkItem & { page: Localized<string> }

/**
 * A copy of the work section with the projects that began as code. One the list lacks is added, unless
 * `removed` says Wade deleted it. One the list has but with no page gets its starting page. Running it
 * again changes nothing, so it is safe on every load.
 * @param codeProjects  `page` goes to work.content, not to the item
 */
export function withCodeProjects(work: WorkData, codeProjects: CodeProject[]): WorkData {
  const next = structuredClone(work)
  for (const { page, ...item } of codeProjects) {
    if (next.removed?.includes(item.id)) continue
    if (!next.items.some((x) => x.id === item.id)) next.items.push(structuredClone(item))
    if (projectBody(next, item.id, 'zh')) continue
    next.content = {
      zh: { ...next.content?.zh, [item.id]: paragraph(page.zh) },
      en: { ...next.content?.en, [item.id]: paragraph(page.en) },
    }
  }
  return next
}
