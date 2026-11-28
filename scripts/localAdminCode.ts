import { readFileSync } from 'node:fs'

const LOCAL = new Set(['localhost', '127.0.0.1', '[::1]'])

/**
 * The admin code a script may send to `base`: ADMIN_SECRET from the environment, else from .dev.vars, and only to a
 * server on this machine. Anywhere else (tekuei-next, the live site) a code that does not match counts as a wrong
 * guess, and five lock Wade out for 15 minutes, so no code is sent there.
 */
export function localAdminCode(base: string, env: Record<string, string | undefined> = process.env, devVars = readDevVars): string | null {
  if (!LOCAL.has(new URL(base).hostname)) return null
  return env.ADMIN_SECRET || devVars().match(/^ADMIN_SECRET\s*=\s*"?([^"\s]+)"?/m)?.[1] || null
}

function readDevVars(): string {
  try {
    return readFileSync('.dev.vars', 'utf8')
  } catch {
    return ''
  }
}
