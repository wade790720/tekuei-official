import { useLayoutEffect, useRef } from 'react'
import type { ElementType, HTMLAttributes } from 'react'
import '../styles/scrollShadow.css'

export interface ScrollShadowProps extends HTMLAttributes<HTMLElement> {
  /** element to render */
  as?: 'div' | 'pre'
  orientation?: 'vertical' | 'horizontal'
  /** fade length in px */
  size?: number
  hideScrollBar?: boolean
}

/**
 * A scroll container whose edges fade out on the sides that still have hidden content.
 * The fade is a mask on the content itself, so it works on any background.
 * Other props (tabIndex, aria-*) go to the element.
 */
export function ScrollShadow({
  as = 'div',
  orientation = 'vertical',
  size = 40,
  hideScrollBar = false,
  className = '',
  style,
  children,
  ...rest
}: ScrollShadowProps) {
  const ref = useRef<HTMLElement>(null)

  // Subscribes once. New content can make the box scrollable without resizing it, so a
  // MutationObserver re-measures and watches new children. Depending on `children` would re-subscribe every render.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
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
    const mo = new MutationObserver(() => {
      for (const child of el.children) ro.observe(child) // observing twice is a no-op
      update()
    })
    mo.observe(el, { childList: true, subtree: true, characterData: true })
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
      mo.disconnect()
    }
  }, [orientation])

  const Element: ElementType = as
  const classes = ['scroll-shadow', `scroll-shadow--${orientation}`, hideScrollBar && 'scroll-shadow--no-bar', className]
  return (
    <Element
      ref={(el: HTMLElement | null) => {
        ref.current = el
      }}
      className={classes.filter(Boolean).join(' ')}
      style={{ '--scroll-shadow-size': `${size}px`, ...style }}
      {...rest}
    >
      {children}
    </Element>
  )
}
