import { createRequestHandler, RouterContextProvider } from 'react-router'
import { cf } from '../src/lib/cf.server.ts'
import { onRequest as cors } from '../functions/_middleware.ts'
import * as data from '../functions/api/data.ts'
import * as upload from '../functions/api/upload.ts'
import * as file from '../functions/api/file/[[path]].ts'
import * as translate from '../functions/api/translate.ts'
import * as verify from '../functions/api/admin/verify.ts'
import * as sitemap from '../functions/sitemap.xml.ts'
import * as llms from '../functions/llms.txt.ts'
import type { ApiContext } from '../functions/env.d.ts'

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
  '/sitemap.xml': { GET: sitemap.onRequestGet },
  '/llms.txt': { GET: llms.onRequestGet },
}
const FILE: Methods = { GET: file.onRequestGet }

function apiRoute(pathname: string): Methods | undefined {
  return API[pathname] ?? (pathname.startsWith('/api/file/') ? FILE : undefined)
}

const pages = createRequestHandler(() => import('virtual:react-router/server-build'), import.meta.env.MODE)

export default {
  fetch(request, env, ctx) {
    return cors({
      request,
      next: () => {
        const methods = apiRoute(new URL(request.url).pathname)
        if (methods) {
          const method = request.method === 'HEAD' ? 'GET' : request.method
          const handler = method === 'GET' || method === 'PUT' || method === 'POST' ? methods[method] : undefined
          // Pages answered a method a file did not export with 405.
          return handler ? handler({ request, env }) : Promise.resolve(new Response(null, { status: 405 }))
        }
        const context = new RouterContextProvider()
        context.set(cf, { env, ctx })
        return pages(request, context)
      },
    })
  },
} satisfies ExportedHandler<CloudflareBindings>
