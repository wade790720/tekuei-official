function j(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function onRequestPost({ request, env }) {
  if (request.method !== 'POST') return j({ error: 'Method not allowed' }, 405)
  const auth = request.headers.get('Authorization') || ''
  const secret = env.ADMIN_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    return j({ error: 'Unauthorized' }, 401)
  }
  return j({ ok: true })
}
