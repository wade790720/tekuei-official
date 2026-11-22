import { useCallback, useEffect, useEffectEvent, useState } from 'react'
import { siteDefaults } from '../lib/siteData.js'
import { fetchSiteData, isRemoteSync, saveSitePatch } from '../lib/adminApi.js'
import { CMS_LABELS } from '../data/admin.js'

/**
 * @param {string} sectionKey
 * @param {() => unknown} getDefault
 * @param {(v: unknown) => unknown} cloneContent  a deep copy
 * @param {(v: unknown) => unknown} [copyDraft]  the copy each edit works on; it may share what edits only replace
 */
export function useCmsSection(sectionKey, getDefault, cloneContent, copyDraft = cloneContent) {
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
      const fallback = () => setContent(sectionContent(siteDefaults))
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
      const next = copyDraft(prev)
      updater(next)
      return next
    })
  }, [copyDraft])

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
      setContent(cloneContent(draft))
      setDraft(cloneContent(draft))
    } catch (err) {
      setError(err.message || '儲存失敗')
      throw err
    } finally {
      setSaving(false)
    }
  }, [draft, sectionKey, cloneContent, loadFailed, etag])

  return {
    content: draft ?? content,
    savedContent: content, // last loaded or saved version; compare with draft for unsaved changes
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
