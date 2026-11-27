// Paste into the browser console (or run with a browser tool) on the local dev site BEFORE logging in.
// Local dev proxies /api to the live site, so a test save would write real data. This swaps every write
// for a fake answer and leaves reads alone. It lasts until the page reloads: paste it again after a reload,
// and clear sessionStorage when done so no fake login is left behind.
//
// After it runs, Ctrl+S and any six digits log in. window.__api lists the writes the page tried, with bodies
// and the answer each got. A save is refused with 409 when its If-Match is not the current version, as the
// real API does, so a stale editor shows up here too.
;(() => {
  const real = window.fetch.bind(window)
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
  let version = null // the ETag of data.json: the real one until the first fake save
  window.__api = []
  window.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href)
    const method = (init.method || 'GET').toUpperCase()
    if (!url.pathname.startsWith('/api/')) return real(input, init)
    if (method === 'GET') {
      const res = await real(input, init)
      if (url.pathname === '/api/data') version ??= res.headers.get('ETag')
      return res
    }
    const call = { method, path: url.pathname, body: typeof init.body === 'string' ? init.body : null, status: 200 }
    window.__api.push(call)
    if (url.pathname === '/api/admin/verify') return json({ ok: true })
    if (url.pathname === '/api/data') {
      const loaded = new Headers(init.headers).get('If-Match')
      if (loaded && version && loaded !== version) {
        call.status = 409
        return json({ error: 'Stale', stale: true }, 409)
      }
      version = `"fake-${window.__api.length}"`
      return json({ ok: true, etag: version })
    }
    if (url.pathname === '/api/upload') {
      return json({ url: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22100%22%3E%3Crect width=%22160%22 height=%22100%22 fill=%22%23888%22/%3E%3C/svg%3E' })
    }
    if (url.pathname === '/api/translate') return json({ texts: JSON.parse(init.body).texts.map((t) => `EN ${t}`) })
    return json({ error: 'not faked' }, 500)
  }
  return 'writes to /api are faked until this page reloads'
})()
