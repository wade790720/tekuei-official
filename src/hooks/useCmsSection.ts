import { useCallback, useEffect, useRef, useState } from 'react'
import { useRevalidator } from 'react-router'
import { siteDefaults } from '../data/siteDefaults.ts'
import { fetchSiteData, saveSitePatch, SiteDataError } from '../lib/adminApi.ts'
import { CMS_LABELS } from '../data/admin.ts'
import { forgetLangSwitch } from '../lib/langSwitch.ts'
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
  /** @param token  the admin code: /api/data asks for it */
  startEditing: (token: string | null) => Promise<void>
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
  const [loadFailed, setLoadFailed] = useState('')
  const [etag, setEtag] = useState<string | null>(null)
  const revalidator = useRevalidator()
  const run = useRef(0)
  useEffect(() => () => void run.current++, [])

  const startEditing = useCallback(async (token: string | null) => {
    const mine = ++run.current
    setLoading(true)
    setError('')
    setLoadFailed('')
    const sectionContent = (data: Partial<EditableSections>) => cloneContent(data[sectionKey] ?? getDefault())
    let next: C
    let version: string | null = null
    let failed = ''
    try {
      const remote = await fetchSiteData(token)
      if (remote?.invalid.includes(sectionKey)) throw new Error(`${sectionKey} in data.json is malformed`)
      next = sectionContent(remote?.data ?? siteDefaults)
      version = remote?.etag ?? null
    } catch (err) {
      next = sectionContent(siteDefaults)
      failed = err instanceof SiteDataError ? err.message : CMS_LABELS.loadFailed
    }
    if (mine !== run.current) return
    setEtag(version)
    if (failed) {
      setLoadFailed(failed)
      setError(failed)
    }
    setContent(next)
    setDraft(cloneContent(next))
    setLoading(false)
  }, [sectionKey, cloneContent, getDefault])

  const cancelEditing = useCallback(() => {
    run.current++
    setLoading(false)
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
      setError(loadFailed)
      throw new Error(loadFailed)
    }
    setSaving(true)
    setError('')
    try {
      const patch: Partial<EditableSections> = {}
      patch[sectionKey] = next
      const saved = await saveSitePatch(patch, token, etag)
      setEtag(saved.etag)
      setContent(cloneContent(next))
      forgetLangSwitch()
      revalidator.revalidate()
      setDraft((cur) => {
        if (cur === draft) return cloneContent(next)
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
    savedContent: content,
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
