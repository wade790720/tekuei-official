import type { Bucket } from '../functions/env.d.ts'

// In-memory stand-in for an R2 bucket, enough for functions/api: get returns a snapshot with etags,
// put honours onlyIf.etagMatches and returns null when it fails, like R2.
export function fakeR2(initial: Record<string, unknown> = {}) {
  const store = new Map<string, { body: string; etag: string }>()
  let version = 0
  const write = (key: string, body: string) => {
    const etag = `v${++version}`
    store.set(key, { body, etag })
    return { etag, httpEtag: `"${etag}"` }
  }
  for (const [key, value] of Object.entries(initial)) write(key, JSON.stringify(value))

  const bucket: Bucket = {
    async get(key) {
      const hit = store.get(key)
      if (!hit) return null
      const { body, etag } = hit
      return { etag, httpEtag: `"${etag}"`, body, text: async () => body, json: async () => JSON.parse(body) }
    },
    async head(key) {
      const hit = store.get(key)
      return hit ? { etag: hit.etag } : null
    },
    async put(key, body, opts) {
      await Promise.resolve()
      const cur = store.get(key)
      if (opts?.onlyIf?.etagMatches && cur?.etag !== opts.onlyIf.etagMatches) return null
      return write(key, typeof body === 'string' ? body : String(body))
    },
  }
  return {
    ...bucket,
    read(key: string): Record<string, unknown> {
      const hit = store.get(key)
      if (!hit) throw new Error(`${key} is not in the bucket`)
      return JSON.parse(hit.body)
    },
  }
}
