import { useReveal } from '../hooks/useReveal.js'

// Other props (to, href, role, …) go to the element, so as={Link} works.
export function HomeFadeIn({ as: Tag = 'div', className = '', children, ...rest }) {
  const { ref, visible } = useReveal({ threshold: 0.15 })
  const cls = ['home-fade-in', visible ? 'is-visible' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag ref={ref} className={cls} {...rest}>
      {children}
    </Tag>
  )
}
