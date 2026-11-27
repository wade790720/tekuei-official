// Labs: interactive pieces listed under Work, after the client cases. They live in code, not in R2: each one has a page at labHref and runs full screen at liveHref.
// Text only, so Pages Functions (sitemap, llms.txt) can import it; thumbnails are in media.ts.

import type { Lang } from '../lib/siteData.ts'

export type LabId = 'living-portrait' | 'falling-figure' | 'shatter-footer'

export interface LabText {
  title: string
  subtitle: string
  summary: string
  tags: string[]
  credit: { label: string; href: string }
  intro: string[]
}

export interface Lab {
  id: LabId
  year: string
  /** CSS aspect-ratio of the preview frame; the default is 16 / 10. */
  previewAspect?: string
  zh: LabText
  en: LabText
}

export const LABS: Lab[] = [
  {
    id: 'living-portrait',
    year: '2026',
    zh: {
      title: 'Living Portrait',
      subtitle: 'INTERACTIVE HERO',
      summary: '名字夾在背景和人物之間，滑過人物會出現追蹤框和 ASCII 字元，雙擊出現 glitch',
      tags: ['Canvas', 'Interaction'],
      credit: { label: 'motionsites.ai 的 Living Portrait', href: 'https://motionsites.ai/?prompt=living-portrait-hero' },
      intro: [
        '這是首頁改版前的 Hero，背景、名字和人物分成三層，名字夾在中間，看起來像站在人物後面。',
        '滑鼠移到人物身上，人物的輪廓會冒出追蹤框和 ASCII 字元，顏色取自底下的照片，雙擊人物會先出現 glitch，再換成另一張照片兩秒。',
        '整個效果用一張 Canvas 畫，滑鼠沒有動作時就停止重繪。',
      ],
    },
    en: {
      title: 'Living Portrait',
      subtitle: 'INTERACTIVE HERO',
      summary: 'A name between the background and the figure. Hover the figure for tracking boxes and ASCII, double-click for a glitch.',
      tags: ['Canvas', 'Interaction'],
      credit: { label: 'Living Portrait on motionsites.ai', href: 'https://motionsites.ai/?prompt=living-portrait-hero' },
      intro: [
        'The home page hero before the redesign. The background, the name and the figure are three layers, with the name in the middle, so it seems to stand behind the figure.',
        'Hover the figure and tracking boxes and ASCII characters appear along its outline, coloured from the photo underneath. Double-click it for a glitch, then a second photo for two seconds.',
        'Everything is drawn on one canvas, and drawing stops while the pointer is still.',
      ],
    },
  },
  {
    id: 'falling-figure',
    year: '2026',
    zh: {
      title: 'Falling Figure',
      subtitle: 'SCROLL STORY',
      summary: '往下捲動時，粒子組成的人形一路往下掉，穿過刻著每段經歷的石板',
      tags: ['Canvas', 'Scroll'],
      credit: { label: 'Palindrome of a Fall（0xkev21）', href: 'https://github.com/0xkev21/palindrome-of-a-fall' },
      intro: [
        '這是 About 改版前的頁面，把經歷寫成一段往下掉的過程，每段經歷刻在一塊石板上。',
        '往下捲動時，粒子組成的人形一路往下掉，碰到石板就撞碎它，揚起一陣塵土，再繼續往下。',
        '捲動用 Lenis 讓速度平順，人形是一張去背照片取樣成的粒子。',
      ],
    },
    en: {
      title: 'Falling Figure',
      subtitle: 'SCROLL STORY',
      summary: 'Scroll down and a figure made of particles falls through stone slabs carved with each chapter of a career.',
      tags: ['Canvas', 'Scroll'],
      credit: { label: 'Palindrome of a Fall (0xkev21)', href: 'https://github.com/0xkev21/palindrome-of-a-fall' },
      intro: [
        'The About page before the redesign. It tells a career as a fall, with each chapter carved on a stone slab.',
        'Scroll down and a figure made of particles falls, smashes through each slab in a cloud of dust, and keeps falling.',
        'Lenis keeps the scroll smooth, and the particles are sampled from a cut-out photo.',
      ],
    },
  },
  {
    id: 'shatter-footer',
    year: '2026',
    // Taller than the default 16:10: in a shorter frame the sea has to shrink to fit under the links.
    previewAspect: '4 / 3',
    zh: {
      title: 'Shatter Footer',
      subtitle: 'FOOTER EFFECT',
      summary: '捲到頁尾時，一張版畫風格的海浪由碎片從左到右拼起來，然後靜止',
      tags: ['Canvas', 'Image'],
      credit: { label: 'motionsites.ai', href: 'https://motionsites.ai/' },
      intro: [
        '這是 Journal 原本的頁尾，四欄連結下面是一張版畫風格的海浪，燈塔對齊第三條虛線。',
        '頁尾露出畫面三分之一時，海浪碎成兩像素的小方塊，從右邊飛進來，從左到右拼成整張圖，連結跟著依序淡入，拼完就靜止，不再耗電。',
        '圖的亮度轉成透明度，所以黑色的部分會消失，海浪可以放在任何深色背景上。',
      ],
    },
    en: {
      title: 'Shatter Footer',
      subtitle: 'FOOTER EFFECT',
      summary: 'Scroll to the footer and an engraved sea assembles from fragments, left to right, then holds still.',
      tags: ['Canvas', 'Image'],
      credit: { label: 'motionsites.ai', href: 'https://motionsites.ai/' },
      intro: [
        'The Journal footer before the redesign: four columns of links above an engraved sea, with the lighthouse on the third rule.',
        'When a third of the footer is on screen, the sea breaks into 2px fragments that fly in from the right and assemble left to right while the links fade in one by one. Then it holds still and stops drawing.',
        'Brightness becomes alpha, so the black drops out and the sea sits on any dark background.',
      ],
    },
  },
]

export const LAB_BY_ID: Partial<Record<string, Lab>> = Object.fromEntries(LABS.map((x) => [x.id, x]))

export const labHref = (id: LabId) => `/labs/${id}`
export const liveHref = (id: LabId) => `/labs/${id}/live`

export const LAB_LABELS: Record<Lang, Record<'category' | 'year' | 'credit' | 'home' | 'crumbs' | 'preview' | 'showPreview' | 'copyPrompt' | 'copied' | 'about' | 'more', string>> = {
  zh: { category: 'LABS', year: '年份', credit: '參考', home: '首頁', crumbs: '導覽路徑', preview: '實際效果', showPreview: '全螢幕預覽', copyPrompt: '複製提示詞', copied: '已複製', about: '關於', more: '更多 Labs' },
  en: { category: 'LABS', year: 'Year', credit: 'Based on', home: 'Home', crumbs: 'Breadcrumb', preview: 'Live preview', showPreview: 'Show Preview', copyPrompt: 'Copy Prompt', copied: 'Copied', about: 'About', more: 'More Labs' },
}

/** Work list fields of each lab, without media. */
export function labLinks(lang: Lang) {
  return LABS.map((x) => ({
    id: x.id,
    caseHref: labHref(x.id),
    client: LAB_LABELS[lang].category,
    title: x[lang].title,
    subtitle: x[lang].subtitle,
    descriptionLines: [x[lang].summary],
    tags: x[lang].tags,
  }))
}
