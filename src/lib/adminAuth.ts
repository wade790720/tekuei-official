const KEY = 'admin/attempts.json'
export const MAX_FAILS = 5
export const WINDOW_MS = 15 * 60 * 1000

interface AttemptsBucket {
  get(key: string): Promise<{ etag: string; json(): Promise<unknown> } | null>
  put(key: string, value: string, options?: { onlyIf: { etagMatches: string } }): Promise<{ etag: string } | null>
}
export interface AdminEnv {
  ADMIN_SECRET?: string
  BUCKET: AttemptsBucket
}
interface Attempts {
  fails: number
  since: number
}
const isAttempts = (v: unknown): v is Attempts =>
  typeof v === 'object' && v !== null && 'fails' in v && 'since' in v && typeof v.fails === 'number' && typeof v.since === 'number'

export const TOKEN_MS = 12 * 60 * 60 * 1000
const utf8 = (s: string) => new TextEncoder().encode(s)
const hmacKey = (secret: string) => crypto.subtle.importKey('raw', utf8(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
const toB64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const fromB64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))

export async function issueToken(secret: string, now = Date.now()): Promise<string> {
  const exp = String(now + TOKEN_MS)
  return `${exp}.${toB64(await crypto.subtle.sign('HMAC', await hmacKey(secret), utf8(exp)))}`
}

async function validToken(token: string, secret: string, now: number): Promise<boolean> {
  const [exp, sig, ...rest] = token.split('.')
  if (rest.length || !exp || !sig || !(Number(exp) > now)) return false
  try {
    return await crypto.subtle.verify('HMAC', await hmacKey(secret), fromB64(sig), utf8(exp))
  } catch {
    return false // sig is not base64
  }
}

const bearerOf = (request: Request) => (request.headers.get('Authorization') || '').replace(/^Bearer /, '')

/** @param request  carries `Authorization: Bearer <token from /api/admin/verify, or the code>` */
export async function checkAdmin(request: Request, env: AdminEnv, now = Date.now()): Promise<'ok' | 'denied' | 'locked'> {
  const secret = env.ADMIN_SECRET
  if (!secret) return 'denied'
  const bearer = bearerOf(request)
  if (bearer.includes('.')) return (await validToken(bearer, secret, now)) ? 'ok' : 'denied'
  return checkCode(request, env, secret, now)
}

async function checkCode(request: Request, env: AdminEnv, secret: string, now: number): Promise<'ok' | 'denied' | 'locked'> {

  const prev = await env.BUCKET.get(KEY)
  const saved = prev ? await prev.json().catch(() => null) : null
  let state = isAttempts(saved) ? saved : null
  if (!state || !(now - state.since <= WINDOW_MS)) state = { fails: 0, since: now }
  if (state.fails >= MAX_FAILS) return 'locked'

  const claimed = await env.BUCKET.put(
    KEY,
    JSON.stringify({ fails: state.fails + 1, since: state.since }),
    prev ? { onlyIf: { etagMatches: prev.etag } } : undefined,
  )
  if (!claimed) return 'locked'

  const ok = (request.headers.get('Authorization') || '') === `Bearer ${secret}`
  if (ok) await env.BUCKET.put(KEY, JSON.stringify(state), { onlyIf: { etagMatches: claimed.etag } })
  return ok ? 'ok' : 'denied'
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

/** The error response for a failed check, or null when the request may go on. */
export async function adminGate(request: Request, env: AdminEnv): Promise<Response | null> {
  const result = await checkAdmin(request, env)
  if (result === 'ok') return null
  if (result === 'locked') return json({ error: 'Too many attempts', locked: true }, 429)
  return json({ error: 'Unauthorized' }, 401)
}

/** POST /api/admin/verify: the code, never a token, buys a token. */
export async function adminLogin(request: Request, env: AdminEnv, now = Date.now()): Promise<Response> {
  const secret = env.ADMIN_SECRET
  const result = secret && !bearerOf(request).includes('.') ? await checkCode(request, env, secret, now) : 'denied'
  if (result === 'locked') return json({ error: 'Too many attempts', locked: true }, 429)
  if (result !== 'ok' || !secret) return json({ error: 'Unauthorized' }, 401)
  return json({ ok: true, token: await issueToken(secret, now) })
}
