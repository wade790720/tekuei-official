import { ADMIN_SESSION_KEY, CMS_LABELS, TRANSLATE_LABELS } from '../data/admin.ts'
import { compressImage } from './compressImage.ts'
import { batchTexts } from './docTranslate.ts'
import { parseSiteData } from './siteData.ts'
import type { ParsedSiteData, SiteData } from './siteData.ts'

// What the API answers, read field by field: the body is whatever the server or a proxy sent.
const obj = (v: unknown): v is object => typeof v === 'object' && v !== null
const errorOf = (v: unknown) => (obj(v) && 'error' in v && typeof v.error === 'string' ? v.error : '')
const etagOf = (v: unknown) => (obj(v) && 'etag' in v && typeof v.etag === 'string' ? v.etag : null)
const textsOf = (v: unknown) => (obj(v) && 'texts' in v && Array.isArray(v.texts) && v.texts.every((t) => typeof t === 'string') ? v.texts : null)
const urlOf = (v: unknown) => (obj(v) && 'url' in v && typeof v.url === 'string' ? v.url : null)

export function apiPath(path: string): string {
  const base = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
}

/**
 * production 預設走同網域 /api（Pages Functions + R2）。
 * 開發預設用 bundled data.json，除非 VITE_USE_REMOTE=true。
 */
export function isRemoteSync(): boolean {
  const v = import.meta.env.VITE_USE_REMOTE
  if (v === 'false') return false
  if (v === 'true') return true
  return import.meta.env.PROD
}

export function getAdminToken(): string {
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

function authHeader(token: string | null): Record<string, string> {
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

// The server lets one admin request through at a time: of several that arrive together, only one is
// checked and the others are refused as "too many attempts" (src/lib/adminAuth.ts). So they take turns here.
let lastAdminRequest: Promise<unknown> = Promise.resolve()
function inTurn(send: () => Promise<Response>): Promise<Response> {
  const next = lastAdminRequest.then(send, send)
  lastAdminRequest = next
  return next
}
const adminFetch = (path: string, init: RequestInit) => inTurn(() => fetch(apiPath(path), init))

export async function loginAdmin(password: string): Promise<{ token: string }> {
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
export type SiteDataResponse = ParsedSiteData & { etag: string | null }
let siteDataRequest: Promise<SiteDataResponse | null> | null = null

/** @returns null when the bucket is empty */
export function fetchSiteData(): Promise<SiteDataResponse | null> {
  siteDataRequest ??= requestSiteData().catch((err) => {
    siteDataRequest = null
    throw err
  })
  return siteDataRequest
}

async function requestSiteData(): Promise<SiteDataResponse | null> {
  const res = await fetch(apiPath('/api/data'), {
    headers: { Accept: 'application/json' },
  })
  // Empty bucket: the site runs on the bundled data.json until the first save creates it.
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error('Failed to fetch site data')
  }
  return { ...parseSiteData(await res.json()), etag: res.headers.get('ETag') }
}

// Journal, Projects and About each remember the version of data.json they loaded. A save by one replaces
// that version, so the others are told: a section still on the replaced version moves to the new one.
// A section on any other version stays there, and its next save is refused, as it should be.
type VersionListener = (from: string | null, to: string | null) => void
const versionListeners = new Set<VersionListener>()

/** @returns stop listening */
export function onSiteVersion(fn: VersionListener): () => void {
  versionListeners.add(fn)
  return () => {
    versionListeners.delete(fn)
  }
}

/**
 * @param patch  whole sections; the others in R2 are kept
 * @param etag  the version this editor loaded; the server refuses the save (409) if it changed since
 * @returns etag of the saved version
 */
export async function saveSitePatch(patch: SiteData, token: string | null, etag: string | null): Promise<{ etag: string | null }> {
  const res = await adminFetch('/api/data', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(token),
      ...(etag ? { 'If-Match': etag } : {}),
    },
    body: JSON.stringify(patch),
  })
  const data: unknown = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(res.status === 409 ? CMS_LABELS.stale : errorOf(data) || CMS_LABELS.saveFailed)
  }
  siteDataRequest = null // pages opened after this save read the new version
  for (const fn of versionListeners) fn(etag ?? null, etagOf(data))
  return { etag: etagOf(data) }
}

/**
 * Sent in batches: Cloudflare drops a request that gets no response within 100 seconds.
 * @returns in the same order
 */
export async function translateTexts(
  texts: string[],
  token: string | null,
  { signal, onProgress }: { signal?: AbortSignal; onProgress?: (done: number, total: number) => void } = {},
): Promise<string[]> {
  const batches = batchTexts(texts)
  const out: string[] = []
  onProgress?.(0, batches.length)
  for (const [i, batch] of batches.entries()) {
    const res = await adminFetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({ texts: batch }),
      signal,
    })
    const data: unknown = await res.json().catch(() => ({}))
    const translated = textsOf(data)
    // A short answer would shift every later translation onto the wrong text.
    if (!res.ok || translated?.length !== batch.length) throw new Error(errorOf(data) || TRANSLATE_LABELS.failed)
    out.push(...translated)
    onProgress?.(i + 1, batches.length)
  }
  return out
}

/** Stores an image and returns `{ url }`. The API takes 1MB at most, so the image is shrunk here, for every caller. */
export async function uploadSiteImage(file: File, token: string | null): Promise<{ url: string }> {
  const form = new FormData()
  form.append('file', await compressImage(file))
  const res = await adminFetch('/api/upload', {
    method: 'POST',
    headers: authHeader(token),
    body: form,
  })
  const data: unknown = await res.json().catch(() => ({}))
  const url = urlOf(data)
  if (!res.ok || !url) {
    throw new Error(errorOf(data) || '上傳失敗')
  }
  return { url }
}
