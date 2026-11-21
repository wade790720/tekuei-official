// In-memory stand-in for an R2 bucket, enough for functions/api: get returns a snapshot with etags,
// put honours onlyIf.etagMatches and returns null when it fails, like R2.
export function fakeR2(initial = {}) {
  const store = new Map()
  let version = 0
  const write = (key, body) => {
    const etag = `v${++version}`
    store.set(key, { body, etag })
    return { etag, httpEtag: `"${etag}"` }
  }
  for (const [key, value] of Object.entries(initial)) write(key, JSON.stringify(value))

  return {
    async get(key) {
      const hit = store.get(key)
      if (!hit) return null
      const { body, etag } = hit
      return { etag, httpEtag: `"${etag}"`, body, text: async () => body, json: async () => JSON.parse(body) }
    },
    async put(key, body, opts) {
      await Promise.resolve() // let a parallel caller read first, like a real network round trip
      const cur = store.get(key)
      if (opts?.onlyIf?.etagMatches && cur?.etag !== opts.onlyIf.etagMatches) return null
      return write(key, typeof body === 'string' ? body : String(body))
    },
    read: (key) => JSON.parse(store.get(key).body),
  }
}
