import type { Bucket } from '../functions/env.d.ts'

interface PageCache {
  match(key: Request): Promise<Response | undefined>
  put(key: Request, response: Response): Promise<void>
}

export interface CacheDeps {
  cache: PageCache
  bucket: Bucket
  /** The deployment's version id: a new deploy renames the JS and CSS files the HTML points at. */
  deploy: string
  waitUntil(promise: Promise<unknown>): void
}

// The Free plan allows 10 ms of CPU per request and a page render takes 5 to 40, so readers get a stored copy.
// The key holds data.json's etag: a save changes it, and the next request renders the new content.
const KEPT = 'public, max-age=604800'
// The stored copy keeps a week; the browser still gets the page's own Cache-Control, carried in this header.
const BROWSER = 'X-Page-Cache-Control'

/** The page from the data center's cache, or `render()` stored there when the page says it may be cached. */
export async function cachedPage(request: Request, deps: CacheDeps, render: () => Promise<Response>): Promise<Response> {
  if (request.method !== 'GET') return render()
  const data = await deps.bucket.head('data.json')
  const key = new URL(request.url)
  key.searchParams.set('__v', `${deps.deploy}.${data?.etag ?? 'none'}`)
  const keyRequest = new Request(key.href)

  const hit = await deps.cache.match(keyRequest)
  if (hit) {
    const page = new Response(hit.body, hit)
    page.headers.set('Cache-Control', hit.headers.get(BROWSER) ?? 'no-cache')
    page.headers.delete(BROWSER)
    page.headers.set('X-Page-Cache', 'hit')
    return page
  }

  const response = await render()
  const browser = response.headers.get('Cache-Control') ?? ''
  if (response.status !== 200 || !browser.startsWith('public')) return response
  const stored = new Response(response.clone().body, response)
  stored.headers.set('Cache-Control', KEPT)
  stored.headers.set(BROWSER, browser)
  deps.waitUntil(deps.cache.put(keyRequest, stored))
  const page = new Response(response.body, response)
  page.headers.set('X-Page-Cache', 'miss')
  return page
}
