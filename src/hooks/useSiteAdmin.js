import { useCallback, useEffect, useState } from 'react'
import { ADMIN_SESSION_KEY } from '../data/admin.js'
import { getAdminToken, loginAdmin } from '../lib/adminApi.js'

function readSession() {
  const token = getAdminToken()
  return token ? { token } : null
}

export function useSiteAdmin({ onEnterEdit } = {}) {
  const [session, setSession] = useState(() => readSession())
  const [showLogin, setShowLogin] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  const isAuthenticated = Boolean(session?.token)

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
    setSession(null)
  }, [])

  const getToken = useCallback(() => session?.token ?? null, [session])

  const login = useCallback(async (password) => {
    setLoggingIn(true)
    setLoginError('')
    try {
      const { token } = await loginAdmin(password)
      sessionStorage.setItem(ADMIN_SESSION_KEY, token)
      setSession({ token })
      setShowLogin(false)
      onEnterEdit?.()
      return true
    } catch (err) {
      setLoginError(err.message || '登入失敗')
      return false
    } finally {
      setLoggingIn(false)
    }
  }, [onEnterEdit])

  const openLogin = useCallback(() => {
    setLoginError('')
    setShowLogin(true)
  }, [])

  const closeLogin = useCallback(() => {
    setShowLogin(false)
    setLoginError('')
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      const isShortcut =
        (e.ctrlKey && e.code === 'Space') ||
        (e.ctrlKey && e.shiftKey && e.code === 'Space')
      if (!isShortcut) return
      e.preventDefault()
      if (isAuthenticated) {
        onEnterEdit?.()
      } else {
        openLogin()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isAuthenticated, onEnterEdit, openLogin])

  return {
    isAuthenticated,
    showLogin,
    loginError,
    loggingIn,
    login,
    logout,
    getToken,
    openLogin,
    closeLogin,
  }
}
