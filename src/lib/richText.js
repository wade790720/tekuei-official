// Journal post bodies are Tiptap (ProseMirror) JSON documents: { type: 'doc', content: [...] }.
// Older posts stored { blocks: [...] }; getDoc converts them on read, and the editor saves a doc.
//
// Node types: paragraph, lead, heading (level 2 | 3), blockquote (attrs.cite), bulletList, orderedList,
// listItem, codeBlock (attrs.language, attrs.filename), imageCard, videoCard,
// slidesCard (attrs.slides: [{ src, alt, caption }]), horizontalRule, hardBreak, text.
// Marks: bold, italic, underline, strike, code, link (attrs.href).

const text = (t) => (t ? [{ type: 'text', text: t }] : [])

/** @param {any[]} blocks old block list */
export function blocksToDoc(blocks = []) {
  const content = blocks.map((b) => {
    switch (b.type) {
      case 'lead':
        return { type: 'lead', content: text(b.text) }
      case 'h2':
        return { type: 'heading', attrs: { level: 2 }, content: text(b.text) }
      case 'quote':
        return {
          type: 'blockquote',
          attrs: { cite: b.attr || '' },
          content: [{ type: 'paragraph', content: text(b.text) }],
        }
      case 'code':
        return {
          type: 'codeBlock',
          attrs: { language: b.lang || 'ts', filename: b.filename || '' },
          content: text(b.code),
        }
      case 'image':
        return {
          type: 'imageCard',
          attrs: { src: b.src || '', alt: b.alt || '', caption: b.caption || '', frame: Boolean(b.frame) },
        }
      case 'video':
        return {
          type: 'videoCard',
          attrs: { src: b.src || '', poster: b.poster || '', caption: b.caption || '', loop: Boolean(b.loop) },
        }
      default:
        return { type: 'paragraph', content: text(b.text) }
    }
  })
  return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] }
}

export const emptyDoc = () => ({ type: 'doc', content: [{ type: 'paragraph' }] })

/** @param {{ doc?: object, blocks?: any[] } | null | undefined} body one post's stored body */
export function getDoc(body) {
  if (body?.doc) return body.doc
  return blocksToDoc(body?.blocks)
}

/**
 * Only http(s), mailto, tel, in-page and same-site links. Anything else (javascript:, data:) is dropped.
 * @param {string | undefined} href
 * @returns {string | null}
 */
export function safeHref(href) {
  const h = String(href ?? '').trim()
  if (!h) return null
  if (/^(https?:|mailto:|tel:)/i.test(h)) return h
  if (h.startsWith('//')) return `https:${h}` // protocol-relative
  if (/^[/#?]/.test(h)) return h
  if (/^[a-z][a-z0-9+.-]*:/i.test(h)) return null // another scheme
  return `https://${h}` // "example.com/page" typed without a scheme
}

/** Plain text of a doc, for word counts and checks. */
export function docText(node) {
  if (!node) return ''
  if (node.type === 'text') return node.text ?? ''
  return (node.content ?? []).map(docText).join(node.type === 'doc' ? '\n' : '')
}
