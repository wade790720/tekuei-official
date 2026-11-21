import '../styles/button.css'

/**
 * @param {{
 *   variant?: 'solid' | 'ghost' | 'icon' | 'overlay', // solid: the main action; ghost: secondary; icon: a 32px square for one glyph; overlay: a round icon button on top of a picture or video
 *   as?: import('react').ElementType,     // 'label' wraps a file input, so the whole button opens the picker
 *   className?: string,
 * } & Record<string, any>} props
 */
export function Button({ variant = 'solid', as: Tag = 'button', className = '', ...rest }) {
  const cls = ['btn', variant !== 'solid' && `btn--${variant}`, className].filter(Boolean).join(' ')
  return <Tag type={Tag === 'button' ? 'button' : undefined} className={cls} {...rest} />
}
