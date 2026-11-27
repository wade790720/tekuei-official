import type { ComponentProps, ElementType } from 'react'
import '../styles/button.css'

export type ButtonVariant = 'solid' | 'ghost' | 'icon' | 'overlay'

export type ButtonProps<T extends ElementType = 'button'> = {
  /** solid: the main action; ghost: secondary; icon: a 32px square for one glyph; overlay: a round icon button on top of a picture or video */
  variant?: ButtonVariant
  /** 'label' wraps a file input, so the whole button opens the picker */
  as?: T
  className?: string
} & Omit<ComponentProps<T>, 'as' | 'className'>

export function Button<T extends ElementType = 'button'>({ variant = 'solid', as, className = '', ...rest }: ButtonProps<T>) {
  const Tag: ElementType = as ?? 'button'
  const cls = ['btn', variant !== 'solid' && `btn--${variant}`, className].filter(Boolean).join(' ')
  return <Tag type={Tag === 'button' ? 'button' : undefined} className={cls} {...rest} />
}
