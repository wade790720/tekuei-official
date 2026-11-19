import { Fragment } from 'react'
import { FadeIn } from './FadeIn.jsx'
import { CodeCard } from './CodeCard.jsx'
import { ImageCard } from './ImageCard.jsx'
import { SlidesCard } from './SlidesCard.jsx'
import { VideoCard } from './VideoCard.jsx'
import { safeHref } from '../lib/richText.js'

// Renders a post body (Tiptap JSON, see src/lib/richText.js) as the article markup.
// Each top-level node fades in on its own, as the old blocks did.

function wrapMark(mark, child, key) {
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
      const href = safeHref(mark.attrs?.href)
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

function inline(nodes = []) {
  return nodes.map((n, i) => {
    if (n.type === 'hardBreak') return <br key={i} />
    if (n.type !== 'text') return null
    return <Fragment key={i}>{(n.marks ?? []).reduceRight((child, mark, m) => wrapMark(mark, child, m), n.text)}</Fragment>
  })
}

function textOf(node) {
  return (node.content ?? []).map((n) => (n.type === 'text' ? n.text : n.type === 'hardBreak' ? '\n' : '')).join('')
}

function Node({ node }) {
  const a = node.attrs ?? {}
  switch (node.type) {
    case 'lead':
      return <p className="journal-post__lead">{inline(node.content)}</p>
    case 'heading':
      return a.level === 3 ? (
        <h3 className="journal-post__h3">{inline(node.content)}</h3>
      ) : (
        <h2 className="journal-post__h2">{inline(node.content)}</h2>
      )
    case 'blockquote':
      return (
        <blockquote className="journal-post__quote">
          {(node.content ?? []).map((c, i) => (
            <Node key={i} node={c} />
          ))}
          {a.cite ? <cite>{a.cite}</cite> : null}
        </blockquote>
      )
    case 'bulletList':
    case 'orderedList': {
      const List = node.type === 'bulletList' ? 'ul' : 'ol'
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
      return <CodeCard code={textOf(node)} lang={a.language || 'ts'} filename={a.filename || undefined} />
    case 'imageCard':
      return a.src ? <ImageCard src={a.src} alt={a.alt ?? ''} caption={a.caption} frame={a.frame} /> : null
    case 'videoCard':
      return a.src ? <VideoCard src={a.src} poster={a.poster || undefined} caption={a.caption} loop={a.loop} /> : null
    case 'slidesCard': {
      const slides = (a.slides ?? []).filter((s) => s?.src)
      return slides.length ? <SlidesCard slides={slides} /> : null
    }
    case 'horizontalRule':
      return <hr className="journal-post__hr" />
    default:
      return <p className="journal-post__p">{inline(node.content)}</p>
  }
}

/** @param {{ doc: { content?: any[] } }} props */
export function RichText({ doc }) {
  return (doc.content ?? []).map((node, i) => (
    <FadeIn key={i}>
      <Node node={node} />
    </FadeIn>
  ))
}
