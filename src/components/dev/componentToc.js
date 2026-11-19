// "本頁" headings for a component page, in the order ComponentPage renders them.

/** Heading id for one API part, e.g. 'NavOverlay' → 'api-navoverlay'. */
export const partId = (name) => `api-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`

/** [id, label, level?][] — level 3 entries are indented under the h2 before them. */
export function componentToc(item) {
  return [
    ['api', 'API Reference'],
    ...item.api.filter((p) => p.part).map((p) => [partId(p.part), p.part, 3]),
    item.examples.length > 0 && ['examples', 'Examples'],
    ...item.examples.map((ex) => [`ex-${ex.id}`, ex.title, 3]),
    item.keyboard?.length > 0 && ['keyboard', '鍵盤'],
    item.notes?.length > 0 && ['notes', '說明'],
  ].filter(Boolean)
}
