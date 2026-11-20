import { useLayoutEffect, useRef } from 'react'
import '../styles/scrollShadow.css'

/**
 * A scroll container whose edges fade out on the sides that still have hidden content.
 * The fade is a mask on the content itself, so it works on any background.
 * @param {{
 *   as?: string,                              // element to render, e.g. 'pre'
 *   orientation?: 'vertical' | 'horizontal',
 *   size?: number,                            // fade length in px
 *   hideScrollBar?: boolean,
 *   className?: string,
 *   style?: import('react').CSSProperties,
 *   children?: import('react').ReactNode,
 * } & Record<string, unknown>} props  other props (tabIndex, aria-*) go to the element
 */
export function ScrollShadow({
  as: Element = 'div',
  orientation = 'vertical',
  size = 40,
  hideScrollBar = false,
  className = '',
  style,
  children,
  ...rest
}) {
  const ref = useRef(null)

  // Re-measure when the children change: new content can make the box scrollable without resizing it.
  useLayoutEffect(() => {
    const el = ref.current
    const horizontal = orientation === 'horizontal'
    const update = () => {
      const pos = horizontal ? Math.abs(el.scrollLeft) : el.scrollTop
      const max = horizontal ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight
      el.toggleAttribute('data-scroll-start', pos > 1)
      el.toggleAttribute('data-scroll-end', max - pos > 1)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    for (const child of el.children) ro.observe(child)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [orientation, children])

  const classes = ['scroll-shadow', `scroll-shadow--${orientation}`, hideScrollBar && 'scroll-shadow--no-bar', className]
  return (
    <Element
      ref={ref}
      className={classes.filter(Boolean).join(' ')}
      style={{ '--scroll-shadow-size': `${size}px`, ...style }}
      {...rest}
    >
      {children}
    </Element>
  )
}
