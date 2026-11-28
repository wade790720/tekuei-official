import { createRequestHandler, RouterContextProvider } from 'react-router'
import { cf } from '../src/lib/cf.server.ts'
import { servedPath } from '../src/lib/localePath.ts'
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
        // /en/ and /EN/Journal are the same pages as /en and /en/journal: one URL each.
        const url = new URL(request.url)
        const path = servedPath(url.pathname)
        if (path !== url.pathname) {
          url.pathname = path
          return Promise.resolve(Response.redirect(url.href, 301))
        }
        const context = new RouterContextProvider()
        context.set(cf, { env, ctx })
        return pages(request, context)
      },
    })
  },
} satisfies ExportedHandler<CloudflareBindings>
