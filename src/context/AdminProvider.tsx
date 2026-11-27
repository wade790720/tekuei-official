import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ADMIN_SESSION_KEY } from '../data/admin.ts'
import { getAdminToken, loginAdmin } from '../lib/adminApi.ts'
import { AdminContext } from './admin.ts'
import type { AdminState } from './admin.ts'

// Only Wade opens the code gate, so it and cms.css load on first use, not for every visitor.
const OtpGate = lazy(() => import('../components/admin/OtpGate.tsx').then((m) => ({ default: m.OtpGate })))

// Ctrl+S (Windows) or ⌘+S (Mac):
//   not logged in -> the code gate
//   logged in     -> edit mode
//   editing       -> save (the page registers its save with useAdminSave)
const isSaveKey = (e: KeyboardEvent) =>
  (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && !e.isComposing && (e.code === 'KeyS' || e.key === 's')

export function AdminProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getAdminToken() || null)
  const [gateOpen, setGateOpen] = useState(false)
  // Stays mounted after the first opening, so its closing animation can play.
  const [gateLoaded, setGateLoaded] = useState(false)
  if (gateOpen && !gateLoaded) setGateLoaded(true)
  const [editing, setEditingState] = useState(false)
  // The panel opens with edit mode and stays as Wade leaves it (collapsed or not) across pages.
  const [panelOpen, setPanelOpen] = useState(true)
  // Edit mode can show the page as readers see it; the panel holds the switch, the page reads it.
  const [previewing, setPreviewing] = useState(false)
  const setEditing = useCallback((on: boolean) => {
    setEditingState(on)
    setPreviewing(false)
    if (on) setPanelOpen(true)
  }, [])
  // The editor reads its doc once on mount. A new value remounts it after the doc was replaced from outside.
  const [editorKey, setEditorKey] = useState(0)
  const reloadEditor = useCallback(() => setEditorKey((k) => k + 1), [])
  const save = useRef<(() => void) | null>(null)

  const login = useCallback(async (code: string): Promise<true | string> => {
    try {
      const { token: t } = await loginAdmin(code)
      sessionStorage.setItem(ADMIN_SESSION_KEY, t)
      setToken(t)
      return true
    } catch (err) {
      return err instanceof Error ? err.message : String(err) // OtpGate shows it: wrong code, or locked after too many tries
    }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
    setToken(null)
    setEditing(false)
  }, [setEditing])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!isSaveKey(e)) return
      e.preventDefault() // also stops the browser's "Save page as"
      if (!token) setGateOpen(true)
      else if (!editing) setEditing(true)
      else save.current?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [token, editing, setEditing])

  useEffect(() => {
    document.documentElement.classList.toggle('is-cms-editing', editing)
  }, [editing])

  const value = useMemo(
    (): AdminState => ({
      isAuthenticated: Boolean(token),
      getToken: () => token,
      editing,
      setEditing,
      panelOpen,
      setPanelOpen,
      previewing,
      setPreviewing,
      openGate: () => setGateOpen(true),
      logout,
      saveRef: save,
      editorKey,
      reloadEditor,
    }),
    [token, editing, setEditing, panelOpen, previewing, logout, editorKey, reloadEditor],
  )

  return (
    <AdminContext value={value}>
      {children}
      {gateLoaded ? (
        <Suspense fallback={null}>
          <OtpGate
            open={gateOpen}
            onClose={() => setGateOpen(false)}
            onVerify={login}
            onUnlocked={() => {
              setGateOpen(false)
              setEditing(true)
            }}
          />
        </Suspense>
      ) : null}
    </AdminContext>
  )
}
