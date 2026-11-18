import { CodeCard } from './CodeCard.jsx'
import { ImageCard } from './ImageCard.jsx'
import { VideoCard } from './VideoCard.jsx'

/**
 * One block of a journal post body. Block shapes (src/data/journal.js):
 *   { type: 'lead' | 'h2' | 'p', text }
 *   { type: 'quote', text, attr? }
 *   { type: 'code', code, lang?, filename? }
 *   { type: 'image', src, alt, caption?, frame?, width?, height? }
 *   { type: 'video', src, poster?, caption?, loop? }
 */
export function PostBlock({ block }) {
  switch (block.type) {
    case 'lead':
      return <p className="journal-post__lead">{block.text}</p>
    case 'h2':
      return <h2 className="journal-post__h2">{block.text}</h2>
    case 'quote':
      return (
        <blockquote className="journal-post__quote">
          <p>{block.text}</p>
          {block.attr ? <cite>{block.attr}</cite> : null}
        </blockquote>
      )
    case 'code':
      return <CodeCard code={block.code} lang={block.lang} filename={block.filename} />
    case 'image':
      return (
        <ImageCard
          src={block.src}
          alt={block.alt}
          caption={block.caption}
          frame={block.frame}
          width={block.width}
          height={block.height}
        />
      )
    case 'video':
      return <VideoCard src={block.src} poster={block.poster} caption={block.caption} loop={block.loop} />
    default:
      return <p className="journal-post__p">{block.text}</p>
  }
}
