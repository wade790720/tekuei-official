import { MATSU_BIENNIAL_CASE } from './matsuBiennial.js'
import { MONOLAB_CASE } from './monolab.js'
import { LUSTRE_YELLOW_CASE } from './lustreYellow.js'
import { WORK_ITEMS } from '../work.js'

export const LOCAL_CASES = {
  'matsu-biennial': MATSU_BIENNIAL_CASE,
  monolab: MONOLAB_CASE,
  'lustre-yellow': LUSTRE_YELLOW_CASE,
}

export { LOCAL_CASES as CASE_BY_SLUG }

export function getNextCase(slug, items = WORK_ITEMS) {
  const idx = items.findIndex((w) => w.id === slug)
  if (idx === -1) return null
  const next = items[(idx + 1) % items.length]
  return {
    href: next.caseHref,
    titleEm: next.titleEmWord,
    titleRest: next.title,
    subtitle: next.subtitle,
  }
}
