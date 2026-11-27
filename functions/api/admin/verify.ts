import { adminGate, json } from '../../../src/lib/adminAuth.ts'
import type { ApiContext } from '../../env.d.ts'

export async function onRequestPost({ request, env }: ApiContext) {
  const denied = await adminGate(request, env)
  if (denied) return denied
  return json({ ok: true })
}
