import type { ApiContext } from '../../env.d.ts'

export async function onRequestGet({ request, env }: ApiContext) {
  const u = new URL(request.url)
  let key: string
  try {
    key = decodeURIComponent(u.pathname.replace(/^\/api\/file\//, ''))
  } catch {
    return new Response('Bad key', { status: 400 }) // a broken % escape
  }
  if (!key.startsWith('images/') || key.includes('..')) {
    return new Response('Not found', { status: 404 })
  }
  const obj = await env.BUCKET.get(key)
  if (!obj) {
    return new Response('Not found', { status: 404 })
  }
  const ct = obj.httpMetadata?.contentType || 'application/octet-stream'
  return new Response(obj.body, {
    headers: {
      'Content-Type': ct,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
