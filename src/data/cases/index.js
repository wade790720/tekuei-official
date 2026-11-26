import { MATSU_BIENNIAL_CASE } from './matsuBiennial.js'
import { MONOLAB_CASE } from './monolab.js'
import { LUSTRE_YELLOW_CASE } from './lustreYellow.js'
import { DEFAULT_WORK, localizeWork, projectLink, projectTitle, publishedWork } from '../work.js'

export const LOCAL_CASES = {
  'matsu-biennial': MATSU_BIENNIAL_CASE,
  monolab: MONOLAB_CASE,
  'lustre-yellow': LUSTRE_YELLOW_CASE,
}

export { LOCAL_CASES as CASE_BY_SLUG }

/**
 * The project after this one on the Projects list, as readers see the list: in their language, without
 * drafts, linked where its card links. Null when this case is not on the list or is the only one.
 * @param {object} [work]  the work section; the bundled one until R2 answers
 */
export function getNextCase(slug, work = DEFAULT_WORK, lang = 'zh') {
  const shown = localizeWork(publishedWork(work), lang)
  const idx = shown.items.findIndex((w) => w.id === slug)
  if (idx === -1 || shown.items.length < 2) return null
  const next = shown.items[(idx + 1) % shown.items.length]
  return { href: projectLink(next, work), title: projectTitle(next), subtitle: next.client }
}
