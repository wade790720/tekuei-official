import { ADMIN_SESSION_KEY, CMS_LABELS } from '../data/admin.js'

export function apiPath(path) {
  const base = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
}

/**
 * production 預設走同網域 /api（Pages Functions + R2）。
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

// The server lets one admin request through at a time: of several that arrive together, only one is
// checked and the others are refused as "too many attempts" (src/lib/adminAuth.js). So they take turns here.
let lastAdminRequest = Promise.resolve()
function inTurn(send) {
  lastAdminRequest = lastAdminRequest.then(send, send)
  return lastAdminRequest
}
const adminFetch = (path, init) => inTurn(() => fetch(apiPath(path), init))

export async function loginAdmin(password) {
  const trimmed = password.trim()
  const res = await adminFetch('/api/admin/verify', {
    method: 'POST',
    headers: authHeader(trimmed),
  })
  if (!res.ok) {
    throw new Error(res.status === 429 ? CMS_LABELS.locked : CMS_LABELS.wrong)
  }
  return { token: trimmed }
}

// One download per page load: Journal, Work and the case pages all read the same data.json.
// Callers treat the result as read only. A save or a failed load clears it.
let siteDataRequest = null

/** @returns {Promise<{ data: object, etag: string | null } | null>} null when the bucket is empty */
export function fetchSiteData() {
  siteDataRequest ??= requestSiteData().catch((err) => {
    siteDataRequest = null
    throw err
  })
  return siteDataRequest
}

async function requestSiteData() {
  const res = await fetch(apiPath('/api/data'), {
    headers: { Accept: 'application/json' },
  })
  // Empty bucket: the site runs on the bundled data.json until the first save creates it.
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error('Failed to fetch site data')
  }
  return { data: await res.json(), etag: res.headers.get('ETag') }
}

/**
 * @param {string | null} etag  the version this editor loaded; the server refuses the save (409) if it changed since
 * @returns {Promise<{ ok: true, etag: string }>}  etag of the saved version
 */
export async function saveSitePatch(patch, token, etag) {
  const res = await adminFetch('/api/data', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(token),
      ...(etag ? { 'If-Match': etag } : {}),
    },
    body: JSON.stringify(patch),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(res.status === 409 ? CMS_LABELS.stale : data.error || CMS_LABELS.saveFailed)
  }
  siteDataRequest = null // pages opened after this save read the new version
  return data
}

export async function uploadSiteImage(file, token) {
  const form = new FormData()
  form.append('file', file)
  const res = await adminFetch('/api/upload', {
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
