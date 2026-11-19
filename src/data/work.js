import siteDefaults from './data.json'

export const DEFAULT_WORK = siteDefaults.work
export const WORK_ITEMS = siteDefaults.work.items

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
  footer: {
    belief: [
      'Building aesthetic language for creators,',
      'so every light reaches where it belongs.',
    ],
    mark: 'T E K U E I · 2 0 2 6',
  },
  items: [
    {
      id: 'matsu-biennial',
      num: '01',
      caseHref: '/cases/matsu-biennial',
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
      caseHref: '/cases/monolab',
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
      caseHref: '/cases/lustre-yellow',
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
