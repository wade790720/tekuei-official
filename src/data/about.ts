// The About page. Its body lives in R2 data.json under `aboutPage` ({ zh: { doc }, en: { doc } }) and is
// edited in place like a Journal post. This file is only the default before R2 has one.
// Not `about`: that key still holds the old About copy, and a save would replace it.
// Facts come from Wade's CV (src/labs/falling-figure/content.ts). Lines in 【】 are placeholders.
import { hasBody } from '../lib/richText.ts'
import type { AboutPageData, Doc } from '../lib/siteData.ts'

export const ABOUT_META = {
  zh: { title: 'About', documentTitle: 'About · TEKUEI 德溎', clients: '合作過的單位' },
  en: { title: 'About', documentTitle: 'About · TEKUEI', clients: 'Worked with' },
}

// Two rows for the two marquees. Source: Wade's CV. Neighbours alternate between wide wordmarks, compact
// marks and Chinese lettering, so no stretch of the moving row is much heavier than the next.
// `logo` is a file in src/assets/about/clients/, found online (Wikimedia Commons, Simple Icons, the
// organisation's own site or Facebook page, or an exhibition page); without one the name is shown.
// A client with no `en` name is left out of the English page unless it has a logo. `height` (px) evens out
// logos that look small at the default 32px, such as round or square marks.
export const ABOUT_CLIENTS = [
  [
    { zh: 'LG', en: 'LG', logo: 'lg.svg', height: 40 },
    { zh: '星巴克', en: 'Starbucks', logo: 'starbucks.svg', height: 44 },
    { zh: '文策院', en: 'TAICCA', logo: 'taicca.svg' },
    { zh: '左腦創意', en: 'Left Brain', logo: 'left-brain.svg', height: 40 },
    { zh: 'AMBI', en: 'AMBI', logo: 'ambi.svg' },
    { zh: '知識衛星', en: 'SAT. Knowledge', logo: 'sat.svg', height: 40 },
    { zh: '交大', en: 'NYCU', logo: 'nycu.svg' },
    { zh: 'BenQ', en: 'BenQ', logo: 'benq.svg' },
  ],
  [
    { zh: '藝高', en: 'Yigao', logo: 'yigao.svg' },
    { zh: '風睿能源', en: 'SRE', logo: 'sre.svg' },
    { zh: 'Tempo House', en: 'Tempo House', logo: 'tempo-house.svg', height: 40 },
    { zh: '友達', en: 'AUO', logo: 'auo.svg' },
    { zh: '公視', en: 'PTS', logo: 'pts.svg' },
    { zh: 'GQ', en: 'GQ', logo: 'gq.svg' },
    { zh: '統一', en: 'Uni-President', logo: 'uni-president.svg' },
  ],
]

const text = (t: string): Doc[] => [{ type: 'text', text: t }]
const link = (t: string, href: string): Doc => ({ type: 'text', text: t, marks: [{ type: 'link', attrs: { href } }] })
const p = (t: string): Doc => ({ type: 'paragraph', content: text(t) })
const lead = (t: string): Doc => ({ type: 'lead', content: text(t) })
const h2 = (t: string): Doc => ({ type: 'heading', attrs: { level: 2 }, content: text(t) })
const list = (items: string[]): Doc => ({ type: 'bulletList', content: items.map((t) => ({ type: 'listItem', content: [p(t)] })) })
const doc = (...content: Doc[]): { doc: Doc } => ({ doc: { type: 'doc', content } })

const DEFAULT_ABOUT: AboutPageData = {
  zh: doc(
    lead('我是朱德溎（Wade），寫了十年程式，也策劃過十場以上的展覽。我幫品牌和團隊把想法做成網站、展覽和互動體驗。'),
    p('【照片：在這一行按「+」插入圖片，然後刪掉這一行】'),
    h2('現在'),
    p('我在 TEKUEI 德溎寫文章，記錄行銷、AI、技術和實作的過程，同時接網站、互動體驗和策展的案子。'),
    h2('我能幫你做什麼'),
    list([
      '網站：從架構、設計到上線，例如馬祖國際藝術島第三屆和 SRE 風睿能源的官方網站。',
      '展覽與互動體驗：故事腳本、動線設計，整合影像、燈光、投影和硬體，一路做到現場測試。',
      '品牌與行銷：品牌定位、內容策略和廣告投放，售票展覽做到 ROA 22。',
    ]),
    h2('經歷'),
    p('2013 年開始寫前端，先後在 iSchool、睿訊、優訊、雲策數據、雲訊科技擔任前端工程師和團隊主管，帶過 10 人的前端與設計團隊。2023 年共同創辦墨雨互動設計和 MONOLAB，擔任 CEO，策劃 6 場展覽，也開了 TouchDesigner 的課程。'),
    p('完整經歷在 CV【連結待補】。'),
    h2('聯絡'),
    { type: 'paragraph', content: [link('tekuei.xx@gmail.com', 'mailto:tekuei.xx@gmail.com'), ...text('、'), link('Instagram', 'https://www.instagram.com/tekuei.xx')] },
  ),
  en: doc(
    lead('I am Wade Chu. I have written code for ten years and curated more than ten exhibitions. I help brands and teams turn ideas into websites, exhibitions and interactive work.'),
    p('[Photo: press "+" on this line to add an image, then delete this line]'),
    h2('Now'),
    p('I write at TEKUEI about marketing, AI, technology and how things get built. I also take on websites, interactive work and exhibitions.'),
    h2('What I can do for you'),
    list([
      'Websites: architecture, design and launch, such as the sites for Matsu Biennial 3 and SRE.',
      'Exhibitions and interactive work: script, visitor flow, video, light, projection and hardware, through to on-site testing.',
      'Brand and marketing: positioning, content and paid ads. Ticketed shows reached ROA 22.',
    ]),
    h2('Experience'),
    p('I started in front-end in 2013 and worked as an engineer and team lead at iSchool, Revovision, Unistar, Cloudlytics and Cloras, leading a front-end and design team of ten. In 2023 I co-founded Monoame and MONOLAB as CEO, curated six exhibitions and started TouchDesigner courses.'),
    p('The full story is in my CV [link to come].'),
    h2('Contact'),
    { type: 'paragraph', content: [link('tekuei.xx@gmail.com', 'mailto:tekuei.xx@gmail.com'), ...text(', '), link('Instagram', 'https://www.instagram.com/tekuei.xx')] },
  ),
}

export const cloneAbout = (v: AboutPageData): AboutPageData => structuredClone(v)
export const getDefaultAbout = (): AboutPageData => DEFAULT_ABOUT

/** About has an English version of its own. Without one /en/about shows the Chinese text. */
export const aboutInEnglish = (about: AboutPageData): boolean => hasBody(about.en)
