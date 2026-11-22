import { useEffect, useState } from 'react'
import { cloneSiteData, siteDefaults } from '../lib/siteData.js'
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
  const staticCase = LOCAL_CASES[slug]?.[lang] ?? null
  const [siteData, setSiteData] = useState(() => cloneSiteData())
  const [content, setContent] = useState(() =>
    staticCase ? mergeAssets(staticCase, siteDefaults.cases?.[slug]) : null,
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const apply = (data) => {
        const bundled = cloneSiteData(data)
        setSiteData(bundled)
        setContent(staticCase ? mergeAssets(staticCase, bundled.cases?.[slug]) : null)
      }
      if (!isRemoteSync()) {
        if (!cancelled) {
          apply(siteDefaults)
          setLoading(false)
        }
        return
      }
      try {
        const remote = await fetchSiteData()
        if (!cancelled) apply(remote?.data ?? siteDefaults)
      } catch {
        if (!cancelled) apply(siteDefaults)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug, lang, staticCase])

  const workItems = siteData.work?.items ?? siteDefaults.work.items

  return { content, workItems, loading }
}
