import { createRequestHandler, RouterContextProvider } from 'react-router'
import { cf } from '../src/lib/cf.server.ts'
import { servedPath } from '../src/lib/localePath.ts'
import { onRequest as cors } from '../functions/_middleware.ts'
import { routeApi } from './api.ts'
import { cachedPage } from './htmlCache.ts'

const pages = createRequestHandler(() => import('virtual:react-router/server-build'), import.meta.env.MODE)

export default {
  fetch(request, env, ctx) {
    return cors({
      request,
      next: () => {
        const api = routeApi(request, env)
        if (api) return api
        const url = new URL(request.url)
        const path = servedPath(url.pathname)
        if (path !== url.pathname) {
          url.pathname = path
          return Promise.resolve(Response.redirect(url.href, 301))
        }
        const context = new RouterContextProvider()
        context.set(cf, { env, ctx })
        const deps = { cache: caches.default, bucket: env.BUCKET, deploy: env.CF_VERSION_METADATA.id, waitUntil: (p: Promise<unknown>) => ctx.waitUntil(p) }
        return cachedPage(request, deps, () => pages(request, context))
      },
    })
  },
} satisfies ExportedHandler<CloudflareBindings>
