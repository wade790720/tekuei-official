import { Card } from './Card.tsx'
import '../styles/cards.css'

/**
 * @param {{
 *   src: string,
 *   alt: string,
 *   caption?: import('react').ReactNode, // usually text; the editor passes an input to type it in place
 *   frame?: boolean,   // true: small image (phone screenshot) centred on the card with space around it
 *   width?: number,    // intrinsic size, reserves space before the image loads
 *   height?: number,
 * }} props
 */
export function ImageCard({ src, alt, caption, frame = false, width, height }) {
  return (
    <figure className="post-figure">
      <Card className={`image-card${frame ? ' image-card--frame' : ''}`}>
        <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
      </Card>
      {caption ? <figcaption className="post-figure__caption">{caption}</figcaption> : null}
    </figure>
  )
}
