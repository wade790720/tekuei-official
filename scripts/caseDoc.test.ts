import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { caseDoc } from '../src/lib/caseDoc.ts'
import type { CaseWithImages } from '../src/lib/caseDoc.ts'
import { nodeAt } from './testDoc.ts'

const section = { num: '01', label: 'L' }
const data: CaseWithImages = {
  slug: 'case',
  hero: { num: '01', titleRest: 'Case', subtitle: '', bg: '', meta: [], image: { url: '' } },
  videos: [{ src: 'v.mp4', poster: 'v.webp', caption: 'Home' }],
  media: { fullWidthLabel: '', fullWidthBg: '', inlineLabel: '', fullWidthImage: { url: '' }, inlineImage: { url: '/i.webp' } },
  sections: {
    overview: { ...section, title: 'Background', prose: ['One'], quote: { text: 'Q', attr: 'A' } },
    challenge: { ...section, title: 'Challenge', prose: [], deliverables: [{ num: '01', name: 'N', desc: 'D' }] },
    approach: { ...section, title: 'Approach', prose: [], timeline: [{ phase: 'Phase 01', title: 'T', desc: 'D' }] },
    deliverables: { ...section, title: 'Deliverables', items: [] },
    result: { ...section, title: 'Result', prose: ['End'] },
  },
}

describe('caseDoc', () => {
  it('keeps every section in order and leaves out a picture that has no file', () => {
    const doc = caseDoc(data, 'en')
    const types = doc.content?.map((n) => n.type)
    assert.deepEqual(types, ['heading', 'paragraph', 'blockquote', 'videoCard', 'heading', 'bulletList', 'heading', 'bulletList', 'imageCard', 'heading', 'heading', 'paragraph'])
    assert.equal(nodeAt(doc, 5, 0, 0, 0).text, 'N: D')
    assert.equal(nodeAt(doc, 7, 0, 0, 0).text, 'Phase 01 T: D')
    assert.equal(nodeAt(doc, 2).attrs?.cite, 'A')
  })
})
