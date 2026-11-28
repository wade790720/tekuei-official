import { useMemo } from 'react'
import { LOCAL_CASES } from '../data/cases/index.ts'
import { useLang } from '../i18n'
import type { CaseStudy, CaseWithImages } from '../lib/caseDoc.ts'
import type { CaseAssets } from '../lib/siteData.ts'

function mergeAssets(staticCase: CaseStudy, assets: CaseAssets | undefined): CaseWithImages {
  return {
    ...staticCase,
    hero: {
      ...staticCase.hero,
      image: structuredClone(assets?.hero?.image ?? { url: '' }),
    },
    media: {
      ...staticCase.media,
      fullWidthImage: structuredClone(assets?.media?.fullWidthImage ?? { url: '' }),
      inlineImage: structuredClone(assets?.media?.inlineImage ?? { url: '' }),
    },
  }
}

/**
 * Case page content: static text from src/data/cases plus the images stored in R2. Read only.
 * @param assets  this case's pictures, from the page's loader
 */
export function useCaseContent(slug: string, assets: CaseAssets | undefined): CaseWithImages | null {
  const { lang } = useLang()
  const staticCase = Object.hasOwn(LOCAL_CASES, slug) ? LOCAL_CASES[slug][lang] : null
  return useMemo(() => (staticCase ? mergeAssets(staticCase, assets) : null), [staticCase, assets])
}
