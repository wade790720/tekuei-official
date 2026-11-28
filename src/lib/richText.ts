import type { Body, Doc, LegacyBlock } from './siteData.ts'

/** Every block node a body can hold. RichText renders all of them. */
export const BLOCK_TYPES = [
  'paragraph',
  'lead',
  'heading',
  'blockquote',
  'bulletList',
  'orderedList',
  'listItem',
  'codeBlock',
  'imageCard',
  'videoCard',
  'slidesCard',
  'horizontalRule',
] as const
export type BlockType = (typeof BLOCK_TYPES)[number]
export const isBlockType = (t: string | undefined): t is BlockType => BLOCK_TYPES.some((b) => b === t)

const text = (t: string | undefined): Doc[] => (t ? [{ type: 'text', text: t }] : [])

/** @param blocks old block list */
export function blocksToDoc(blocks: LegacyBlock[] = []): Doc {
  const content = blocks.map((b): Doc => {
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

export const emptyDoc = (): Doc => ({ type: 'doc', content: [{ type: 'paragraph' }] })

/** @param body one post's stored body */
export function getDoc(body: Body | null | undefined): Doc {
  if (body && 'doc' in body && body.doc) return body.doc
  return blocksToDoc(body && 'blocks' in body ? body.blocks : undefined)
}

/**
 * Only http(s), mailto, tel, in-page and same-site links. Anything else (javascript:, data:) is dropped.
 */
export function safeHref(href: string | null | undefined): string | null {
  const h = String(href ?? '').trim()
  if (!h) return null
  if (/^(https?:|mailto:|tel:)/i.test(h)) return h
  if (h.startsWith('//')) return `https:${h}` // protocol-relative
  if (/^[/#?]/.test(h)) return h
  if (/^[a-z][a-z0-9+.-]*:/i.test(h)) return null // another scheme
  return `https://${h}` // "example.com/page" typed without a scheme
}

/**
 * The video id of a YouTube watch, share (youtu.be), Shorts, live or embed link. Null for anything else,
 * so a videoCard src that is a file (mp4) plays in the site's own player instead.
 */
export function youtubeId(src: string | null | undefined): string | null {
  let url
  try {
    url = new URL(String(src ?? '').trim())
  } catch {
    return null
  }
  const host = url.hostname.replace(/^(www|m|music)\./, '')
  let id: string | null | undefined = null
  if (host === 'youtu.be') id = url.pathname.split('/')[1]
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = url.searchParams.get('v') ?? url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1]
  }
  return id && /^[\w-]{11}$/.test(id) ? id : null
}

/**
 * Whether a stored body, or a doc, has anything to show: text, or a picture, video or picture set.
 * The editor starts every translation as one empty paragraph, so "has a key" is not "has a body".
 */
export function hasBody(c: Body | Doc | null | undefined): boolean {
  if (!c) return false
  if ('blocks' in c && c.blocks) return c.blocks.length > 0
  return /"text":"[^"]|"type":"(imageCard|videoCard|slidesCard)"/.test(JSON.stringify(('doc' in c && c.doc) || c))
}

/** Plain text of a doc, for word counts and descriptions. */
export function docText(node: Doc | null | undefined): string {
  if (!node) return ''
  if (node.type === 'text') return node.text ?? ''
  return (node.content ?? []).map(docText).join(node.type === 'doc' ? '\n' : '')
}
