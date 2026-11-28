import type { ComponentEntry } from './libraryTypes.ts'

/** [id, label, level?]. Level 3 entries are indented under the h2 before them. */
export type TocItem = [id: string, label: string, level?: 3]

/** Heading id for one API part, e.g. 'NavOverlay' → 'api-navoverlay'. */
export const partId = (name: string) => `api-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`

export function componentToc(item: ComponentEntry): TocItem[] {
  const toc: (TocItem | false)[] = [
    ['api', 'API Reference'],
    ...item.api.filter((p) => p.part).map((p): TocItem => [partId(p.part ?? ''), p.part ?? '', 3]),
    item.examples.length > 0 && ['examples', 'Examples'],
    ...item.examples.map((ex): TocItem => [`ex-${ex.id}`, ex.title, 3]),
    !!item.keyboard?.length && ['keyboard', '鍵盤'],
    item.notes.length > 0 && ['notes', '說明'],
  ]
  return toc.filter((t) => t !== false)
}
