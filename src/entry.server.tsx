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
  await body.allReady

  return new Response(body, { headers: responseHeaders, status: responseStatusCode })
}
