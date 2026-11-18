import '../../styles/postCards.css'

/**
 * @param {{
 *   src: string,
 *   alt: string,
 *   caption?: string,
 *   frame?: boolean,   // true: small image (phone screenshot) centred on the card with space around it
 *   width?: number,    // intrinsic size, reserves space before the image loads
 *   height?: number,
 * }} props
 */
export function ImageCard({ src, alt, caption, frame = false, width, height }) {
  return (
    <figure className="post-figure">
      <div className={`post-card post-image${frame ? ' post-image--frame' : ''}`}>
        <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
      </div>
      {caption ? <figcaption className="post-figure__caption">{caption}</figcaption> : null}
    </figure>
  )
}
