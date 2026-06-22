const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])
const FIXED_SLOTS = new Set(['founder'])
const MAX_BYTES = 1024 * 1024

function j(body, status = 200) {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function extFromMime(ct) {
  if (ct === 'image/png') return 'png'
  if (ct === 'image/webp') return 'webp'
  return 'jpg'
}

export async function onRequestPost({ request, env }) {
  if (request.method !== 'POST') return j({ error: 'Method not allowed' }, 405)
  const auth = request.headers.get('Authorization') || ''
  const secret = env.ADMIN_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    return j({ error: 'Unauthorized' }, 401)
  }

  const form = await request.formData()
  const file = form.get('file')
  if (!file || typeof file === 'string' || !file.arrayBuffer) {
    return j({ error: 'Missing file' }, 400)
  }

  const ct = file.type || 'image/jpeg'
  if (!ALLOWED.has(ct)) {
    return j({ error: 'Unsupported file type' }, 400)
  }
  if (file.size > MAX_BYTES) {
    return j({ error: 'File exceeds 1MB limit' }, 400)
  }

  const ext = extFromMime(ct)
  const slot = typeof form.get('slot') === 'string' ? form.get('slot') : ''
  let key

  if (slot && FIXED_SLOTS.has(slot)) {
    key = `about/images/${slot}.${ext}`
    const altExts = ['jpg', 'png', 'webp'].filter((e) => e !== ext)
    for (const alt of altExts) {
      await env.BUCKET.delete(`about/images/${slot}.${alt}`).catch(() => {})
    }
  } else {
    key = `images/${crypto.randomUUID()}.${ext}`
  }

  await env.BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: ct },
  })

  const origin = new URL(request.url).origin
  return j({ ok: true, url: `${origin}/api/file/${key}`, key })
}
