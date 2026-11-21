// Labs: interactive pieces listed under Work, after the client cases. They live in code, not in R2: each one is a live page at liveHref.
// Text only, so Pages Functions (sitemap, llms.txt) can import it; thumbnails are in media.js.

export const LABS = [
  {
    id: 'living-portrait',
    year: '2026',
    zh: {
      title: 'Living Portrait',
      subtitle: 'INTERACTIVE HERO',
      summary: '名字夾在背景和人物之間，滑過人物會出現追蹤框和 ASCII 字元，雙擊出現 glitch',
      tags: ['Canvas', 'Interaction'],
      credit: { label: 'motionsites.ai 的 Living Portrait', href: 'https://motionsites.ai/?prompt=living-portrait-hero' },
    },
    en: {
      title: 'Living Portrait',
      subtitle: 'INTERACTIVE HERO',
      summary: 'A name between the background and the figure. Hover the figure for tracking boxes and ASCII, double-click for a glitch.',
      tags: ['Canvas', 'Interaction'],
      credit: { label: 'Living Portrait on motionsites.ai', href: 'https://motionsites.ai/?prompt=living-portrait-hero' },
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
    },
    en: {
      title: 'Falling Figure',
      subtitle: 'SCROLL STORY',
      summary: 'Scroll down and a figure made of particles falls through stone slabs carved with each chapter of a career.',
      tags: ['Canvas', 'Scroll'],
      credit: { label: 'Palindrome of a Fall (0xkev21)', href: 'https://github.com/0xkev21/palindrome-of-a-fall' },
    },
  },
]

export const LAB_BY_ID = Object.fromEntries(LABS.map((x) => [x.id, x]))

export const labHref = (id) => `/labs/${id}`
export const liveHref = (id) => `/labs/${id}/live`

export const LAB_LABELS = {
  zh: { category: 'LABS', year: '年份', credit: '參考', open: '全螢幕開啟', back: '返回 Work', preview: '實際效果' },
  en: { category: 'LABS', year: 'Year', credit: 'Based on', open: 'Open full screen', back: 'Back to Work', preview: 'Live preview' },
}

/** Work list fields of each lab, without media. */
export function labLinks(lang) {
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
