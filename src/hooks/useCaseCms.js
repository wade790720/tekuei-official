import { useEffect, useMemo, useState } from 'react'
import { siteDefaults } from '../lib/siteData.js'
import { fetchSiteData, isRemoteSync } from '../lib/adminApi.js'
import { LOCAL_CASES } from '../data/cases/index.js'
import { useLang } from '../i18n'

// Its own file so the case texts load with the case page, not in the main bundle.

function mergeAssets(staticCase, assets) {
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

/** Case page content: static text from src/data/cases plus the images stored in R2. Read only. */
export function useCaseCms(slug) {
  const { lang } = useLang()
  // Only the site data is state. The page content follows from it at render, so a language switch needs no reload.
  const [data, setData] = useState(siteDefaults)
  const [loading, setLoading] = useState(isRemoteSync)

  useEffect(() => {
    if (!isRemoteSync()) return undefined
    let cancelled = false
    fetchSiteData()
      .then((remote) => !cancelled && setData(remote?.data ?? siteDefaults))
      .catch(() => !cancelled && setData(siteDefaults))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const staticCase = LOCAL_CASES[slug]?.[lang] ?? null
  // Memoised: the page's effects depend on this object.
  const content = useMemo(() => (staticCase ? mergeAssets(staticCase, data.cases?.[slug]) : null), [staticCase, data, slug])
  const work = data.work ?? siteDefaults.work

  return { content, work, loading }
}
