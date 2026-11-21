// Interactive experiments listed under Work. They live in code, not in R2: each one is a live page at liveHref.
// Thumbnails are frames captured from each live piece at 1440x900, scaled to 960x600 to match the Work thumbnail (16:10).
import portraitThumb from '../assets/experiments/living-portrait.webp'
// A 12s loop recorded from the live piece with a scripted mouse (hover boxes, double-click glitch); the webp is its poster.
import portraitVideo from '../assets/experiments/living-portrait.mp4'
import fallThumb from '../assets/experiments/falling-figure.webp'

export const EXPERIMENTS = [
  {
    id: 'living-portrait',
    year: '2026',
    thumb: portraitThumb,
    thumbVideo: portraitVideo,
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
    thumb: fallThumb,
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

export const EXPERIMENT_BY_ID = Object.fromEntries(EXPERIMENTS.map((x) => [x.id, x]))

export const caseHref = (id) => `/cases/${id}`
export const liveHref = (id) => `/cases/${id}/live`

export const EXPERIMENT_LABELS = {
  zh: { category: 'EXPERIMENT', year: '年份', credit: '參考', open: '全螢幕開啟', back: '返回 Work', preview: '實際效果' },
  en: { category: 'EXPERIMENT', year: 'Year', credit: 'Based on', open: 'Open full screen', back: 'Back to Work', preview: 'Live preview' },
}

/** Work list cards for the experiments, numbered after the client cases. */
export function experimentWorkItems(lang, startNum) {
  return EXPERIMENTS.map((x, i) => ({
    id: x.id,
    num: String(startNum + i).padStart(2, '0'),
    caseHref: caseHref(x.id),
    client: EXPERIMENT_LABELS[lang].category,
    title: x[lang].title,
    subtitle: x[lang].subtitle,
    descriptionLines: [x[lang].summary],
    tags: x[lang].tags,
    thumbImage: { url: x.thumb, video: x.thumbVideo },
  }))
}
