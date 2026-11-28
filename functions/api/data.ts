import { adminGate, json } from '../../src/lib/adminAuth.ts'
import type { ApiContext } from '../env.d.ts'

const DATA = 'data.json'

// R2's etag without quotes. Cloudflare turns the ETag weak (W/"...") when it compresses the response.
const bareEtag = (header: string | null) => header?.replace(/^W\/|"/g, '') || undefined

/** The whole file, drafts included: only the editor reads it. Readers' pages get their own part from a loader. */
export async function onRequestGet({ request, env }: ApiContext) {
  // A request with no code at all is no guess: refused without counting, so a crawler or an old link that
  // still asks for this file cannot use up the wrong-guess budget and lock Wade out.
  if (!request.headers.has('Authorization')) return json({ error: 'Unauthorized' }, 401)
  const denied = await adminGate(request, env)
  if (denied) return denied

  const obj = await env.BUCKET.get(DATA)
  if (!obj) {
    return json({ error: 'No data yet' }, 404)
  }
  // no-cache, not no-store: the browser keeps its copy but asks every time, and an unchanged file is
  // answered with 304 and no body.
  const headers = {
    'Cache-Control': 'private, no-cache',
    ETag: obj.httpEtag, // the editor sends it back as If-Match when it saves
  }
  if (bareEtag(request.headers.get('If-None-Match')) === obj.etag) return new Response(null, { status: 304, headers })
  return new Response(obj.body, { headers: { 'Content-Type': 'application/json', ...headers } })
}

export async function onRequestPut({ request, env }: ApiContext) {
  const denied = await adminGate(request, env)
  if (denied) return denied

  const prevRead = env.BUCKET.get(DATA) // starts while the body is read and parsed
  let body: unknown
  try {
    body = JSON.parse(await request.text())
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json({ error: 'Invalid body' }, 400)
  }

  const prev = await prevRead
  // The editor sends a whole section. If another tab or device saved after this editor loaded,
  // that section is stale and writing it would drop the other save. A save that names no version is
  // refused too, unless the bucket is empty: the editor has no ETag only before the first save.
  if (prev?.etag !== bareEtag(request.headers.get('If-Match'))) return json({ error: 'Stale', stale: true }, 409)

  let existing: object = {}
  if (prev) {
    const text = await prev.text()
    try {
      existing = JSON.parse(text)
    } catch {
      // Carrying on with {} would write back this one section and drop every other one.
      return json({ error: 'data.json is not valid JSON. Nothing was saved.' }, 500)
    }
    // Every post lives only in data.json. The first save of each day (UTC) keeps the file it replaces,
    // so a bad save, or someone who guessed the code, can be rolled back. /api/file serves only images/.
    const backup = `backup/data-${new Date().toISOString().slice(0, 10)}.json`
    if (!(await env.BUCKET.head(backup))) {
      await env.BUCKET.put(backup, text, { httpMetadata: { contentType: 'application/json' } })
    }
  }

  // Only the sections in the body change; the others are kept as they are.
  const merged = { ...existing, ...body }

  // Conditional on the copy read above, so a save landing in between is not overwritten either.
  const saved = await env.BUCKET.put(DATA, JSON.stringify(merged), {
    httpMetadata: { contentType: 'application/json' },
    ...(prev ? { onlyIf: { etagMatches: prev.etag } } : {}),
  })
  if (!saved) return json({ error: 'Stale', stale: true }, 409)
  return json({ ok: true, etag: saved.httpEtag })
}
