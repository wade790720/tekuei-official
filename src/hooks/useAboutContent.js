import { useCallback, useEffect, useState } from 'react'
import {
  cloneAboutContent,
  cloneSiteData,
  DEFAULT_ABOUT_CONTENT,
} from '../data/about.js'
import siteDefaults from '../data/data.json'
import {
  fetchSiteData,
  isRemoteSync,
  saveAboutContent,
} from '../lib/adminApi.js'

export function useAboutContent() {
  const [siteData, setSiteData] = useState(() => cloneSiteData())
  const [content, setContent] = useState(() => cloneAboutContent())
  const [draft, setDraft] = useState(null)
  const [source, setSource] = useState('default')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      if (!isRemoteSync()) {
        if (!cancelled) {
          setSiteData(cloneSiteData())
          setContent(cloneAboutContent(DEFAULT_ABOUT_CONTENT))
          setSource('bundled')
          setLoading(false)
        }
        return
      }
      try {
        const remote = await fetchSiteData()
        if (!cancelled) {
          setSiteData(remote)
          setContent(remote.about ?? cloneAboutContent(DEFAULT_ABOUT_CONTENT))
          setSource('api')
        }
      } catch {
        if (!cancelled) {
          setSiteData(cloneSiteData())
          setContent(cloneAboutContent(DEFAULT_ABOUT_CONTENT))
          setSource('fallback')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const startEditing = useCallback(() => {
    setDraft(cloneAboutContent(content))
  }, [content])

  const cancelEditing = useCallback(() => {
    setDraft(null)
  }, [])

  const updateDraft = useCallback((updater) => {
    setDraft((prev) => {
      const next = cloneAboutContent(prev)
      updater(next)
      return next
    })
  }, [])

  const saveDraft = useCallback(async (token) => {
    if (!draft) return
    setSaving(true)
    setError('')
    try {
      await saveAboutContent(draft, token)
      const nextSite = cloneSiteData(siteData)
      nextSite.about = cloneAboutContent(draft)
      setSiteData(nextSite)
      setContent(cloneAboutContent(draft))
      setSource('api')
      setDraft(null)
    } catch (err) {
      setError(err.message || '儲存失敗')
      throw err
    } finally {
      setSaving(false)
    }
  }, [draft, siteData])

  const displayContent = draft ?? content

  return {
    content: displayContent,
    siteData,
    draft,
    source,
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

export function downloadDataJson(siteData, aboutContent, filename = 'data.json') {
  const payload = cloneSiteData(siteData ?? siteDefaults)
  payload.about = cloneAboutContent(aboutContent)
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
