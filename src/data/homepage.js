import { WORK_ITEMS } from './work.js'

export const HOME_META = {
  zh: {
    title: 'TEKUEI 德溎 — 遵循內心並實踐創造',
    description: '探索底層邏輯與真相，對未知領域充滿好奇，喜愛技術、行銷與人工智慧。',
  },
  en: {
    title: 'TEKUEI — Follow Your Heart and Create',
    description: 'Exploring first principles and the truth beneath things. Curious about the unknown. I love technology, marketing and AI.',
  },
}

export const HOME_HERO = {
  zh: {
    ariaLabel: '首頁主視覺',
    headline: ['我寫程式，', '也把過程寫下來。'],
    cta: '看看我的世界',
    aside: ['想法、工具，', '和認真做的', '實驗'],
    latestLabel: '最新文章',
    viewAll: '全部文章',
    loading: '文章載入中',
  },
  en: {
    ariaLabel: 'Home hero',
    headline: ['I write code,', 'and write down the process.'],
    cta: 'Explore my world',
    aside: ['Ideas, tools &', 'thoughtful', 'experiments.'],
    latestLabel: 'Latest writings',
    viewAll: 'View all',
    loading: 'Loading posts',
  },
}

export const HOME_WORK = {
  zh: {
    label: 'SELECTED WORK',
    title: ['精選案例'],
  },
  en: {
    label: 'SELECTED WORK',
    title: ['Selected work'],
  },
}

export const HOME_FEATURED_WORKS = {
  zh: [
    {
      num: '01',
      label: 'CULTURAL BRAND',
      title: 'Matsu Biennial',
      descLines: ['馬祖雙年展', '島嶼文化品牌延伸設計'],
      caseHref: WORK_ITEMS[0].caseHref,
      thumbBg: WORK_ITEMS[0].thumbBg,
      variant: 'alt',
    },
    {
      num: '02',
      label: 'DESIGN STUDIO',
      title: 'MONOLAB',
      descLines: ['設計工作室品牌系統', '視覺識別與數位平台'],
      caseHref: WORK_ITEMS[1].caseHref,
      thumbBg: WORK_ITEMS[1].thumbBg,
      variant: 'alt2',
    },
    {
      num: '03',
      label: 'FULL BRAND IDENTITY',
      title: 'Lustre Yellow',
      descLines: ['Crystal Art Flowers 講師', '全方位品牌與行銷服務'],
      caseHref: WORK_ITEMS[2].caseHref,
      thumbBg: WORK_ITEMS[2].thumbBg,
      variant: 'default',
    },
  ],
  en: [
    {
      num: '01',
      label: 'CULTURAL BRAND',
      title: 'Matsu Biennial',
      descLines: ['Matsu Biennial', 'Island cultural brand extension'],
      caseHref: WORK_ITEMS[0].caseHref,
      thumbBg: WORK_ITEMS[0].thumbBg,
      variant: 'alt',
    },
    {
      num: '02',
      label: 'DESIGN STUDIO',
      title: 'MONOLAB',
      descLines: ['Design studio brand system', 'Visual identity & digital platform'],
      caseHref: WORK_ITEMS[1].caseHref,
      thumbBg: WORK_ITEMS[1].thumbBg,
      variant: 'alt2',
    },
    {
      num: '03',
      label: 'FULL BRAND IDENTITY',
      title: 'Lustre Yellow',
      descLines: ['Crystal Art Flowers instructor', 'Full brand & marketing services'],
      caseHref: WORK_ITEMS[2].caseHref,
      thumbBg: WORK_ITEMS[2].thumbBg,
      variant: 'default',
    },
  ],
}

export const HOME_CTA = {
  zh: {
    label: 'CONTACT',
    title: ['聯絡'],
    email: 'tekuei.xx@gmail.com',
  },
  en: {
    label: 'CONTACT',
    title: ['Contact'],
    email: 'tekuei.xx@gmail.com',
  },
}

export const HOME_FOOTER = {
  zh: {
    titles: { explore: 'Explore', latest: 'Latest', contact: 'Contact' },
    explore: [
      { label: 'About', href: '/about' },
      { label: 'Work', href: '/work' },
      { label: 'Journal', href: '/journal' },
    ],
    contact: [
      { label: 'tekuei.xx@gmail.com', href: 'mailto:tekuei.xx@gmail.com' },
      { label: 'Instagram', href: 'https://www.instagram.com/tekuei.xx' },
      { label: 'Facebook', href: 'https://www.facebook.com/tekuei.xx' },
    ],
  },
  en: {
    titles: { explore: 'Explore', latest: 'Latest', contact: 'Contact' },
    explore: [
      { label: 'About', href: '/about' },
      { label: 'Work', href: '/work' },
      { label: 'Journal', href: '/journal' },
    ],
    contact: [
      { label: 'tekuei.xx@gmail.com', href: 'mailto:tekuei.xx@gmail.com' },
      { label: 'Instagram', href: 'https://www.instagram.com/tekuei.xx' },
      { label: 'Facebook', href: 'https://www.facebook.com/tekuei.xx' },
    ],
  },
}
