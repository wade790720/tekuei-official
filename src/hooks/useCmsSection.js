import { useCallback, useEffect, useEffectEvent, useState } from 'react'
import { cloneSiteData, siteDefaults } from '../lib/siteData.js'
import { fetchSiteData, isRemoteSync, saveSitePatch } from '../lib/adminApi.js'
import { CMS_LABELS } from '../data/admin.js'
import { LOCAL_CASES } from '../data/cases/index.js'
import { useLang } from '../i18n'

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
  // The remote copy failed to load, so the content on screen is the bundled default.
  // Saving it would replace the real section in R2, so saving is refused until a reload.
  const [loadFailed, setLoadFailed] = useState(false)
  // Version of data.json this editor loaded or last saved; a save is refused if R2 moved on since.
  const [etag, setEtag] = useState(null)
  // Reads the latest getDefault and cloneContent without reloading when the caller passes new functions.
  const sectionContent = useEffectEvent((data) => cloneContent(data[sectionKey] ?? getDefault()))

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      setLoadFailed(false)
      const fallback = () => {
        const bundled = cloneSiteData()
        setSiteData(bundled)
        setContent(sectionContent(bundled))
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
        if (cancelled) return
        if (!remote) fallback()
        else {
          setSiteData(remote.data)
          setContent(sectionContent(remote.data))
          setEtag(remote.etag)
        }
      } catch {
        if (!cancelled) {
          fallback()
          setLoadFailed(true)
          setError(CMS_LABELS.loadFailed)
        }
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
    if (loadFailed) {
      setError(CMS_LABELS.loadFailed)
      throw new Error(CMS_LABELS.loadFailed)
    }
    setSaving(true)
    setError('')
    try {
      const saved = await saveSitePatch({ [sectionKey]: draft }, token, etag)
      setEtag(saved.etag ?? null)
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
  }, [draft, siteData, sectionKey, cloneContent, loadFailed, etag])

  return {
    content: draft ?? content,
    savedContent: content, // last loaded or saved version; compare with draft for unsaved changes
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
