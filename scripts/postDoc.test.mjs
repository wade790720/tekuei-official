import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { blocksToDoc, docText, getPostDoc, safeHref } from '../src/lib/postDoc.js'

describe('blocksToDoc', () => {
  it('converts every old block type and keeps card settings', () => {
    const doc = blocksToDoc([
      { type: 'lead', text: 'L' },
      { type: 'h2', text: 'H' },
      { type: 'p', text: 'P' },
      { type: 'quote', text: 'Q', attr: 'A' },
      { type: 'code', lang: 'bash', filename: 'run.sh', code: 'npm i' },
      { type: 'image', src: '/a.webp', alt: 'alt', caption: 'cap', frame: true },
      { type: 'video', src: '/v.mp4', loop: true },
    ])
    assert.deepEqual(
      doc.content.map((n) => n.type),
      ['lead', 'heading', 'paragraph', 'blockquote', 'codeBlock', 'imageCard', 'videoCard'],
    )
    assert.equal(doc.content[1].attrs.level, 2)
    assert.equal(doc.content[3].attrs.cite, 'A')
    assert.deepEqual(doc.content[4].attrs, { language: 'bash', filename: 'run.sh' })
    assert.equal(doc.content[5].attrs.frame, true)
    assert.equal(doc.content[6].attrs.loop, true)
    assert.equal(docText(doc), 'L\nH\nP\nQ\nnpm i\n\n')
  })

  it('never makes an empty text node and never returns an empty doc', () => {
    const doc = blocksToDoc([{ type: 'p', text: '' }])
    assert.deepEqual(doc.content[0], { type: 'paragraph', content: [] })
    assert.equal(blocksToDoc([]).content.length, 1)
  })
})

describe('getPostDoc', () => {
  it('prefers a saved doc over old blocks', () => {
    const doc = { type: 'doc', content: [] }
    assert.equal(getPostDoc({ doc, blocks: [{ type: 'p', text: 'x' }] }), doc)
    assert.equal(getPostDoc({ blocks: [{ type: 'p', text: 'x' }] }).content[0].type, 'paragraph')
    assert.equal(getPostDoc(undefined).type, 'doc')
  })
})

describe('safeHref', () => {
  it('keeps web, mail and same-site links', () => {
    assert.equal(safeHref('https://a.com'), 'https://a.com')
    assert.equal(safeHref('mailto:x@y.z'), 'mailto:x@y.z')
    assert.equal(safeHref('/journal'), '/journal')
    assert.equal(safeHref('#top'), '#top')
    assert.equal(safeHref('example.com/x'), 'https://example.com/x')
  })

  it('drops script and data links', () => {
    assert.equal(safeHref('javascript:alert(1)'), null)
    assert.equal(safeHref(' JavaScript:alert(1)'), null)
    assert.equal(safeHref('data:text/html,x'), null)
    assert.equal(safeHref(''), null)
  })

  it('turns protocol-relative links into https', () => {
    assert.equal(safeHref('//cdn.example.com/a.png'), 'https://cdn.example.com/a.png')
  })
})
