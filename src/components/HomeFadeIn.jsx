import { useReveal } from '../hooks/useReveal.js'

export function HomeFadeIn({ as: Tag = 'div', className = '', children }) {
  const { ref, visible } = useReveal({ threshold: 0.15 })
  const cls = ['home-fade-in', visible ? 'is-visible' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag ref={ref} className={cls}>
      {children}
    </Tag>
  )
}
