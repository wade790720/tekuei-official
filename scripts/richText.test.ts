import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { blocksToDoc, docText, getDoc, hasBody, safeHref, youtubeId } from '../src/lib/richText.ts'
import { nodeAt } from './testDoc.ts'

describe('youtubeId', () => {
  it('reads share, watch, Shorts and embed links', () => {
    assert.equal(youtubeId('https://youtu.be/geP1C28wCeE?si=luwM46zzgBLTer-n'), 'geP1C28wCeE')
    assert.equal(youtubeId('https://www.youtube.com/watch?v=geP1C28wCeE&t=30s'), 'geP1C28wCeE')
    assert.equal(youtubeId('https://m.youtube.com/watch?v=geP1C28wCeE'), 'geP1C28wCeE')
    assert.equal(youtubeId('https://youtube.com/shorts/geP1C28wCeE'), 'geP1C28wCeE')
    assert.equal(youtubeId('https://www.youtube-nocookie.com/embed/geP1C28wCeE'), 'geP1C28wCeE')
  })

  it('returns null for files, other sites and broken input', () => {
    assert.equal(youtubeId('https://example.com/clip.mp4'), null)
    assert.equal(youtubeId('/api/file/clip.mp4'), null)
    assert.equal(youtubeId('https://vimeo.com/123456'), null)
    assert.equal(youtubeId('https://youtu.be/'), null)
    assert.equal(youtubeId('https://youtube.com/watch?v=bad<id>'), null)
    assert.equal(youtubeId(''), null)
    assert.equal(youtubeId(undefined), null)
  })
})

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
      doc.content?.map((n) => n.type),
      ['lead', 'heading', 'paragraph', 'blockquote', 'codeBlock', 'imageCard', 'videoCard'],
    )
    assert.equal(nodeAt(doc, 1).attrs?.level, 2)
    assert.equal(nodeAt(doc, 3).attrs?.cite, 'A')
    assert.deepEqual(nodeAt(doc, 4).attrs, { language: 'bash', filename: 'run.sh' })
    assert.equal(nodeAt(doc, 5).attrs?.frame, true)
    assert.equal(nodeAt(doc, 6).attrs?.loop, true)
    assert.equal(docText(doc), 'L\nH\nP\nQ\nnpm i\n\n')
  })

  it('never makes an empty text node and never returns an empty doc', () => {
    const doc = blocksToDoc([{ type: 'p', text: '' }])
    assert.deepEqual(nodeAt(doc, 0), { type: 'paragraph', content: [] })
    assert.equal(blocksToDoc([]).content?.length, 1)
  })
})

describe('getDoc', () => {
  it('prefers a saved doc over old blocks', () => {
    const doc = { type: 'doc', content: [] }
    assert.equal(getDoc({ doc, blocks: [{ type: 'p', text: 'x' }] }), doc)
    assert.equal(nodeAt(getDoc({ blocks: [{ type: 'p', text: 'x' }] }), 0).type, 'paragraph')
    assert.equal(getDoc(undefined).type, 'doc')
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

describe('hasBody', () => {
  it('counts a picture set with no text as a body, and an empty paragraph as none', () => {
    assert.equal(hasBody({ doc: { type: 'doc', content: [{ type: 'paragraph' }] } }), false)
    assert.equal(hasBody({ type: 'doc', content: [{ type: 'slidesCard', attrs: { slides: [] } }] }), true)
    assert.equal(hasBody({ doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'a' }] }] } }), true)
    assert.equal(hasBody(undefined), false)
  })
})
