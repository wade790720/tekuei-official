import { createContext, use, useEffect, useRef } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'

export interface AdminState {
  isAuthenticated: boolean
  getToken: () => string | null
  editing: boolean
  setEditing: (on: boolean) => void
  panelOpen: boolean
  setPanelOpen: Dispatch<SetStateAction<boolean>>
  /** Edit mode showing the page as readers see it. */
  previewing: boolean
  setPreviewing: Dispatch<SetStateAction<boolean>>
  openGate: () => void
  logout: () => void
  /** The save Ctrl/⌘+S calls in edit mode (useAdminSave). */
  saveRef: RefObject<(() => void) | null>
  editorKey: number
  reloadEditor: () => void
}

export const AdminContext = createContext<AdminState | null>(null)

export function useAdmin(): AdminState {
  const ctx = use(AdminContext)
  if (!ctx) throw new Error('useAdmin needs <AdminProvider>')
  return ctx
}

/** While `fn` is set, Ctrl/⌘+S in edit mode calls it. Pass null to unregister. */
export function useAdminSave(fn: (() => void) | null): void {
  const { saveRef } = useAdmin()
  const latest = useRef(fn)
  useEffect(() => {
    latest.current = fn
  })
  const active = Boolean(fn)
  useEffect(() => {
    if (!active) return undefined
    const call = () => latest.current?.()
    saveRef.current = call
    return () => {
      if (saveRef.current === call) saveRef.current = null
    }
  }, [active, saveRef])
}
