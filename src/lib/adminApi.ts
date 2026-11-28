import { ADMIN_SESSION_KEY, CMS_LABELS, TRANSLATE_LABELS } from '../data/admin.ts'
import { compressImage } from './compressImage.ts'
import { batchTexts } from './docTranslate.ts'
import { parseSiteData } from './siteData.ts'
import type { ParsedSiteData, SiteData } from './siteData.ts'

const obj = (v: unknown): v is object => typeof v === 'object' && v !== null
const errorOf = (v: unknown) => (obj(v) && 'error' in v && typeof v.error === 'string' ? v.error : '')
const etagOf = (v: unknown) => (obj(v) && 'etag' in v && typeof v.etag === 'string' ? v.etag : null)
const textsOf = (v: unknown) => (obj(v) && 'texts' in v && Array.isArray(v.texts) && v.texts.every((t) => typeof t === 'string') ? v.texts : null)
const tokenOf = (v: unknown) => (obj(v) && 'token' in v && typeof v.token === 'string' && v.token ? v.token : null)
const urlOf = (v: unknown) => (obj(v) && 'url' in v && typeof v.url === 'string' ? v.url : null)

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

let lastAdminRequest: Promise<unknown> = Promise.resolve()
function inTurn(send: () => Promise<Response>): Promise<Response> {
  const next = lastAdminRequest.then(send, send)
  lastAdminRequest = next
  return next
}
const adminFetch = (path: string, init: RequestInit) => inTurn(() => fetch(path, init))

export async function loginAdmin(password: string): Promise<{ token: string }> {
  const trimmed = password.trim()
  const res = await adminFetch('/api/admin/verify', {
    method: 'POST',
    headers: authHeader(trimmed),
  })
  const token = res.ok ? tokenOf(await res.json().catch(() => null)) : null
  if (!token) throw new Error(res.status === 429 ? CMS_LABELS.locked : CMS_LABELS.wrong)
  return { token }
}

/** Edit mode could not read data.json; the message says why, for the panel. */
export class SiteDataError extends Error {}

export type SiteDataResponse = ParsedSiteData & { etag: string | null }
let siteDataRequest: Promise<SiteDataResponse | null> | null = null

/**
 * The whole data.json, drafts included, for edit mode. The server asks for the admin code, as for a save.
 * @returns null when the bucket is empty
 */
export function fetchSiteData(token: string | null): Promise<SiteDataResponse | null> {
  siteDataRequest ??= requestSiteData(token).finally(() => {
    siteDataRequest = null
  })
  return siteDataRequest
}

async function requestSiteData(token: string | null): Promise<SiteDataResponse | null> {
  const res = await adminFetch('/api/data', { headers: { Accept: 'application/json', ...authHeader(token) } })
  if (res.status === 404) return null
  if (res.status === 429) throw new SiteDataError(CMS_LABELS.loadLocked)
  if (res.status === 401) throw new SiteDataError(CMS_LABELS.loadDenied)
  if (!res.ok) throw new SiteDataError(CMS_LABELS.loadFailed)
  return { ...parseSiteData(await res.json()), etag: res.headers.get('ETag') }
}

const ours = new Set<string>()
let latest: string | null = null
const newest = (etag: string | null) => (ours.has(etag ?? '') ? latest : etag)

/**
 * @param patch  whole sections; the others in R2 are kept
 * @param etag  the version this editor loaded; the server refuses the save (409) if it changed since
 * @returns etag of the saved version
 */
export async function saveSitePatch(patch: SiteData, token: string | null, etag: string | null): Promise<{ etag: string | null }> {
  const version = newest(etag)
  const res = await adminFetch('/api/data', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(token),
      ...(version ? { 'If-Match': version } : {}),
    },
    body: JSON.stringify(patch),
  })
  const data: unknown = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(res.status === 409 ? CMS_LABELS.stale : errorOf(data) || CMS_LABELS.saveFailed)
  }
  const saved = etagOf(data)
  if (saved) {
    ours.add(version ?? '')
    latest = saved
  }
  return { etag: saved }
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
