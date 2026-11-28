import type { EntryContext } from 'react-router'
import { ServerRouter } from 'react-router'
import { renderToReadableStream } from 'react-dom/server'

const STREAM_TIMEOUT_MS = 5_000

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  // https://httpwg.org/specs/rfc9110.html#HEAD
  responseHeaders.set('Content-Type', 'text/html; charset=utf-8')
  // A 404, a 503 from R2 or a failed render is never cached: the page may be there on the next request.
  if (responseStatusCode >= 400) responseHeaders.set('Cache-Control', 'no-store')
  if (request.method.toUpperCase() === 'HEAD') {
    return new Response(null, { status: responseStatusCode, headers: responseHeaders })
  }

  let shellRendered = false
  const body = await renderToReadableStream(<ServerRouter context={routerContext} url={request.url} />, {
    signal: AbortSignal.timeout(STREAM_TIMEOUT_MS + 1000),
    onError(error: unknown) {
      responseStatusCode = 500
      // An error before the shell rejects renderToReadableStream and React Router logs it.
      if (shellRendered) console.error(error)
    },
  })
  shellRendered = true
  // Readers and crawlers get the same complete HTML, so nothing is decided by user agent.
  await body.allReady

  return new Response(body, { headers: responseHeaders, status: responseStatusCode })
}
