import { useCallback, useEffect, useState } from 'react'
import { useRevalidator } from 'react-router'
import { siteDefaults } from '../data/siteDefaults.ts'
import { fetchSiteData, onSiteVersion, saveSitePatch } from '../lib/adminApi.ts'
import { CMS_LABELS } from '../data/admin.ts'
import type { Dispatch, SetStateAction } from 'react'
import type { EditableSections, SectionKey } from '../lib/siteData.ts'

/** One section of data.json as its page and editor use it. */
export interface CmsSection<C> {
  /** The draft while editing, else the last loaded or saved content. Readers' pages use their loader data instead. */
  content: C
  /** Last loaded or saved version; compare with draft for unsaved changes. */
  savedContent: C
  draft: C | null
  /** Edit mode is reading the section from /api/data. */
  loading: boolean
  saving: boolean
  error: string
  setError: Dispatch<SetStateAction<string>>
  isEditing: boolean
  startEditing: () => Promise<void>
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
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  // The remote copy failed to load, so the content on screen is the bundled default.
  // Saving it would replace the real section in R2, so saving is refused until a reload.
  const [loadFailed, setLoadFailed] = useState(false)
  // Version of data.json this editor loaded or last saved; a save is refused if R2 moved on since.
  const [etag, setEtag] = useState<string | null>(null)
  const revalidator = useRevalidator()

  // Any section's save, this one's included, replaces the version this section loaded.
  useEffect(() => onSiteVersion((from, to) => setEtag((mine) => (mine === from ? to : mine))), [])

  // Readers see their page's loader data, which has no drafts. Only edit mode reads the whole section, drafts
  // included, with the version a save must match.
  const startEditing = useCallback(async () => {
    setLoading(true)
    setError('')
    setLoadFailed(false)
    const sectionContent = (data: Partial<EditableSections>) => cloneContent(data[sectionKey] ?? getDefault())
    let next: C
    try {
      const remote = await fetchSiteData()
      // A section R2 holds in a shape the site cannot read is a failed load: saving would replace it.
      if (remote?.invalid.includes(sectionKey)) throw new Error(`${sectionKey} in data.json is malformed`)
      // An empty bucket: the bundled defaults, until the first save creates data.json.
      next = sectionContent(remote?.data ?? siteDefaults)
      setEtag(remote?.etag ?? null)
    } catch {
      next = sectionContent(siteDefaults)
      setLoadFailed(true)
      setError(CMS_LABELS.loadFailed)
    }
    setContent(next)
    setDraft(cloneContent(next))
    setLoading(false)
  }, [sectionKey, cloneContent, getDefault])

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
      // The pages' loader data is what readers see, and what this page shows again after logout.
      revalidator.revalidate()
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
  }, [draft, sectionKey, cloneContent, copyDraft, loadFailed, etag, revalidator])

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
