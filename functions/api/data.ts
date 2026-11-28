import { adminGate, json } from '../../src/lib/adminAuth.ts'
import type { ApiContext } from '../env.d.ts'

const DATA = 'data.json'

// R2's etag without quotes. Cloudflare turns the ETag weak (W/"...") when it compresses the response.
const bareEtag = (header: string | null) => header?.replace(/^W\/|"/g, '') || undefined

const noStore = (res: Response) => {
  res.headers.set('Cache-Control', 'no-store')
  return res
}

/** The whole file, drafts included: only the editor reads it. Readers' pages get their own part from a loader. */
export async function onRequestGet({ request, env }: ApiContext) {
  if (!request.headers.has('Authorization')) return noStore(json({ error: 'Unauthorized' }, 401))
  const denied = await adminGate(request, env)
  if (denied) return noStore(denied)

  const obj = await env.BUCKET.get(DATA)
  if (!obj) {
    return json({ error: 'No data yet' }, 404)
  }
  // no-cache, not no-store: the browser keeps its copy but asks every time, and an unchanged file is
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

  const prevRead = env.BUCKET.get(DATA)
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
  if (prev?.etag !== bareEtag(request.headers.get('If-Match'))) return json({ error: 'Stale', stale: true }, 409)

  let existing: object = {}
  if (prev) {
    const text = await prev.text()
    try {
      existing = JSON.parse(text)
    } catch {
      return json({ error: 'data.json is not valid JSON. Nothing was saved.' }, 500)
    }
    const backup = `backup/data-${new Date().toISOString().slice(0, 10)}.json`
    if (!(await env.BUCKET.head(backup))) {
      await env.BUCKET.put(backup, text, { httpMetadata: { contentType: 'application/json' } })
    }
  }

  const merged = { ...existing, ...body }

  const saved = await env.BUCKET.put(DATA, JSON.stringify(merged), {
    httpMetadata: { contentType: 'application/json' },
    ...(prev ? { onlyIf: { etagMatches: prev.etag } } : {}),
  })
  if (!saved) return json({ error: 'Stale', stale: true }, 409)
  return json({ ok: true, etag: saved.httpEtag })
}
