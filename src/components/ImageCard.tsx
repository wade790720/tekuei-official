import type { ReactNode } from 'react'
import { Card } from './Card.tsx'
import '../styles/cards.css'

export interface ImageCardProps {
  src: string
  alt: string
  /** usually text; the editor passes an input to type it in place */
  caption?: ReactNode
  /** true: small image (phone screenshot) centred on the card with space around it */
  frame?: boolean
  /** intrinsic size, reserves space before the image loads */
  width?: number
  height?: number
}

export function ImageCard({ src, alt, caption, frame = false, width, height }: ImageCardProps) {
  return (
    <figure className="post-figure">
      <Card className={`image-card${frame ? ' image-card--frame' : ''}`}>
        <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
      </Card>
      {caption ? <figcaption className="post-figure__caption">{caption}</figcaption> : null}
    </figure>
  )
}
