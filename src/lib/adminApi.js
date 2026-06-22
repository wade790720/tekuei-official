import { ADMIN_SESSION_KEY } from '../data/admin.js'

export function apiPath(path) {
  const base = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
}

/**
 * production 預設走同網域 /api（Pages Functions + R2）；
 * 開發預設用 bundled data.json，除非 VITE_USE_REMOTE=true。
 */
export function isRemoteSync() {
  const v = import.meta.env.VITE_USE_REMOTE
  if (v === 'false') return false
  if (v === 'true') return true
  return import.meta.env.PROD
}

export function getAdminToken() {
  try {
    if (typeof window !== 'undefined') {
      const ss = sessionStorage.getItem(ADMIN_SESSION_KEY)
      if (ss) return ss
    }
  } catch {
    /* ignore */
  }
  if (import.meta.env.DEV && import.meta.env.VITE_ADMIN_KEY) {
    return import.meta.env.VITE_ADMIN_KEY
  }
  return ''
}

function authHeader(token) {
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

export async function loginAdmin(password) {
  const trimmed = password.trim()
  const res = await fetch(apiPath('/api/admin/verify'), {
    method: 'POST',
    headers: authHeader(trimmed),
  })
  if (!res.ok) {
    throw new Error('密碼錯誤')
  }
  return { token: trimmed }
}

export async function fetchSiteData() {
  const res = await fetch(apiPath('/api/data'), {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error('Failed to fetch site data')
  }
  return res.json()
}

export async function saveAboutContent(content, token) {
  return saveSitePatch({ about: content }, token)
}

export async function saveSitePatch(patch, token) {
  const res = await fetch(apiPath('/api/data'), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(token),
    },
    body: JSON.stringify(patch),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || '儲存失敗')
  }
  return data
}

export async function uploadSiteImage(slot, file, token) {
  const form = new FormData()
  form.append('file', file)
  form.append('slot', slot)
  const res = await fetch(apiPath('/api/upload'), {
    method: 'POST',
    headers: authHeader(token),
    body: form,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || '上傳失敗')
  }
  return data
}

export const uploadAboutImage = uploadSiteImage
