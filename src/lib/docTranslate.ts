import type { Doc } from './siteData.ts'

/** One string to translate, and where the translation goes. */
export interface Slot {
  text: string
  set: (translated: string) => void
}

const HAN = /\p{Script=Han}/u
const INLINE = new Set(['text', 'hardBreak'])
const ATTR_TEXT: Record<string, string[]> = { imageCard: ['alt', 'caption'], videoCard: ['caption'], slidesCard: ['title', 'text'], blockquote: ['cite'] }
export const BATCH_CHARS = 6000
export const BATCH_TEXTS = 300

const escapeText = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const unescapeText = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

function encodeInline(nodes: Doc[]) {
  return nodes
    .map((n, i) => {
      if (n.type === 'hardBreak') return '<br/>'
      const text = escapeText(n.text ?? '')
      return n.marks?.length ? `<t${i}>${text}</t${i}>` : text
    })
    .join('')
}

function decodeInline(source: string, nodes: Doc[]) {
  const out: Doc[] = []
  const push = (raw: string, marks?: Doc['marks']) => {
    const text = unescapeText(raw.replace(/<\/?t\d+>/g, ''))
    if (text) out.push(marks?.length ? { type: 'text', text, marks } : { type: 'text', text })
  }
  const token = /<br\s*\/?>|<t(\d+)>([\s\S]*?)<\/t\1>/g
  let at = 0
  for (const m of source.matchAll(token)) {
    push(source.slice(at, m.index))
    if (m[1] === undefined) out.push({ type: 'hardBreak' })
    else push(m[2] ?? '', nodes[Number(m[1])]?.marks)
    at = m.index + m[0].length
  }
  push(source.slice(at))
  return out
}

/**
 * @param doc  left untouched
 * @returns a copy of the doc, and one slot per string with Chinese in it; `set` writes into the copy
 */
export function docSlots(doc: Doc): { doc: Doc; slots: Slot[] } {
  const copy = structuredClone(doc)
  const slots: Slot[] = []
  const add = (text: string, set: Slot['set']) => {
    if (HAN.test(text)) slots.push({ text, set })
  }
  const addAttr = (owner: Record<string, unknown>, key: string) => {
    const value = owner[key]
    if (typeof value === 'string' && value) add(escapeText(value), (t) => (owner[key] = unescapeText(t.replace(/<[^>]*>/g, ''))))
  }

  const walk = (node: Doc) => {
    if (node.type === 'codeBlock') return
    for (const key of ATTR_TEXT[node.type ?? ''] ?? []) if (node.attrs) addAttr(node.attrs, key)
    if (node.type === 'slidesCard') {
      for (const slide of node.attrs?.slides ?? []) {
        addAttr(slide, 'alt')
        addAttr(slide, 'caption')
      }
    }
    const kids = node.content
    if (!kids?.length) return
    if (kids.every((k) => INLINE.has(k.type ?? ''))) {
      add(encodeInline(kids), (t) => {
        const next = decodeInline(t, kids)
        if (next.length) node.content = next
      })
    } else kids.forEach(walk)
  }
  walk(copy)
  return { doc: copy, slots }
}

/** Splits strings into runs of at most `limit` characters and `max` strings, in order. A longer string gets a batch of its own. */
export function batchTexts(texts: string[], limit = BATCH_CHARS, max = BATCH_TEXTS): string[][] {
  const batches: string[][] = []
  let batch: string[] = []
  let size = 0
  for (const t of texts) {
    if (!batches.length || size + t.length > limit || batch.length >= max) {
      batch = []
      batches.push(batch)
      size = 0
    }
    batch.push(t)
    size += t.length
  }
  return batches
}
