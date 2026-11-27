import { createContext } from 'react-router'
import type { Env } from '../../functions/env.d.ts'

/** The Worker's bindings and execution context, set per request in workers/app.ts. */
export const cf = createContext<{ env: Env; ctx: { waitUntil(promise: Promise<unknown>): void } }>()
