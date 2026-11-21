import { adminGate, json } from '../../../src/lib/adminAuth.js'

export async function onRequestPost({ request, env }) {
  const denied = await adminGate(request, env)
  if (denied) return denied
  return json({ ok: true })
}
