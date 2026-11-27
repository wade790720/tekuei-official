import { startTransition, useCallback, useEffect, useEffectEvent, useState } from 'react'
import { siteDefaults } from '../data/siteDefaults.ts'
import { fetchSiteData, isRemoteSync, onSiteVersion, saveSitePatch } from '../lib/adminApi.ts'
import { CMS_LABELS } from '../data/admin.ts'
import type { Dispatch, SetStateAction } from 'react'
import type { EditableSections, SectionKey } from '../lib/siteData.ts'

/** One section of data.json as its page and editor use it. */
export interface CmsSection<C> {
  /** The draft while editing, else the saved content. */
  content: C
  /** Last loaded or saved version; compare with draft for unsaved changes. */
  savedContent: C
  draft: C | null
  loading: boolean
  saving: boolean
  error: string
  setError: Dispatch<SetStateAction<string>>
  isEditing: boolean
  startEditing: () => void
  cancelEditing: () => void
  updateDraft: (updater: (draft: C) => void) => void
  /** `change` edits a copy of the draft just before it is saved, so an action such as publishing is one save. */
  saveDraft: (token: string | null, change?: (draft: C) => void) => Promise<void>
}

/**
 * @param cloneContent  a deep copy
 * @param copyDraft  the copy each edit works on; it may share what edits only replace
 */
export function useCmsSection<K extends SectionKey>(
  sectionKey: K,
  getDefault: () => EditableSections[K],
  cloneContent: (v: EditableSections[K]) => EditableSections[K],
  copyDraft: (v: EditableSections[K]) => EditableSections[K] = cloneContent,
): CmsSection<EditableSections[K]> {
  type C = EditableSections[K]
  const [content, setContent] = useState<C>(() => cloneContent(getDefault()))
  const [draft, setDraft] = useState<C | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  // The remote copy failed to load, so the content on screen is the bundled default.
  // Saving it would replace the real section in R2, so saving is refused until a reload.
  const [loadFailed, setLoadFailed] = useState(false)
  // Version of data.json this editor loaded or last saved; a save is refused if R2 moved on since.
  const [etag, setEtag] = useState<string | null>(null)
  // Reads the latest getDefault and cloneContent without reloading when the caller passes new functions.
  const sectionContent = useEffectEvent((data: Partial<EditableSections>) => cloneContent(data[sectionKey] ?? getDefault()))

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
      let remote: Awaited<ReturnType<typeof fetchSiteData>> = null
      let failed = false
      try {
        remote = await fetchSiteData()
        // A section R2 holds in a shape the site cannot read is a failed load: saving would replace it.
        if (remote?.invalid.includes(sectionKey)) throw new Error(`${sectionKey} in data.json is malformed`)
      } catch {
        failed = true
      }
      if (cancelled) return
      // A transition, so a lazy page still hydrating finishes first instead of being redrawn on the client,
      // which would leave the server's <title> in the head next to the new one.
      startTransition(() => {
        if (failed) {
          fallback()
          setLoadFailed(true)
          setError(CMS_LABELS.loadFailed)
        } else if (!remote) fallback()
        else {
          setContent(sectionContent(remote.data))
          setEtag(remote.etag)
        }
        setLoading(false)
      })
    }
    load()
    return () => {
      cancelled = true
    }
  }, [sectionKey])

  // Any section's save, this one's included, replaces the version this section loaded.
  useEffect(() => onSiteVersion((from, to) => setEtag((mine) => (mine === from ? to : mine))), [])

  const startEditing = useCallback(() => {
    setDraft(cloneContent(content))
  }, [content, cloneContent])

  const cancelEditing = useCallback(() => {
    setDraft(null)
  }, [])

  const updateDraft = useCallback((updater: (draft: C) => void) => {
    setDraft((prev) => {
      if (!prev) return prev
      const next = copyDraft(prev)
      updater(next)
      return next
    })
  }, [copyDraft])

  const saveDraft = useCallback(async (token: string | null, change?: (draft: C) => void) => {
    if (!draft) return
    let next = draft
    if (change) {
      next = copyDraft(draft)
      change(next)
    }
    if (loadFailed) {
      setError(CMS_LABELS.loadFailed)
      throw new Error(CMS_LABELS.loadFailed)
    }
    setSaving(true)
    setError('')
    try {
      const patch: Partial<EditableSections> = {}
      patch[sectionKey] = next
      await saveSitePatch(patch, token, etag)
      setContent(cloneContent(next))
      // Edits made while the request was in flight stay in the draft; replacing it would drop them
      // while the editor still shows them, and the next save would not send them.
      setDraft((cur) => {
        if (cur === draft) return cloneContent(next)
        // Left edit mode while saving: there is no draft to carry the change into.
        if (!change || !cur) return cur
        const kept = copyDraft(cur)
        change(kept)
        return kept
      })
    } catch (err) {
      setError((err instanceof Error && err.message) || '儲存失敗')
      throw err
    } finally {
      setSaving(false)
    }
  }, [draft, sectionKey, cloneContent, copyDraft, loadFailed, etag])

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
