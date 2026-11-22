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
    name: 'WADE',
    fullName: 'WADE CHU',
    // One entry per line on screen. Wade set the Chinese line breaks.
    motto: [
      '1990 年',
      '出生於台灣新竹',
      '相信理性的美學',
      '可以更加觸動人心、啟發性',
      '為了創造更有價值的事物，',
      '不斷思考學習，探索更好的表達',
    ],
    koiLabel: 'KOI',
    foodLabel: 'FOOD',
    // English in both languages, on purpose: a small joke in the corner, like the counters beside it.
    hint: 'poke the water, the koi are hungry',
    lead: '一個人的工作室 安靜的創作',
    body: '喜愛 滑雪、開發程式、寫寫文章，然後好好的睡一覺',
    keywords: ['滑雪', '開發程式', '寫寫文章'],
  },
  en: {
    ariaLabel: 'Home hero',
    name: 'WADE',
    fullName: 'WADE CHU',
    motto: [
      'Born in 1990',
      'in Hsinchu, Taiwan.',
      'I believe a rational aesthetic',
      'can move people more deeply',
      'and inspire them more.',
      'To make things of greater value,',
      'I keep thinking and learning,',
      'in search of better expression.',
    ],
    koiLabel: 'KOI',
    foodLabel: 'FOOD',
    hint: 'poke the water, the koi are hungry',
    lead: 'A studio of one, making quiet work.',
    body: 'I like skiing, writing code, writing a little, and a good night of sleep.',
    keywords: ['skiing', 'writing code', 'writing a little'],
  },
}

// The same in both languages. The order is Wade's.
const CONTACT = [
  { label: 'X', href: 'https://x.com/tekueichu' },
  { label: 'YouTube' }, // no channel link yet: shown as plain text until Wade gives the address
  { label: 'Facebook', href: 'https://www.facebook.com/tekuei.xx' },
  { label: 'Instagram', href: 'https://www.instagram.com/tekuei.xx' },
  { label: 'tekuei.xx@gmail.com', href: 'mailto:tekuei.xx@gmail.com' },
]

export const HOME_FOOTER = {
  zh: {
    titles: { explore: 'Explore', latest: 'Latest', contact: 'Contact' },
    explore: [
      { label: 'About', href: '/about' },
      { label: 'Work', href: '/work' },
      { label: 'Journal', href: '/journal' },
    ],
    contact: CONTACT,
  },
  en: {
    titles: { explore: 'Explore', latest: 'Latest', contact: 'Contact' },
    explore: [
      { label: 'About', href: '/about' },
      { label: 'Work', href: '/work' },
      { label: 'Journal', href: '/journal' },
    ],
    contact: CONTACT,
  },
}
