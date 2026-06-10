import { WORK_ITEMS } from './works.js'

export const HOME_META = {
  title: 'TEKUEI 德溎 — 讓有價值的人，被世界正確看見',
  description:
    'TEKUEI 是一套人格品牌系統，協助你從模糊的人設，走向清晰而真實的人格品牌。',
}

export const HOME_HERO = {
  label: 'PERSONAL BRAND ARCHITECT',
  headline: ['讓有價值的人', '被世界正確看見'],
  subEn: 'Where presence becomes form.',
  tagline: [
    'TEKUEI 是一套人格品牌系統，',
    '協助你從模糊的人設，走向清晰而真實的人格品牌。',
  ],
}

export const HOME_PHILOSOPHY = {
  label: 'PHILOSOPHY · 品牌宣言',
  lines: [
    { text: '我相信，', tone: 'default' },
    { text: '每個人心裡，', tone: 'default' },
    { text: '都有一個尚未真正活出來的自己', tone: 'default' },
    { type: 'divider' },
    { text: '而大部分人的遺憾，', tone: 'mid' },
    { text: '是因為恐懼、猶豫、迎合、與自我懷疑，', tone: 'mid' },
    { text: '最終活成了世界期待的樣子。', tone: 'mid' },
    { type: 'divider' },
    { text: '品牌，不只是曝光流量', tone: 'default' },
    { text: '真正的品牌，是讓一個人', tone: 'default' },
    { text: '開始看見自己、理解自己、勇敢成為自己', tone: 'default' },
    { type: 'divider' },
    { text: '當一個人真正活出自己的核心，', tone: 'dim' },
    { text: '世界自然會看見他。', tone: 'dim' },
  ],
  signature: '— 德 溎 · TEKUEI',
}

export const HOME_WORK = {
  label: 'SELECTED WORK · 精選案例',
  title: ['每一個品牌，', '都是一個人格被看見的過程。'],
}

/** 精選案例：順序與 works.js 一致，文案取自 homepage 稿 */
export const HOME_FEATURED_WORKS = [
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
]

export const HOME_APPROACH = {
  label: 'APPROACH · 方法論',
  title: ['不是包裝你，', '是讓你被看見原本的樣子。'],
  items: [
    {
      num: '01',
      title: ['人格挖掘', 'Identity Discovery'],
      desc:
        '深度訪談，找到你的核心信念、worldview、敘事弧。不是「定位」，是讓你第一次真正看見自己。',
    },
    {
      num: '02',
      title: ['品牌建構', 'Brand Architecture'],
      desc:
        '從靈魂層長出品牌手冊、視覺語言、文案風格。每一個細節都是你的延伸，不是公版套用。',
    },
    {
      num: '03',
      title: ['系統延伸', 'System Extension'],
      desc:
        '社群、官網、影像，所有對外溝通的介面，都從同一個源頭長出來，保持一致的氣質。',
    },
  ],
}

export const HOME_QUOTE = {
  lines: [
    '當你成為一個有力量的角色，',
    '現實裡會有一萬個人，',
    '想跟你擁有一樣的能量。',
  ],
  en: 'Let your power be the proof.',
}

export const HOME_CTA = {
  label: 'START YOUR BRAND · 開始你的品牌',
  title: ['如果你準備好', '被世界正確看見'],
  desc: [
    'TEKUEI 不是顧問服務，是一段旅程。',
    '我陪你從模糊走向清晰，從表演走向真實。',
  ],
  email: 'hello@tekuei.com',
}

export const HOME_FOOTER = {
  tagline: ['讓有價值的人', '被世界正確看見'],
  explore: [
    { label: 'About', href: '#about' },
    { label: 'Work', href: '#work' },
    { label: 'Approach', href: '#approach' },
  ],
  services: [
    'Personal Brand Discovery',
    'Brand Manual',
    'Social Visual Extension',
    'Website Design',
  ],
  contact: [
    { label: 'tekuei.xx@gmail.com', href: 'mailto:tekuei.xx@gmail.com' },
    { label: 'Instagram', href: 'https://www.instagram.com/tekuei.xx' },
    { label: 'Threads', href: 'https://www.facebook.com/tekuei.xx' },
  ],
}
