import assert from 'node:assert/strict'
import { it } from 'node:test'
import { saveSitePatch } from '../src/lib/adminApi.ts'

// R2 etags are content hashes: saving, then putting the same content back, returns an earlier etag.
it('a save after content returns to an earlier version sends that version, and does not hang', { timeout: 2000 }, async () => {
  const answers = ['B', 'A', 'B']
  const sent: (string | null)[] = []
  globalThis.fetch = async (_url, init) => {
    sent.push(new Headers(init?.headers).get('If-Match'))
    return Response.json({ etag: answers[sent.length - 1] })
  }
  let etag: string | null = 'A'
  for (let i = 0; i < 3; i++) etag = (await saveSitePatch({}, 'code', etag)).etag
  assert.deepEqual(sent, ['A', 'B', 'A'])
  assert.equal(etag, 'B')
})

it('a section that loaded an older version of this tab saves against the tab’s latest one', { timeout: 2000 }, async () => {
  const sent: (string | null)[] = []
  globalThis.fetch = async (_url, init) => {
    sent.push(new Headers(init?.headers).get('If-Match'))
    return Response.json({ etag: `v${sent.length}` })
  }
  await saveSitePatch({}, 'code', 'v0')
  await saveSitePatch({}, 'code', 'v0')
  await saveSitePatch({}, 'code', 'other-device')
  assert.deepEqual(sent, ['v0', 'v1', 'other-device'])
})
