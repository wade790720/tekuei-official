import { createRequestHandler, RouterContextProvider } from 'react-router'
import { cf } from '../src/lib/cf.server.ts'
import { onRequest as cors } from '../functions/_middleware.ts'
import { routeApi } from './api.ts'

const pages = createRequestHandler(() => import('virtual:react-router/server-build'), import.meta.env.MODE)

export default {
  fetch(request, env, ctx) {
    return cors({
      request,
      next: () => {
        const api = routeApi(request, env)
        if (api) return api
        // Page URLs have no trailing slash: /en/ and /journal/ are the same pages as /en and /journal.
        const url = new URL(request.url)
        if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
          url.pathname = url.pathname.replace(/\/+$/, '') || '/'
          return Promise.resolve(Response.redirect(url.href, 301))
        }
        const context = new RouterContextProvider()
        context.set(cf, { env, ctx })
        return pages(request, context)
      },
    })
  },
} satisfies ExportedHandler<CloudflareBindings>
