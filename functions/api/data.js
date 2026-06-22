const DATA = 'data.json'

function j(body, status = 200) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function onRequestGet({ request, env }) {
  if (request.method !== 'GET') return j({ error: 'Method not allowed' }, 405)
  const obj = await env.BUCKET.get(DATA)
  if (!obj) {
    return j({ error: 'No data yet' }, 404)
  }
  return new Response(obj.body, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, no-store',
    },
  })
}

export async function onRequestPut({ request, env }) {
  if (request.method !== 'PUT') return j({ error: 'Method not allowed' }, 405)
  const auth = request.headers.get('Authorization') || ''
  const secret = env.ADMIN_SECRET || ''
  if (!secret || auth !== `Bearer ${secret}`) {
    return j({ error: 'Unauthorized' }, 401)
  }

  let body
  try {
    body = JSON.parse(await request.text())
  } catch {
    return j({ error: 'Invalid JSON' }, 400)
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return j({ error: 'Invalid body' }, 400)
  }

  let existing = {}
  const prev = await env.BUCKET.get(DATA)
  if (prev) {
    try {
      existing = JSON.parse(await prev.text())
    } catch {
      existing = {}
    }
  }

  const merged = { ...existing }
  for (const key of Object.keys(body)) {
    merged[key] = body[key]
  }

  await env.BUCKET.put(DATA, JSON.stringify(merged), {
    httpMetadata: { contentType: 'application/json' },
  })
  return j({ ok: true })
}
