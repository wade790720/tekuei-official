import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ADMIN_SESSION_KEY } from '../data/admin.js'
import { getAdminToken, loginAdmin } from '../lib/adminApi.js'
import { OtpGate } from '../components/admin/OtpGate.jsx'
import { AdminContext } from './admin.js'

// Ctrl+S (Windows) or ⌘+S (Mac):
//   not logged in -> the code gate
//   logged in     -> edit mode
//   editing       -> save (the page registers its save with useAdminSave)
const isSaveKey = (e) =>
  (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && !e.isComposing && (e.code === 'KeyS' || e.key === 's')

export function AdminProvider({ children }) {
  const [token, setToken] = useState(() => getAdminToken() || null)
  const [gateOpen, setGateOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const save = useRef(null)

  const login = useCallback(async (code) => {
    try {
      const { token: t } = await loginAdmin(code)
      sessionStorage.setItem(ADMIN_SESSION_KEY, t)
      setToken(t)
      return true
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
    setToken(null)
    setEditing(false)
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if (!isSaveKey(e)) return
      e.preventDefault() // also stops the browser's "Save page as"
      if (!token) setGateOpen(true)
      else if (!editing) setEditing(true)
      else save.current?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [token, editing])

  useEffect(() => {
    document.documentElement.classList.toggle('is-cms-editing', editing)
  }, [editing])

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      getToken: () => token,
      editing,
      setEditing,
      openGate: () => setGateOpen(true),
      logout,
      saveRef: save,
    }),
    [token, editing, logout],
  )

  return (
    <AdminContext.Provider value={value}>
      {children}
      <OtpGate
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        onVerify={login}
        onUnlocked={() => {
          setGateOpen(false)
          setEditing(true)
        }}
      />
    </AdminContext.Provider>
  )
}
