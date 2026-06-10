import { useReveal } from '../hooks/useReveal.js'

/**
 * @param {{ as?: keyof JSX.IntrinsicElements, className?: string, style?: import('react').CSSProperties, children: import('react').ReactNode, threshold?: number }} props
 */
export function Reveal({
  as: Tag = 'div',
  className = '',
  style,
  children,
  threshold = 0.1,
}) {
  const { ref, visible } = useReveal({ threshold })
  const cls = ['case-reveal', visible ? 'is-visible' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag ref={ref} className={cls} style={style}>
      {children}
    </Tag>
  )
}
