import type { CaseStudy } from '../../lib/caseDoc.ts'
import type { Localized } from '../../lib/siteData.ts'
import { MATSU_BIENNIAL_CASE } from './matsuBiennial.ts'
import { MONOLAB_CASE } from './monolab.ts'
import { LUSTRE_YELLOW_CASE } from './lustreYellow.ts'

export const LOCAL_CASES: Record<string, Localized<CaseStudy>> = {
  'matsu-biennial': MATSU_BIENNIAL_CASE,
  monolab: MONOLAB_CASE,
  'lustre-yellow': LUSTRE_YELLOW_CASE,
}

export { LOCAL_CASES as CASE_BY_SLUG }
