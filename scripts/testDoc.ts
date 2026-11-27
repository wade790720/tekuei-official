import assert from 'node:assert/strict'
import type { Body, Doc } from '../src/lib/siteData.ts'

/** The node at `path` (child indexes from `doc`), failing the test when there is none. */
export function nodeAt(doc: Doc, ...path: number[]): Doc {
  return path.reduce((node, i) => {
    const child = node.content?.[i]
    assert.ok(child, `no node at [${path.join(', ')}]`)
    return child
  }, doc)
}

/** A stored body's Tiptap document, failing the test when the body is missing or old blocks. */
export function docOf(body: Body | undefined): Doc {
  assert.ok(body && 'doc' in body, 'a body with a doc')
  return body.doc
}
