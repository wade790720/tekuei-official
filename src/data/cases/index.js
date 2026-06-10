import { WORK_ITEMS } from '../works.js'
import { LUSTRE_YELLOW_CASE } from './lustreYellow.js'
import { MATSU_BIENNIAL_CASE } from './matsuBiennial.js'
import { MONOLAB_CASE } from './monolab.js'

export const CASE_BY_SLUG = {
  'matsu-biennial': MATSU_BIENNIAL_CASE,
  monolab: MONOLAB_CASE,
  'lustre-yellow': LUSTRE_YELLOW_CASE,
}

/**
 * @param {string} slug
 * @returns {{ href: string, titleEm?: string, titleRest: string, subtitle: string } | null}
 */
export function getNextCase(slug) {
  const idx = WORK_ITEMS.findIndex((w) => w.id === slug)
  if (idx === -1) return null

  const next = WORK_ITEMS[(idx + 1) % WORK_ITEMS.length]
  return {
    href: next.caseHref,
    titleEm: next.titleEmWord,
    titleRest: next.title,
    subtitle: next.subtitle,
  }
}
