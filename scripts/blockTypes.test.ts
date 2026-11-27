import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { BLOCK_TYPES } from '../src/lib/richText.ts'
import type { BlockType } from '../src/lib/richText.ts'
import type { Doc } from '../src/lib/siteData.ts'
import { docHtml } from '../src/lib/seo.ts'

const x: Doc[] = [{ type: 'paragraph', content: [{ type: 'text', text: 'x' }] }]
const sample: Record<BlockType, Doc> = {
  paragraph: { type: 'paragraph', content: [{ type: 'text', text: 'x' }] },
  lead: { type: 'lead', content: [{ type: 'text', text: 'x' }] },
  heading: { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'x' }] },
  blockquote: { type: 'blockquote', content: x },
  bulletList: { type: 'bulletList', content: [{ type: 'listItem', content: x }] },
  orderedList: { type: 'orderedList', content: [{ type: 'listItem', content: x }] },
  listItem: { type: 'listItem', content: x },
  codeBlock: { type: 'codeBlock', content: [{ type: 'text', text: 'x' }] },
  imageCard: { type: 'imageCard', attrs: { src: 'a.webp', alt: 'x' } },
  videoCard: { type: 'videoCard', attrs: { src: 'https://youtu.be/geP1C28wCeE', caption: 'x' } },
  slidesCard: { type: 'slidesCard', attrs: { slides: [{ src: 'a.webp', alt: 'x' }] } },
  horizontalRule: { type: 'horizontalRule' },
}

describe('block types', () => {
  it('every block the page renders also has its own markup in the crawler HTML', () => {
    const fallback = docHtml({ type: 'unknownBlock', content: x })
    for (const type of BLOCK_TYPES) {
      assert.notEqual(docHtml(sample[type]), fallback, `${type} falls through to the unknown-node fallback`)
    }
  })
})
