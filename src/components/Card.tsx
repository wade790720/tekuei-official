import type { ComponentProps, ElementType } from 'react'
import '../styles/card.css'

export type CardProps<T extends ElementType = 'div'> = {
  as?: T
  className?: string
} & Omit<ComponentProps<T>, 'as' | 'className'>

/**
 * The shared card surface: charcoal background, 12px radius, a 1px ivory ring instead of a border.
 * CodeBlock, ImageCard, VideoPlayer and Carousel are built on it.
 */
export function Card<T extends ElementType = 'div'>({ as, className = '', ...rest }: CardProps<T>) {
  const Tag: ElementType = as ?? 'div'
  return <Tag className={className ? `card ${className}` : 'card'} {...rest} />
}
