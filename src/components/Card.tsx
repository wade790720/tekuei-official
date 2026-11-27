import '../styles/card.css'

/**
 * The shared card surface: charcoal background, 12px radius, a 1px ivory ring instead of a border.
 * CodeBlock, ImageCard, VideoPlayer and Carousel are built on it.
 * @param {{ as?: import('react').ElementType, className?: string, children?: import('react').ReactNode } & Record<string, any>} props
 */
export function Card({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={className ? `card ${className}` : 'card'} {...rest}>
      {children}
    </Tag>
  )
}
