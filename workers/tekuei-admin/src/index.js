const ABOUT_CONTENT_KEY = 'content:about'
const LOGIN_ATTEMPTS_PREFIX = 'login:attempts:'
const MAX_LOGIN_ATTEMPTS = 8
const LOGIN_WINDOW_SEC = 900

const ALLOWED_IMAGE_SLOTS = new Set(['founder'])
const ALLOWED_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const MAX_IMAGE_BYTES = 1024 * 1024

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin') || ''
    const cors = buildCors(env, origin)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    try {
      let response
      if (url.pathname === '/api/content/about' && request.method === 'GET') {
        response = await handleGetAbout(env)
      } else if (url.pathname === '/api/admin/login' && request.method === 'POST') {
        response = await handleLogin(request, env)
      } else if (url.pathname === '/api/admin/content/about' && request.method === 'PUT') {
        response = await handlePutAbout(request, env)
      } else if (
        url.pathname.startsWith('/api/admin/media/about/') &&
        request.method === 'PUT'
      ) {
        const slot = url.pathname.split('/').pop()
        response = await handleUploadImage(request, env, slot)
      } else {
        response = json({ error: 'Not found' }, 404)
      }

      Object.entries(cors).forEach(([k, v]) => response.headers.set(k, v))
      return response
    } catch (err) {
      console.error(err)
      const response = json({ error: 'Internal server error' }, 500)
      Object.entries(cors).forEach(([k, v]) => response.headers.set(k, v))
      return response
    }
  },
}

function buildCors(env, origin) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim())
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
  if (allowed.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers.Vary = 'Origin'
  }
  return headers
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

async function handleGetAbout(env) {
  const raw = await env.CMS_KV.get(ABOUT_CONTENT_KEY)
  if (!raw) {
    return json({ error: 'About content not seeded' }, 404)
  }
  return new Response(raw, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

async function handleLogin(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const attemptKey = `${LOGIN_ATTEMPTS_PREFIX}${ip}`
  const attempts = Number((await env.CMS_KV.get(attemptKey)) || 0)
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    return json({ error: 'Too many attempts. Try again later.' }, 429)
  }

  const body = await request.json().catch(() => ({}))
  const password = body.password || ''

  if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) {
    await env.CMS_KV.put(attemptKey, String(attempts + 1), {
      expirationTtl: LOGIN_WINDOW_SEC,
    })
    return json({ error: 'Invalid password' }, 401)
  }

  await env.CMS_KV.delete(attemptKey)

  const hours = Number(env.JWT_EXPIRES_HOURS || 12)
  const expiresAt = Date.now() + hours * 3600 * 1000
  const token = await signJwt({ role: 'admin' }, env.JWT_SECRET, hours * 3600)

  return json({ token, expiresAt })
}

async function handlePutAbout(request, env) {
  const auth = await verifyAuth(request, env)
  if (!auth.ok) return json({ error: auth.error }, auth.status)

  const body = await request.text()
  try {
    JSON.parse(body)
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  await env.CMS_KV.put(ABOUT_CONTENT_KEY, body)
  return json({ ok: true })
}

async function handleUploadImage(request, env, slot) {
  const auth = await verifyAuth(request, env)
  if (!auth.ok) return json({ error: auth.error }, auth.status)

  if (!ALLOWED_IMAGE_SLOTS.has(slot)) {
    return json({ error: 'Invalid image slot' }, 400)
  }

  const contentType = request.headers.get('Content-Type') || ''
  if (!contentType.startsWith('multipart/form-data')) {
    return json({ error: 'Expected multipart/form-data' }, 400)
  }

  const form = await request.formData()
  const file = form.get('file')
  if (!file || typeof file === 'string') {
    return json({ error: 'Missing file' }, 400)
  }

  const mime = file.type
  const ext = ALLOWED_MIME[mime]
  if (!ext) {
    return json({ error: 'Unsupported image type' }, 400)
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return json({ error: 'File exceeds 1MB limit' }, 400)
  }

  const newKey = `about/images/${slot}.${ext}`
  const altExts = ['jpg', 'png', 'webp'].filter((e) => e !== ext)

  await env.CMS_R2.put(newKey, file.stream(), {
    httpMetadata: { contentType: mime },
  })

  for (const alt of altExts) {
    const altKey = `about/images/${slot}.${alt}`
    await env.CMS_R2.delete(altKey).catch(() => {})
  }

  const base = (env.MEDIA_PUBLIC_BASE_URL || '').replace(/\/$/, '')
  const url = base ? `${base}/${newKey}` : newKey

  return json({ ok: true, slot, url, key: newKey })
}

async function verifyAuth(request, env) {
  const header = request.headers.get('Authorization') || ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  if (!match) return { ok: false, error: 'Unauthorized', status: 401 }

  const payload = await verifyJwt(match[1], env.JWT_SECRET)
  if (!payload) return { ok: false, error: 'Invalid or expired token', status: 401 }
  return { ok: true, payload }
}

function base64urlEncode(bytes) {
  const bin = typeof bytes === 'string' ? bytes : String.fromCharCode(...new Uint8Array(bytes))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecode(str) {
  const pad = '='.repeat((4 - (str.length % 4)) % 4)
  const base64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function importHmacKey(secret) {
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

async function signJwt(payload, secret, expiresInSec) {
  if (!secret) throw new Error('JWT_SECRET not configured')
  const header = { alg: 'HS256', typ: 'JWT' }
  const exp = Math.floor(Date.now() / 1000) + expiresInSec
  const body = { ...payload, exp }
  const enc = new TextEncoder()
  const headerB64 = base64urlEncode(JSON.stringify(header))
  const bodyB64 = base64urlEncode(JSON.stringify(body))
  const data = `${headerB64}.${bodyB64}`
  const key = await importHmacKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return `${data}.${base64urlEncode(sig)}`
}

async function verifyJwt(token, secret) {
  if (!secret) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [headerB64, bodyB64, sigB64] = parts
  const enc = new TextEncoder()
  const data = `${headerB64}.${bodyB64}`
  const key = await importHmacKey(secret)
  const sig = base64urlDecode(sigB64)
  const valid = await crypto.subtle.verify('HMAC', key, sig, enc.encode(data))
  if (!valid) return null
  try {
    const payload = JSON.parse(
      new TextDecoder().decode(base64urlDecode(bodyB64)),
    )
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}
