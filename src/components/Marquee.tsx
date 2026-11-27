import { useLayoutEffect, useRef, useState } from 'react'
import '../styles/marquee.css'

/**
 * A row of items that scrolls sideways without end, the edges fading out. Two copies of the list
 * run back to back; the second is hidden from screen readers. With reduced motion the row stands
 * still and wraps.
 * @param {{ items: import('react').ReactNode[], reverse?: boolean, speed?: number, label?: string }} props
 *   speed  pixels per second
 */
export function Marquee({ items, reverse = false, speed = 14, label }) {
  const root = useRef(null)
  // A short list is repeated inside each copy, so one copy is never narrower than the row.
  const [repeat, setRepeat] = useState(1)

  // The duration follows the copy's width, so every row moves at the same speed.
  useLayoutEffect(() => {
    const el = root.current
    const track = el.firstElementChild
    const set = () => {
      if (track.offsetWidth < el.offsetWidth) setRepeat((r) => r + 1)
      el.style.setProperty('--marquee-s', `${track.offsetWidth / speed}s`)
    }
    set()
    const resize = new ResizeObserver(set)
    resize.observe(el)
    resize.observe(track)
    return () => resize.disconnect()
  }, [speed])

  const list = (hidden) => (
    <ul className="marquee__track" aria-hidden={hidden || undefined}>
      {Array.from({ length: repeat }, (_, r) =>
        items.map((item, i) => (
          <li key={`${r}-${i}`} className="marquee__item" aria-hidden={(!hidden && r > 0) || undefined}>
            {item}
          </li>
        )),
      )}
    </ul>
  )

  return (
    <div ref={root} className="marquee" data-reverse={reverse || undefined} aria-label={label} role={label ? 'region' : undefined}>
      {list(false)}
      {list(true)}
    </div>
  )
}
