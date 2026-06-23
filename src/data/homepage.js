import { WORK_ITEMS } from './work.js'

export const HOME_META = {
  zh: {
    title: 'TEKUEI 德溎 — 讓有價值的人，被世界正確看見',
    description: 'TEKUEI 是一套人格品牌系統，協助你從模糊的人設，走向清晰而真實的人格品牌。',
  },
  en: {
    title: 'TEKUEI — Where the Worthy Are Seen by the World',
    description: 'TEKUEI is a personal brand system that guides you from a vague persona to a clear, authentic personal brand.',
  },
}

export const HOME_HERO = {
  zh: {
    label: 'PERSONAL BRAND ARCHITECT',
    headline: ['讓有價值的人', '被世界正確看見'],
    subEn: 'Where presence becomes form.',
    tagline: ['TEKUEI 是一套人格品牌系統，', '協助你從模糊的人設，走向清晰而真實的人格品牌。'],
  },
  en: {
    label: 'PERSONAL BRAND ARCHITECT',
    headline: ['Making the worthy', 'visible to the world'],
    subEn: 'Where presence becomes form.',
    tagline: ['TEKUEI is a personal brand system', 'that guides you from vague persona to authentic presence.'],
  },
}

export const HOME_PHILOSOPHY = {
  zh: {
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
  },
  en: {
    label: 'PHILOSOPHY',
    lines: [
      { text: 'I believe', tone: 'default' },
      { text: 'within each of us', tone: 'default' },
      { text: 'lives a self we have yet to fully become.', tone: 'default' },
      { type: 'divider' },
      { text: 'For most, that self goes unmet —', tone: 'mid' },
      { text: 'consumed by fear, hesitation, and the need to please,', tone: 'mid' },
      { text: 'we end up becoming what the world expects.', tone: 'mid' },
      { type: 'divider' },
      { text: 'A brand is not just reach and exposure.', tone: 'default' },
      { text: 'A true brand allows a person', tone: 'default' },
      { text: 'to see, understand, and dare to become themselves.', tone: 'default' },
      { type: 'divider' },
      { text: 'When a person truly lives from their core,', tone: 'dim' },
      { text: 'the world finds them on its own.', tone: 'dim' },
    ],
    signature: '— W A D E · TEKUEI',
  },
}

export const HOME_WORK = {
  zh: {
    label: 'SELECTED WORK · 精選案例',
    title: ['每一個品牌，', '都是一個人格被看見的過程'],
  },
  en: {
    label: 'SELECTED WORK',
    title: ['Every brand', 'is a person being truly seen.'],
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

export const HOME_APPROACH = {
  zh: {
    label: 'APPROACH · 方法論',
    title: ['系統化梳理後', '讓你看見原本的樣貌'],
    items: [
      {
        num: '01',
        title: ['人格挖掘', 'Identity Discovery'],
        desc: '深度訪談，找到你的核心信念、世界觀、敘事弧，讓你清晰看見自己的特質',
      },
      {
        num: '02',
        title: ['品牌建構', 'Brand Architecture'],
        desc: '從你的性格萃取出品牌手冊、視覺語言、文案風格，每一個細節都是你的延伸',
      },
      {
        num: '03',
        title: ['系統延伸', 'System Extension'],
        desc: '社群、官網、影像，所有對外溝通的介面，都是來自同一個源頭，保持一致的氣質',
      },
    ],
  },
  en: {
    label: 'APPROACH',
    title: ['After systematic clarity —', 'you see yourself as you truly are.'],
    items: [
      {
        num: '01',
        title: ['人格挖掘', 'Identity Discovery'],
        desc: 'A deep interview to surface your core beliefs, worldview, and narrative arc — so you clearly see what makes you distinctly you.',
      },
      {
        num: '02',
        title: ['品牌建構', 'Brand Architecture'],
        desc: 'From your character, we extract a brand manual, visual language, and copywriting style — every detail an extension of who you are.',
      },
      {
        num: '03',
        title: ['系統延伸', 'System Extension'],
        desc: 'Social, website, imagery — every external interface flows from one source, holding one consistent presence.',
      },
    ],
  },
}

export const HOME_QUOTE = {
  zh: {
    lines: ['當你', '成為一個有力量的人時', '現實中可能會有一萬個', '想成為像你一樣的人出現'],
    en: 'Let your strength be a light to others.',
  },
  en: {
    lines: ['When you become', 'a person of true strength,', 'ten thousand others may emerge', 'wanting to carry that same light.'],
    en: 'Let your strength be a light to others.',
  },
}

export const HOME_CTA = {
  zh: {
    label: 'START YOUR BRAND · 開始你的品牌',
    title: ['如果你準備好', '想被世界看見你的光'],
    desc: ['我陪你從模糊走向清晰，從創作走向商業'],
    email: 'tekuei.xx@gmail.com',
  },
  en: {
    label: 'START YOUR BRAND',
    title: ['If you are ready', 'to be seen by the world'],
    desc: ['I walk with you from blur to clarity, from creation to commerce.'],
    email: 'tekuei.xx@gmail.com',
  },
}

export const HOME_FOOTER = {
  zh: {
    tagline: ['讓有價值的人', '被世界正確看見'],
    explore: [
      { label: 'About', href: '/about' },
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
      { label: 'Facebook', href: 'https://www.facebook.com/tekuei.xx' },
    ],
  },
  en: {
    tagline: ['Making the worthy', 'visible to the world'],
    explore: [
      { label: 'About', href: '/about' },
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
      { label: 'Facebook', href: 'https://www.facebook.com/tekuei.xx' },
    ],
  },
}
