export async function onRequestGet({ request, env }) {
  const u = new URL(request.url)
  let key
  try {
    key = decodeURIComponent(u.pathname.replace(/^\/api\/file\//, ''))
  } catch {
    return new Response('Bad key', { status: 400 }) // a broken % escape
  }
  // Only uploaded images are public (functions/api/upload.js writes them under images/).
  // The bucket also holds data.json and the admin attempt counter.
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
