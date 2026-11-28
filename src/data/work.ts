import { siteDefaults } from './siteDefaults.ts'
import { localizeWork as localizeIn, projectBody, projectHref, projectLink, projectTitle, publishedWork, withCodeProjects } from '../lib/projectHref.ts'
import type { CodeProject } from '../lib/projectHref.ts'
import { safeHref } from '../lib/richText.ts'
import type { Lang, Localized, ProjectType, WorkData, WorkItem } from '../lib/siteData.ts'

export { projectBody, projectHref, projectLink, projectTitle, publishedWork }

export const DEFAULT_WORK = siteDefaults.work
export const WORK_ITEMS = siteDefaults.work.items.map((item) => ({ ...item, caseHref: projectHref(item.caseHref) }))

// The list's title and labels live here, not in R2, so the page can be renamed without touching saved data.
export const PROJECTS_PAGE = {
  zh: { title: 'TEKUEI · Projects', pre: 'PROJECTS · 專案', heading: 'Projects', countSuffix: 'Projects', description: 'Wade 做過的網站、展覽和個人項目' },
  en: { title: 'TEKUEI · Projects', pre: 'PROJECTS', heading: 'Projects', countSuffix: 'Projects', description: 'Websites, exhibitions and side projects by Wade' },
}

// The list is shown in these sections, in this order. A section with no project is left out.
const SECTION_NAMES: Record<ProjectType, Localized<string>> = {
  web: { zh: '網站', en: 'Websites' },
  exhibition: { zh: '展覽', en: 'Exhibitions' },
  side: { zh: '個人項目', en: 'Side Projects' },
}
export const PROJECT_SECTIONS: ({ id: ProjectType } & Localized<string>)[] = (['web', 'exhibition', 'side'] as const).map((id) => ({
  id,
  ...SECTION_NAMES[id],
}))

/** The section a project is listed in. */
export const projectType = (item: WorkItem): ProjectType => item.type ?? PROJECT_TYPES[item.id] ?? 'web'

/** A project's number on the Projects list, as two digits: section by section, in saved order. */
export const projectNumber = (items: WorkItem[], id: string): string =>
  String(PROJECT_SECTIONS.flatMap((s) => items.filter((x) => projectType(x) === s.id)).findIndex((x) => x.id === id) + 1).padStart(2, '0')

// Which section a client project is in, by id: the R2 items carry no type. Labs are always in `side`.
export const PROJECT_TYPES: Record<string, ProjectType> = {
  'matsu-biennial': 'web',
  monolab: 'web',
  'lustre-yellow': 'web',
  sre: 'web',
}

export const getDefaultWork = (): WorkData => DEFAULT_WORK

const BUNDLED_EN: Record<string, Partial<WorkItem>> = {
  'matsu-biennial': { client: 'Matsu Biennial · National Matsu Arts Festival', title: 'Biennial', titleEmWord: 'Matsu' },
  monolab: { client: 'MONOLAB · MORAN Interactive Design', title: 'MONOLAB', titleEmWord: '' },
  'lustre-yellow': { client: 'Lustre Yellow · Crystal Art Flowers', title: 'Lustre Yellow', titleEmWord: '' },
}
/** The work section in one language, with the translations bundled above for the first cases. */
export const localizeWork = (work: WorkData, lang: Lang): WorkData => localizeIn(work, lang, BUNDLED_EN)

export const PROJECT_PAGE_LABELS = {
  zh: { home: '首頁', crumbs: '導覽路徑', back: '返回 Projects', notFound: '找不到這個專案', visit: '造訪網站', num: 'Project', type: 'Type', client: 'Client', scope: 'Scope', link: 'Link', noPage: '這個專案沒有內頁，卡片直接連到外部連結。在右邊的面板可以建立內頁。', untranslated: 'This project is only in Chinese for now.' },
  en: { home: 'Home', crumbs: 'Breadcrumb', back: 'Back to Projects', notFound: 'Project not found', visit: 'Visit site', num: 'Project', type: 'Type', client: 'Client', scope: 'Scope', link: 'Link', noPage: '這個專案沒有內頁，卡片直接連到外部連結。在右邊的面板可以建立內頁。', untranslated: 'This project is only in Chinese for now.' },
}

/** The site's name alone: a long path does not fit in the fact row. A link that is not a full URL shows as written. */
export function linkLabel(link: string): string {
  try {
    const host = new URL(link).hostname.replace(/^www\./, '')
    if (host) return host
  } catch {
    /* relative, or not a URL at all */
  }
  return link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

/** The row of facts a project's page opens with, read from its card: [label, lines, href?]. Empty ones are left out. */
export type ProjectFact = [label: string, lines: string[], href?: string]
export function projectFacts(item: WorkItem, lang: Lang): ProjectFact[] {
  const t = PROJECT_PAGE_LABELS[lang]
  const link = safeHref(item.link)
  const facts: (ProjectFact | '' | 0 | null | undefined)[] = [
    [t.type, [SECTION_NAMES[projectType(item)][lang]]],
    item.client && [t.client, [item.client]],
    item.tags?.length && [t.scope, item.tags],
    link && [t.link, [linkLabel(link)], link],
  ]
  return facts.filter((f): f is ProjectFact => Array.isArray(f))
}

// Client work that began as code. It joins the saved list, with a short page, until the list has it, so it is
// edited in the panel like any other project; the first save writes it to R2. `removed` remembers one Wade deleted.
// Copy comes from Wade's CV (src/labs/falling-figure/content.ts).
const CODE_PROJECTS: CodeProject[] = [
  {
    id: 'sre',
    type: 'web',
    client: 'SRE · 風睿能源',
    title: 'SRE',
    tags: ['Web Development', 'Architecture'],
    link: 'https://www.sreglobal.com/',
    thumbBg: 'linear-gradient(135deg, color-mix(in srgb, var(--surface-2) 96%, transparent) 0%, color-mix(in srgb, var(--surface-1) 88%, transparent) 45%, rgba(16, 15, 17, 0.8) 100%)',
    thumbImage: { url: '' },
    en: { client: 'SRE · Synera Renewable Energy', title: 'SRE' },
    // The page it starts with. Not a field of the project: it goes to work.content.
    page: {
      zh: '開發風睿能源的官方網站，負責技術、架構決策與整合。',
      en: 'The official site for Synera Renewable Energy: technology, architecture and delivery.',
    },
  },
]
export const CODE_PROJECT_IDS = CODE_PROJECTS.map((item) => item.id)

export const cloneWork = (work: WorkData): WorkData => withCodeProjects(work, CODE_PROJECTS)

export const WORK_LABELS = {
  zh: { draft: '草稿' },
}
