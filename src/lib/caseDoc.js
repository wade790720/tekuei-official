// The first three cases keep their text in code (src/data/cases), in sections. This turns one into the same
// document a project page written in the editor has, so both are shown by the same page layout.

const text = (t) => [{ type: 'text', text: t }]
const para = (t) => ({ type: 'paragraph', content: text(t) })
const list = (lines) => ({ type: 'bulletList', content: lines.map((t) => ({ type: 'listItem', content: [para(t)] })) })
const image = (img) => (img?.url ? [{ type: 'imageCard', attrs: { src: img.url, alt: img.alt ?? '', caption: '' } }] : [])

/**
 * @param {object} data  one case in one language, with its images (useCaseCms)
 * @param {'zh' | 'en'} lang
 */
export function caseDoc(data, lang) {
  const colon = lang === 'zh' ? '：' : ': '
  const named = (items = []) => (items.length ? [list(items.map((x) => `${x.name}${colon}${x.desc}`))] : [])
  const section = (s, extra = []) => [
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
