import siteDefaults from './data.json'
import { projectBody, projectHref, projectLink, projectTitle } from '../lib/projectHref.js'

export { projectBody, projectHref, projectLink, projectTitle }

export const DEFAULT_WORK = siteDefaults.work
export const WORK_ITEMS = siteDefaults.work.items.map((item) => ({ ...item, caseHref: projectHref(item.caseHref) }))

// The list's title and labels live here, not in R2, so the page can be renamed without touching saved data.
export const PROJECTS_PAGE = {
  zh: { title: 'TEKUEI · Projects', pre: 'PROJECTS · 專案', heading: 'Projects', countSuffix: 'Projects' },
  en: { title: 'TEKUEI · Projects', pre: 'PROJECTS', heading: 'Projects', countSuffix: 'Projects' },
}

// The list is shown in these sections, in this order. A section with no project is left out.
export const PROJECT_SECTIONS = [
  { id: 'web', zh: '網頁', en: 'Web' },
  { id: 'exhibition', zh: '展覽', en: 'Exhibitions' },
  { id: 'side', zh: 'Side Projects', en: 'Side Projects' },
]

// Which section a client project is in, by id: the R2 items carry no type. Labs are always in `side`.
export const PROJECT_TYPES = {
  'matsu-biennial': 'web',
  monolab: 'web',
  'lustre-yellow': 'web',
  sre: 'web',
}

export const getDefaultWork = () => DEFAULT_WORK

export const WORK_EN = {
  meta: { title: 'TEKUEI · Work' },
  header: {
    pre: 'SELECTED WORK',
    title: 'Work',
    countSuffix: 'Projects',
  },
  items: [
    {
      id: 'matsu-biennial',
      num: '01',
      caseHref: '/projects/matsu-biennial',
      client: 'Matsu Biennial · National Matsu Arts Festival',
      title: 'Biennial',
      titleEmWord: 'Matsu',
      titleEm: true,
      subtitle: 'ISLAND ART CURATION',
      descriptionLines: [
        'The 3rd Matsu International Arts Festival —',
        'a digital gateway between island memory and contemporary creation.',
      ],
      tags: ['Web Design', 'Exhibition', 'Art Direction'],
      thumbBg: 'linear-gradient(135deg, color-mix(in srgb, var(--surface-2) 96%, transparent) 0%, color-mix(in srgb, var(--surface-1) 88%, transparent) 45%, rgba(16, 15, 17, 0.8) 100%)',
      thumbSvg: 'matsu',
      thumbImage: { url: '' },
    },
    {
      id: 'monolab',
      num: '02',
      caseHref: '/projects/monolab',
      client: 'MONOLAB · MORAN Interactive Design',
      title: 'MONOLAB',
      titleEm: false,
      subtitle: 'EMOTIONAL ECOSYSTEM · ART FIELD',
      descriptionLines: [
        'An art field co-creating emotional ecosystems —',
        'generative art, immersive experience, and digital art practice.',
      ],
      tags: ['Generative Art', 'Exhibition Curation', 'Immersive Experience'],
      thumbBg: 'linear-gradient(135deg, color-mix(in srgb, var(--surface-2) 96%, transparent) 0%, color-mix(in srgb, var(--surface-1) 88%, transparent) 45%, rgba(16, 15, 17, 0.8) 100%)',
      thumbSvg: 'monolab',
      thumbImage: { url: '' },
    },
    {
      id: 'lustre-yellow',
      num: '03',
      caseHref: '/projects/lustre-yellow',
      client: 'Lustre Yellow · Crystal Art Flowers',
      title: 'Lustre Yellow',
      titleEm: false,
      subtitle: 'BRAND SYSTEM ARCHITECTURE',
      descriptionLines: [
        'A complete brand system for a MADOKA Floral Design Academy instructor —',
        'from story mining and sales page to ad strategy.',
      ],
      tags: ['Brand Identity', 'Sales Page', 'Web Development', 'Ad Strategy'],
      thumbBg: 'linear-gradient(135deg, color-mix(in srgb, var(--surface-2) 96%, transparent) 0%, color-mix(in srgb, var(--surface-1) 88%, transparent) 45%, rgba(16, 15, 17, 0.8) 100%)',
      thumbSvg: 'lustre',
      thumbImage: { url: '' },
    },
  ],
}

const BUNDLED_EN = Object.fromEntries(
  WORK_EN.items.map((i) => [i.id, { client: i.client, title: i.title, titleEmWord: i.titleEmWord ?? '' }]),
)
const filled = (o = {}) => Object.fromEntries(Object.entries(o).filter(([, v]) => v))

/**
 * The work section in one language. A project's English text is its own `en`, written in the edit panel,
 * else the translation bundled here, else the Chinese.
 */
export function localizeWork(work, lang) {
  if (lang !== 'en') return work
  return {
    ...work,
    items: work.items.map((item) => {
      const own = filled(item.en)
      // An English title of its own replaces both halves of the bundled one
      return { ...item, ...BUNDLED_EN[item.id], ...own, ...(own.title ? { titleEmWord: '' } : {}) }
    }),
  }
}

/** What readers see: drafts stay in the editor. */
export const publishedWork = (work) => ({ ...work, items: work.items.filter((item) => !item.draft) })

export const PROJECT_PAGE_LABELS = {
  zh: { home: '首頁', crumbs: '導覽路徑', back: '返回 Projects', notFound: '找不到這個專案', visit: '造訪網站', noPage: '這個專案沒有內頁，卡片直接連到外部連結。在右邊的面板可以建立內頁。', untranslated: 'This project is only in Chinese for now.' },
  en: { home: 'Home', crumbs: 'Breadcrumb', back: 'Back to Projects', notFound: 'Project not found', visit: 'Visit site', noPage: '這個專案沒有內頁，卡片直接連到外部連結。在右邊的面板可以建立內頁。', untranslated: 'This project is only in Chinese for now.' },
}

// Client work that began as code. It joins the saved list, with a short page, until the list has it, so it is
// edited in the panel like any other project; the first save writes it to R2. `removed` remembers one Wade deleted.
// Copy comes from Wade's CV (src/labs/falling-figure/content.js).
const CODE_PROJECTS = [
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
const paragraph = (text) => ({ doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] } })
export const CODE_PROJECT_IDS = CODE_PROJECTS.map((item) => item.id)

export const cloneWork = (work) => {
  const next = structuredClone(work)
  for (const { page, ...item } of CODE_PROJECTS) {
    if (next.items.some((x) => x.id === item.id) || next.removed?.includes(item.id)) continue
    next.items.push(structuredClone(item))
    next.content = {
      zh: { ...next.content?.zh, [item.id]: paragraph(page.zh) },
      en: { ...next.content?.en, [item.id]: paragraph(page.en) },
    }
  }
  return next
}

export const WORK_LABELS = {
  zh: { loading: '作品載入中', draft: '草稿' },
  en: { loading: 'Loading work' },
}
