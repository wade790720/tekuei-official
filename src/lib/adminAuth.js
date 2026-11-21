// Admin check for the Pages Functions (functions/api). ADMIN_SECRET is a 6-digit code, only a million
// guesses, so wrong guesses are capped for the whole site: MAX_FAILS per WINDOW_MS, counted in R2.
// The cap is global, not per visitor: someone guessing can also keep Wade locked out for a while.

const KEY = 'admin/attempts.json'
export const MAX_FAILS = 5
export const WINDOW_MS = 15 * 60 * 1000

/**
 * @param {Request} request  carries `Authorization: Bearer <code>`
 * @param {{ ADMIN_SECRET?: string, BUCKET: R2Bucket }} env
 * @returns {Promise<'ok' | 'denied' | 'locked'>}
 */
export async function checkAdmin(request, env, now = Date.now()) {
  const secret = env.ADMIN_SECRET
  if (!secret) return 'denied'

  const prev = await env.BUCKET.get(KEY)
  let state = prev ? await prev.json().catch(() => null) : null
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
  if (ok) await env.BUCKET.put(KEY, JSON.stringify({ fails: 0, since: now }))
  return ok ? 'ok' : 'denied'
}

const json = (body, status) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

/** The error response for a failed check, or null when the request may go on. */
export async function adminGate(request, env) {
  const result = await checkAdmin(request, env)
  if (result === 'ok') return null
  if (result === 'locked') return json({ error: 'Too many attempts', locked: true }, 429)
  return json({ error: 'Unauthorized' }, 401)
}
