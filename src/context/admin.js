import { createContext, useContext, useEffect, useRef } from 'react'

export const AdminContext = createContext(null)

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin needs <AdminProvider>')
  return ctx
}

/** While `fn` is set, Ctrl/⌘+S in edit mode calls it. Pass null to unregister. */
export function useAdminSave(fn) {
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
