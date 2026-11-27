import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { CodeBlock } from './CodeBlock.tsx'
import { ImageCard } from './ImageCard.tsx'
import { Carousel } from './Carousel.tsx'
import type { Slide } from './Carousel.tsx'
import { FeaturedPhotos } from './FeaturedPhotos.tsx'
import { Gallery } from './Gallery.tsx'
import { ScrollStack } from './ScrollStack.tsx'
import { VideoPlayer } from './VideoPlayer.tsx'
import { isBlockType, safeHref } from '../lib/richText.ts'
import type { BlockType } from '../lib/richText.ts'
import type { Doc } from '../lib/siteData.ts'

// Renders a post body (Tiptap JSON, see src/lib/richText.ts) as the article markup.
// Each top-level node fades in on its own, as the old blocks did.
// Tiptap types attrs as any; every read goes through str() or slidesOf() so a stored value of the wrong type is dropped.

type Mark = NonNullable<Doc['marks']>[number]

const str = (v: unknown) => (typeof v === 'string' ? v : undefined)

function slidesOf(v: unknown): Slide[] {
  if (!Array.isArray(v)) return []
  return v.flatMap((s: unknown) => {
    if (typeof s !== 'object' || s === null || !('src' in s)) return []
    const src = str(s.src)
    if (!src) return []
    return [{ src, alt: ('alt' in s && str(s.alt)) || '', caption: 'caption' in s ? str(s.caption) : undefined }]
  })
}

function wrapMark(mark: Mark, child: ReactNode, key: number): ReactNode {
  switch (mark.type) {
    case 'bold':
      return <strong key={key}>{child}</strong>
    case 'italic':
      return <em key={key}>{child}</em>
    case 'underline':
      return <u key={key}>{child}</u>
    case 'strike':
      return <s key={key}>{child}</s>
    case 'code':
      return (
        <code key={key} className="journal-post__code">
          {child}
        </code>
      )
    case 'link': {
      const href = safeHref(str(mark.attrs?.href))
      if (!href) return child
      const external = /^https?:/i.test(href)
      return (
        <a key={key} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {child}
        </a>
      )
    }
    default:
      return child
  }
}

function inline(nodes: Doc[] = []) {
  return nodes.map((n, i) => {
    if (n.type === 'hardBreak') return <br key={i} />
    if (n.type !== 'text') return null
    return <Fragment key={i}>{(n.marks ?? []).reduceRight<ReactNode>((child, mark, m) => wrapMark(mark, child, m), n.text)}</Fragment>
  })
}

function textOf(node: Doc) {
  return (node.content ?? []).map((n) => (n.type === 'text' ? n.text : n.type === 'hardBreak' ? '\n' : '')).join('')
}

function Node({ node }: { node: Doc }) {
  const a: Record<string, unknown> = node.attrs ?? {}
  // An unknown node renders as a paragraph, like an empty one.
  const type: BlockType = isBlockType(node.type) ? node.type : 'paragraph'
  switch (type) {
    case 'lead':
      return <p className="journal-post__lead">{inline(node.content)}</p>
    case 'heading':
      return a.level === 3 ? (
        <h3 className="journal-post__h3">{inline(node.content)}</h3>
      ) : (
        <h2 className="journal-post__h2">{inline(node.content)}</h2>
      )
    case 'blockquote': {
      const cite = str(a.cite)
      return (
        <blockquote className="journal-post__quote">
          {(node.content ?? []).map((c, i) => (
            <Node key={i} node={c} />
          ))}
          {cite ? <cite>{cite}</cite> : null}
        </blockquote>
      )
    }
    case 'bulletList':
    case 'orderedList': {
      const List = type === 'bulletList' ? 'ul' : 'ol'
      return (
        <List className="journal-post__list">
          {(node.content ?? []).map((li, i) => (
            <li key={i}>
              {(li.content ?? []).map((c, j) => (
                <Node key={j} node={c} />
              ))}
            </li>
          ))}
        </List>
      )
    }
    case 'codeBlock':
      return <CodeBlock code={textOf(node)} lang={str(a.language) || 'ts'} filename={str(a.filename) || undefined} />
    case 'imageCard': {
      const src = str(a.src)
      return src ? <ImageCard src={src} alt={str(a.alt) ?? ''} caption={str(a.caption)} frame={Boolean(a.frame)} /> : null
    }
    case 'videoCard': {
      const src = str(a.src)
      return src ? <VideoPlayer src={src} poster={str(a.poster) || undefined} caption={str(a.caption)} loop={Boolean(a.loop)} /> : null
    }
    case 'slidesCard': {
      const slides = slidesOf(a.slides)
      if (!slides.length) return null
      if (a.layout === 'work') return <FeaturedPhotos title={str(a.title)} text={str(a.text)} photos={slides} />
      if (a.layout === 'gallery') return <Gallery photos={slides} limit={a.collapsed ? 5 : undefined} />
      if (a.layout === 'stack') {
        return (
          <ScrollStack className="post-stack" rail={false}>
            {slides.map((s, i) => (
              <figure className="post-stack__card" key={`${s.src}-${i}`}>
                <img src={s.src} alt={s.alt} loading="lazy" decoding="async" />
                <figcaption>
                  <span>{s.caption}</span>
                  <span className="post-stack__num">{`${String(i + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`}</span>
                </figcaption>
              </figure>
            ))}
          </ScrollStack>
        )
      }
      return <Carousel slides={slides} />
    }
    case 'horizontalRule':
      return <hr className="journal-post__hr" />
    case 'paragraph':
    case 'listItem':
      // An empty paragraph is a blank line Wade left on purpose; the editor shows it one line tall.
      return <p className="journal-post__p">{node.content?.length ? inline(node.content) : <br />}</p>
    default: {
      const unhandled: never = type
      return unhandled
    }
  }
}

export function RichText({ doc }: { doc: Doc }) {
  return (doc.content ?? []).map((node, i) => (
    <div key={i}>
      <Node node={node} />
    </div>
  ))
}
