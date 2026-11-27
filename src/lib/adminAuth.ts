// Admin check for the Pages Functions (functions/api). ADMIN_SECRET is a 6-digit code, only a million
// guesses, so wrong guesses are capped for the whole site: MAX_FAILS per WINDOW_MS, counted in R2.
// The cap is global, not per visitor: someone guessing can also keep Wade locked out for a while.

const KEY = 'admin/attempts.json'
export const MAX_FAILS = 5
export const WINDOW_MS = 15 * 60 * 1000

// The parts of R2Bucket used here, so this file also type-checks in the browser project, which has no workers types.
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

/** @param request  carries `Authorization: Bearer <code>` */
export async function checkAdmin(request: Request, env: AdminEnv, now = Date.now()): Promise<'ok' | 'denied' | 'locked'> {
  const secret = env.ADMIN_SECRET
  if (!secret) return 'denied'

  const prev = await env.BUCKET.get(KEY)
  const saved = prev ? await prev.json().catch(() => null) : null
  let state = isAttempts(saved) ? saved : null
  if (!state || !(now - state.since <= WINDOW_MS)) state = { fails: 0, since: now }
  if (state.fails >= MAX_FAILS) return 'locked'

  // Count the attempt before comparing. The write only lands if nobody wrote since our read,
  // so of several guesses sent at once only one is compared; the others count as locked.
  // shortcut: the very first attempt ever (no counter object yet) is written unconditionally.
  const claimed = await env.BUCKET.put(
    KEY,
    JSON.stringify({ fails: state.fails + 1, since: state.since }),
    prev ? { onlyIf: { etagMatches: prev.etag } } : undefined,
  )
  if (!claimed) return 'locked'

  const ok = (request.headers.get('Authorization') || '') === `Bearer ${secret}`
  // Every save is checked, so a success must neither clear earlier wrong guesses (each save would hand
  // a guesser a fresh budget) nor count as one (autosave would lock Wade out). It takes back only its own count.
  // If a guess landed in between, the conditional write fails and this attempt stays counted.
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
