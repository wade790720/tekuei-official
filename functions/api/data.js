import { adminGate, json } from '../../src/lib/adminAuth.js'

const DATA = 'data.json'

export async function onRequestGet({ request, env }) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405)
  const obj = await env.BUCKET.get(DATA)
  if (!obj) {
    return json({ error: 'No data yet' }, 404)
  }
  return new Response(obj.body, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, no-store',
      ETag: obj.httpEtag, // the editor sends it back as If-Match when it saves
    },
  })
}

export async function onRequestPut({ request, env }) {
  if (request.method !== 'PUT') return json({ error: 'Method not allowed' }, 405)
  const denied = await adminGate(request, env)
  if (denied) return denied

  let body
  try {
    body = JSON.parse(await request.text())
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json({ error: 'Invalid body' }, 400)
  }

  const prev = await env.BUCKET.get(DATA)
  // The editor sends a whole section. If another tab or device saved after this editor loaded,
  // that section is stale and writing it would drop the other save.
  const loaded = request.headers.get('If-Match')?.replace(/^W\/|"/g, '')
  if (loaded && prev?.etag !== loaded) return json({ error: 'Stale', stale: true }, 409)

  let existing = {}
  if (prev) {
    try {
      existing = JSON.parse(await prev.text())
    } catch {
      existing = {}
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
