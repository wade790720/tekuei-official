import { adminGate, json } from '../../src/lib/adminAuth.js'

const EXT = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])
const MAX_BYTES = 1024 * 1024

export async function onRequestPost({ request, env }) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const denied = await adminGate(request, env)
  if (denied) return denied

  const form = await request.formData()
  const file = form.get('file')
  if (!file || typeof file === 'string' || !file.arrayBuffer) {
    return json({ error: 'Missing file' }, 400)
  }

  const ct = file.type || 'image/jpeg'
  if (!EXT.has(ct)) {
    return json({ error: 'Unsupported file type' }, 400)
  }
  if (file.size > MAX_BYTES) {
    return json({ error: 'File exceeds 1MB limit' }, 400)
  }

  const key = `images/${crypto.randomUUID()}.${EXT.get(ct)}`
  await env.BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: ct },
  })

  const origin = new URL(request.url).origin
  return json({ ok: true, url: `${origin}/api/file/${key}`, key })
}
