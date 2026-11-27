import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { caseDoc } from '../src/lib/caseDoc.ts'

const data = {
  videos: [{ src: 'v.mp4', poster: 'v.webp', caption: 'Home' }],
  media: { fullWidthImage: { url: '' }, inlineImage: { url: '/i.webp' } },
  sections: {
    overview: { title: 'Background', prose: ['One'], quote: { text: 'Q', attr: 'A' } },
    challenge: { title: 'Challenge', prose: [], deliverables: [{ num: '01', name: 'N', desc: 'D' }] },
    approach: { title: 'Approach', prose: [], timeline: [{ phase: 'Phase 01', title: 'T', desc: 'D' }] },
    deliverables: { title: 'Deliverables', items: [] },
    result: { title: 'Result', prose: ['End'] },
  },
}

describe('caseDoc', () => {
  it('keeps every section in order and leaves out a picture that has no file', () => {
    const doc = caseDoc(data, 'en')
    const types = doc.content.map((n) => n.type)
    assert.deepEqual(types, ['heading', 'paragraph', 'blockquote', 'videoCard', 'heading', 'bulletList', 'heading', 'bulletList', 'imageCard', 'heading', 'heading', 'paragraph'])
    assert.equal(doc.content[5].content[0].content[0].content[0].text, 'N: D')
    assert.equal(doc.content[7].content[0].content[0].content[0].text, 'Phase 01 T: D')
    assert.equal(doc.content[2].attrs.cite, 'A')
  })
})
