import { adminGate } from '../../../src/lib/adminAuth.js'

export async function onRequestPost({ request, env }) {
  const denied = await adminGate(request, env)
  if (denied) return denied
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
}
