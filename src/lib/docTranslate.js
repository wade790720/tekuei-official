// Picks the text to translate out of a Tiptap doc and puts the translation back, leaving images, code and layout alone.
// One block is one string, so a sentence with a bold word is translated whole. Marks travel as <t0>…</t0>, line breaks as <br/>.

const HAN = /\p{Script=Han}/u
const INLINE = new Set(['text', 'hardBreak'])
const ATTR_TEXT = { imageCard: ['alt', 'caption'], videoCard: ['caption'], slidesCard: ['title', 'text'], blockquote: ['cite'] }
export const BATCH_CHARS = 6000

const escapeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const unescapeText = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

function encodeInline(nodes) {
  return nodes
    .map((n, i) => {
      if (n.type === 'hardBreak') return '<br/>'
      return n.marks?.length ? `<t${i}>${escapeText(n.text)}</t${i}>` : escapeText(n.text)
    })
    .join('')
}

function decodeInline(source, nodes) {
  const out = []
  const push = (raw, marks) => {
    const text = unescapeText(raw.replace(/<\/?t\d+>/g, ''))
    if (text) out.push(marks?.length ? { type: 'text', text, marks } : { type: 'text', text })
  }
  const token = /<br\s*\/?>|<t(\d+)>([\s\S]*?)<\/t\1>/g
  let at = 0
  for (const m of source.matchAll(token)) {
    push(source.slice(at, m.index))
    if (m[1] === undefined) out.push({ type: 'hardBreak' })
    else push(m[2], nodes[Number(m[1])]?.marks)
    at = m.index + m[0].length
  }
  push(source.slice(at))
  return out
}

/**
 * @param {object} doc  left untouched
 * @returns {{ doc: object, slots: { text: string, set: (translated: string) => void }[] }}
 *   a copy of the doc, and one slot per string with Chinese in it; `set` writes into the copy
 */
export function docSlots(doc) {
  const copy = structuredClone(doc)
  const slots = []
  const add = (text, set) => {
    if (HAN.test(text)) slots.push({ text, set })
  }
  const addAttr = (owner, key) => {
    if (owner[key]) add(escapeText(owner[key]), (t) => (owner[key] = unescapeText(t.replace(/<[^>]*>/g, ''))))
  }

  const walk = (node) => {
    if (node.type === 'codeBlock') return
    for (const key of ATTR_TEXT[node.type] ?? []) if (node.attrs) addAttr(node.attrs, key)
    if (node.type === 'slidesCard') {
      for (const slide of node.attrs?.slides ?? []) {
        addAttr(slide, 'alt')
        addAttr(slide, 'caption')
      }
    }
    const kids = node.content
    if (!kids?.length) return
    if (kids.every((k) => INLINE.has(k.type))) {
      add(encodeInline(kids), (t) => {
        const next = decodeInline(t, kids)
        if (next.length) node.content = next
      })
    } else kids.forEach(walk)
  }
  walk(copy)
  return { doc: copy, slots }
}

/** Splits strings into runs of at most `limit` characters, in order. A longer string gets a batch of its own. */
export function batchTexts(texts, limit = BATCH_CHARS) {
  const batches = []
  let size = 0
  for (const t of texts) {
    if (!batches.length || size + t.length > limit) {
      batches.push([])
      size = 0
    }
    batches.at(-1).push(t)
    size += t.length
  }
  return batches
}
