import type { Params, UIMatch } from 'react-router'

/** A route module's `handle`: the classes it puts on <html>, drawn by the layout so the first paint has them. */
export interface PageHandle {
  htmlClass: (params: Params) => string
}

const isPageHandle = (h: unknown): h is PageHandle =>
  typeof h === 'object' && h !== null && 'htmlClass' in h && typeof h.htmlClass === 'function'

export const htmlClassOf = (matches: UIMatch[]): string =>
  matches
    .flatMap((m) => (isPageHandle(m.handle) ? [m.handle.htmlClass(m.params)] : []))
    .filter(Boolean)
    .join(' ')
