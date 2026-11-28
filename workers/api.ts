import * as data from '../functions/api/data.ts'
import * as upload from '../functions/api/upload.ts'
import * as file from '../functions/api/file/[[path]].ts'
import * as translate from '../functions/api/translate.ts'
import * as verify from '../functions/api/admin/verify.ts'
import type { ApiContext, Env } from '../functions/env.d.ts'

type Handler = (context: ApiContext) => Promise<Response>
interface Methods {
  GET?: Handler
  PUT?: Handler
  POST?: Handler
}

// The Pages Functions file routes, written out: the handlers are unchanged and still take { request, env }.
const API: Record<string, Methods> = {
  '/api/data': { GET: data.onRequestGet, PUT: data.onRequestPut },
  '/api/upload': { POST: upload.onRequestPost },
  '/api/translate': { POST: translate.onRequestPost },
  '/api/admin/verify': { POST: verify.onRequestPost },
}
const FILE: Methods = { GET: file.onRequestGet }

/** The response of the functions/ handler for this URL, or undefined when React Router renders it. */
export function routeApi(request: Request, env: Env): Promise<Response> | undefined {
  const { pathname } = new URL(request.url)
  const methods = API[pathname] ?? (pathname.startsWith('/api/file/') ? FILE : undefined)
  if (!methods) return undefined
  const method = request.method === 'HEAD' ? 'GET' : request.method
  const handler = method === 'GET' || method === 'PUT' || method === 'POST' ? methods[method] : undefined
  // A method the handler file does not export. Pages served the SPA shell (200) here; 405 says what happened.
  return handler ? handler({ request, env }) : Promise.resolve(new Response(null, { status: 405 }))
}
