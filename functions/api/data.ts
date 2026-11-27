import { adminGate, json } from '../../src/lib/adminAuth.ts'

const DATA = 'data.json'

export async function onRequestGet({ request, env }) {
  const obj = await env.BUCKET.get(DATA)
  if (!obj) {
    return json({ error: 'No data yet' }, 404)
  }
  // no-cache, not no-store: the browser keeps its copy but asks every time, and an unchanged file is
  // answered with 304 and no body. Every page of the site reads this file, and it holds every post.
  const headers = {
    'Cache-Control': 'private, no-cache',
    ETag: obj.httpEtag, // the editor sends it back as If-Match when it saves
  }
  if (request.headers.get('If-None-Match') === obj.httpEtag) return new Response(null, { status: 304, headers })
  return new Response(obj.body, { headers: { 'Content-Type': 'application/json', ...headers } })
}

export async function onRequestPut({ request, env }) {
  const denied = await adminGate(request, env)
  if (denied) return denied

  const prevRead = env.BUCKET.get(DATA) // starts while the body is read and parsed
  let body
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
  // that section is stale and writing it would drop the other save.
  const loaded = request.headers.get('If-Match')?.replace(/^W\/|"/g, '')
  if (loaded && prev?.etag !== loaded) return json({ error: 'Stale', stale: true }, 409)

  let existing = {}
  if (prev) {
    try {
      existing = JSON.parse(await prev.text())
    } catch {
      // Carrying on with {} would write back this one section and drop every other one.
      return json({ error: 'data.json is not valid JSON. Nothing was saved.' }, 500)
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
