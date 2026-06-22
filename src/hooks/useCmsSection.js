import { useCallback, useEffect, useState } from 'react'
import { cloneSiteData, siteDefaults } from '../lib/siteData.js'
import { fetchSiteData, isRemoteSync, saveSitePatch } from '../lib/adminApi.js'
import { LOCAL_CASES } from '../data/cases/index.js'

/**
 * @param {string} sectionKey
 * @param {() => unknown} getDefault
 * @param {(v: unknown) => unknown} cloneContent
 */
export function useCmsSection(sectionKey, getDefault, cloneContent) {
  const [siteData, setSiteData] = useState(() => cloneSiteData())
  const [content, setContent] = useState(() => cloneContent(getDefault()))
  const [draft, setDraft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      const fallback = () => {
        const bundled = cloneSiteData()
        setSiteData(bundled)
        setContent(cloneContent(bundled[sectionKey] ?? getDefault()))
      }
      if (!isRemoteSync()) {
        if (!cancelled) {
          fallback()
          setLoading(false)
        }
        return
      }
      try {
        const remote = await fetchSiteData()
        if (!cancelled) {
          setSiteData(remote)
          setContent(cloneContent(remote[sectionKey] ?? getDefault()))
        }
      } catch {
        if (!cancelled) fallback()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [sectionKey])

  const startEditing = useCallback(() => {
    setDraft(cloneContent(content))
  }, [content, cloneContent])

  const cancelEditing = useCallback(() => {
    setDraft(null)
  }, [])

  const updateDraft = useCallback((updater) => {
    setDraft((prev) => {
      const next = cloneContent(prev)
      updater(next)
      return next
    })
  }, [cloneContent])

  const saveDraft = useCallback(async (token) => {
    if (!draft) return
    setSaving(true)
    setError('')
    try {
      await saveSitePatch({ [sectionKey]: draft }, token)
      const nextSite = cloneSiteData(siteData)
      nextSite[sectionKey] = cloneContent(draft)
      setSiteData(nextSite)
      setContent(cloneContent(draft))
      setDraft(cloneContent(draft))
    } catch (err) {
      setError(err.message || '儲存失敗')
      throw err
    } finally {
      setSaving(false)
    }
  }, [draft, siteData, sectionKey, cloneContent])

  return {
    content: draft ?? content,
    siteData,
    draft,
    loading,
    saving,
    error,
    setError,
    isEditing: Boolean(draft),
    startEditing,
    cancelEditing,
    updateDraft,
    saveDraft,
  }
}

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

function extractAssets(caseData) {
  return {
    hero: { image: caseData?.hero?.image ?? { url: '' } },
    media: {
      fullWidthImage: caseData?.media?.fullWidthImage ?? { url: '' },
      inlineImage: caseData?.media?.inlineImage ?? { url: '' },
    },
  }
}

export function useCaseCms(slug) {
  const staticCase = LOCAL_CASES[slug] ?? null
  const [siteData, setSiteData] = useState(() => cloneSiteData())
  const [content, setContent] = useState(() =>
    staticCase ? mergeAssets(staticCase, siteDefaults.cases?.[slug]) : null,
  )
  const [draft, setDraft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
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
        if (!cancelled) apply(remote)
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
  }, [slug])

  const startEditing = useCallback(() => {
    if (content) setDraft(structuredClone(content))
  }, [content])

  const cancelEditing = useCallback(() => {
    setDraft(null)
  }, [])

  const updateDraft = useCallback((updater) => {
    setDraft((prev) => {
      if (!prev) return prev
      const next = structuredClone(prev)
      updater(next)
      return next
    })
  }, [])

  const saveDraft = useCallback(async (token) => {
    if (!draft) return
    setSaving(true)
    setError('')
    try {
      const assetPatch = extractAssets(draft)
      const cases = { ...(siteData.cases || {}), [slug]: assetPatch }
      await saveSitePatch({ cases }, token)
      const nextSite = cloneSiteData(siteData)
      nextSite.cases = cases
      setSiteData(nextSite)
      setContent(mergeAssets(staticCase, assetPatch))
      setDraft(structuredClone(draft))
    } catch (err) {
      setError(err.message || '儲存失敗')
      throw err
    } finally {
      setSaving(false)
    }
  }, [draft, siteData, slug, staticCase])

  const workItems = siteData.work?.items ?? siteDefaults.work.items

  return {
    content: draft ?? content,
    siteData,
    workItems,
    draft,
    loading,
    saving,
    error,
    setError,
    isEditing: Boolean(draft),
    startEditing,
    cancelEditing,
    updateDraft,
    saveDraft,
  }
}
