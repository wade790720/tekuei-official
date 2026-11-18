import { useEffect } from 'react'
import { useAdmin, useAdminSave } from '../context/admin.js'

/**
 * Work and Case pages: enter their own edit state when global edit mode turns on,
 * and save on Ctrl/⌘+S. Login and the shortcut live in AdminProvider.
 * @param {{ onEnterEdit?: () => void, onSave?: () => void }} [opts]
 */
export function useSiteAdmin({ onEnterEdit, onSave } = {}) {
  const admin = useAdmin()

  useEffect(() => {
    if (admin.editing) onEnterEdit?.()
  }, [admin.editing, onEnterEdit])

  useAdminSave(admin.editing ? onSave : null)

  return {
    isAuthenticated: admin.isAuthenticated,
    getToken: admin.getToken,
    logout: admin.logout,
    openLogin: admin.openGate,
  }
}
