// The first three cases keep their text in code (src/data/cases), in sections. This turns one into the same
// document a project page written in the editor has, so both are shown by the same page layout.

import type { Doc, ImageRef, Lang } from './siteData.ts'

export interface CaseSection {
  num: string
  label: string
  title: string
  light?: boolean
  prose?: string[]
  quote?: { text: string; attr?: string; multiline?: boolean }
}
/** A deliverable or a challenge: "name: desc" in the page. */
export interface CaseNamed {
  num: string
  name: string
  desc: string
}
/** One case in one language, as written in src/data/cases. */
export interface CaseStudy {
  slug: string
  documentTitle: string
  hero: {
    num: string
    titleEm?: string
    titleRest: string
    subtitle: string
    bg: string
    meta: { label: string; lines: string[]; href?: string }[]
  }
  media: { fullWidthLabel: string; fullWidthBg: string; inlineLabel: string }
  sections: {
    overview: CaseSection
    challenge: CaseSection & { deliverables?: CaseNamed[] }
    approach: CaseSection & { timeline?: { phase: string; title: string; desc: string }[] }
    deliverables: CaseSection & { items?: CaseNamed[] }
    result: CaseSection
  }
  videos?: { src: string; poster?: string; caption?: string }[]
}
/** A case with the pictures stored in R2 (useCaseContent). */
export type CaseWithImages = CaseStudy & {
  hero: CaseStudy['hero'] & { image: ImageRef }
  media: CaseStudy['media'] & { fullWidthImage: ImageRef; inlineImage: ImageRef }
}

const text = (t: string): Doc[] => [{ type: 'text', text: t }]
const para = (t: string): Doc => ({ type: 'paragraph', content: text(t) })
const list = (lines: string[]): Doc => ({ type: 'bulletList', content: lines.map((t) => ({ type: 'listItem', content: [para(t)] })) })
const image = (img: ImageRef | undefined): Doc[] =>
  img?.url ? [{ type: 'imageCard', attrs: { src: img.url, alt: img.alt ?? '', caption: '' } }] : []

export function caseDoc(data: CaseWithImages, lang: Lang): Doc {
  const colon = lang === 'zh' ? '：' : ': '
  const named = (items: CaseNamed[] = []) => (items.length ? [list(items.map((x) => `${x.name}${colon}${x.desc}`))] : [])
  const section = (s: CaseSection, extra: Doc[] = []): Doc[] => [
    { type: 'heading', attrs: { level: 2 }, content: text(s.title) },
    ...(s.prose ?? []).map(para),
    ...extra,
    ...(s.quote ? [{ type: 'blockquote', attrs: { cite: s.quote.attr ?? '' }, content: [para(s.quote.text)] }] : []),
  ]
  const { sections: s, media } = data
  return {
    type: 'doc',
    content: [
      ...section(s.overview),
      ...(data.videos ?? []).map((v) => ({ type: 'videoCard', attrs: { src: v.src, poster: v.poster ?? '', caption: v.caption ?? '', loop: true } })),
      ...image(media.fullWidthImage),
      ...section(s.challenge, named(s.challenge.deliverables)),
      ...section(s.approach, s.approach.timeline?.length ? [list(s.approach.timeline.map((x) => `${x.phase} ${x.title}${colon}${x.desc}`))] : []),
      ...image(media.inlineImage),
      ...section(s.deliverables, named(s.deliverables.items)),
      ...section(s.result),
    ],
  }
}
