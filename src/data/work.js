import siteDefaults from './data.json'
import { projectHref } from '../lib/projectHref.js'

export { projectHref }

export const DEFAULT_WORK = siteDefaults.work
export const WORK_ITEMS = siteDefaults.work.items.map((item) => ({ ...item, caseHref: projectHref(item.caseHref) }))

// The list's title and labels live here, not in R2, so the page can be renamed without touching saved data.
export const PROJECTS_PAGE = {
  zh: { title: 'TEKUEI · Projects', pre: 'SELECTED PROJECTS', heading: 'Projects', countSuffix: 'Projects' },
  en: { title: 'TEKUEI · Projects', pre: 'SELECTED PROJECTS', heading: 'Projects', countSuffix: 'Projects' },
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

export function cloneWorkContent(content = siteDefaults.work) {
  return structuredClone(content)
}

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

/** Overlay CMS image URLs onto the EN work items */
export function mergeWorkImages(enWork, cmsWork) {
  if (!cmsWork?.items) return enWork
  return {
    ...enWork,
    items: enWork.items.map((item, i) => ({
      ...item,
      thumbImage: cmsWork.items[i]?.thumbImage ?? item.thumbImage,
    })),
  }
}

// Client work kept in code, listed after the R2 items. SRE has no case page, so its card links to the live site.
// Copy comes from Wade's CV (src/labs/falling-figure/content.js).
const sre = {
  id: 'sre',
  caseHref: 'https://www.sreglobal.com/',
  titleEm: false,
  title: 'SRE',
  thumbBg: 'linear-gradient(135deg, color-mix(in srgb, var(--surface-2) 96%, transparent) 0%, color-mix(in srgb, var(--surface-1) 88%, transparent) 45%, rgba(16, 15, 17, 0.8) 100%)',
  thumbImage: { url: '' },
}

export const CODE_WORK_ITEMS = {
  zh: [
    {
      ...sre,
      client: 'SRE · 風睿能源',
      subtitle: '官 方 網 站',
      descriptionLines: ['開發風睿能源的官方網站，', '負責技術、架構決策與整合。'],
      tags: ['Web Development', 'Architecture'],
    },
  ],
  en: [
    {
      ...sre,
      client: 'SRE · Synera Renewable Energy',
      subtitle: 'OFFICIAL WEBSITE',
      descriptionLines: ['The official site for Synera Renewable Energy:', 'technology, architecture and delivery.'],
      tags: ['Web Development', 'Architecture'],
    },
  ],
}

export const WORK_LABELS = {
  zh: { loading: '作品載入中' },
  en: { loading: 'Loading work' },
}
