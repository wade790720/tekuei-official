import { useDeferredValue, useEffect, useMemo } from 'react'
import { useAdmin, useAdminSave } from '../context/admin.ts'
import { CMS_LABELS as T } from '../data/admin.ts'
import type { CmsSection } from './useCmsSection.ts'

/**
 * Edit mode glue for one CMS section (the result of useCmsSection): starts the draft when edit mode
 * turns on, saves on Ctrl/⌘+S, and asks before throwing away unsaved changes.
 */
export function useCmsEditing<C>(cms: CmsSection<C>) {
  const admin = useAdmin()
  const saved = useMemo(() => JSON.stringify(cms.savedContent), [cms.savedContent])
  const isDirty = (draft: C | null) => Boolean(draft) && JSON.stringify(draft) !== saved
  const deferredDraft = useDeferredValue(cms.draft)
  const dirty = useMemo(() => Boolean(deferredDraft) && JSON.stringify(deferredDraft) !== saved, [deferredDraft, saved])

  const { isEditing, loading, startEditing } = cms
  const { editing, getToken } = admin
  useEffect(() => {
    if (editing && !isEditing && !loading) void startEditing(getToken())
  }, [editing, getToken, isEditing, loading, startEditing])

  const save = async () => {
    if (!isDirty(cms.draft) || cms.saving) return
    try {
      await cms.saveDraft(admin.getToken())
    } catch {
      /* cms.error holds the message */
    }
  }
  const saveWith = async (change: (draft: C) => void) => {
    if (cms.saving) return
    try {
      await cms.saveDraft(admin.getToken(), change)
    } catch {
      /* cms.error holds the message */
    }
  }
  useAdminSave(admin.editing ? save : null)

  const leave = (then: () => void) => {
    if (isDirty(cms.draft) && !window.confirm(T.logoutConfirm)) return
    cms.cancelEditing()
    then()
  }

  return {
    admin,
    ready: admin.editing && cms.isEditing,
    saveWith,
    panelProps: {
      dirty,
      saving: cms.saving,
      error: cms.error,
      onSave: save,
      onLogout: () => leave(admin.logout),
    },
  }
}
