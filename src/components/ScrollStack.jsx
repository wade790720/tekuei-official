import { Children, useEffect, useRef } from 'react'
import '../styles/scroll-stack.css'

const pad = (n) => String(n).padStart(2, '0')
const label = (index, total) => `${pad(index)} / ${pad(total)}`

/**
 * Cards that pin one over another while the page scrolls. Each card sticks in place, the next one
 * slides over it, and the covered ones shrink, lift, blur and darken, then fade out behind the third.
 * A rail and a counter under the stack show how far along it is. With reduced motion the cards are a plain list.
 * @param {{ children: import('react').ReactNode, className?: string, rail?: boolean }} props
 *   children  one card per child
 *   rail      the rail and counter under the stack. Turn it off when the cards number themselves.
 */
export function ScrollStack({ children, className, rail = true }) {
  const root = useRef(null)
  const count = Children.count(children)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const items = [...root.current.querySelectorAll(':scope > .scroll-stack__item')]
    if (items.length < 2) return
    const progress = rail ? root.current.firstElementChild : null

    let box = root.current.parentElement
    while (box && box !== document.documentElement && !/auto|scroll/.test(getComputedStyle(box).overflowY)) {
      box = box.parentElement
    }
    const scroller = !box || box === document.documentElement ? window : box

    let raf = 0
    const update = () => {
      raf = 0
      const origin = scroller === window ? 0 : scroller.getBoundingClientRect().top
      const stick = origin + parseFloat(getComputedStyle(items[0]).top)
      const step = items[0].offsetHeight + parseFloat(getComputedStyle(items[1]).marginTop)
      const tops = items.map((el) => el.getBoundingClientRect().top)
      // A card's depth is how many later cards have arrived over it, the arriving one counted in part.
      let depth = 0
      for (let i = items.length - 1; i > 0; i--) {
        items[i].style.setProperty('--depth', depth.toFixed(3))
        depth += Math.min(1, Math.max(0, 1 - (tops[i] - stick) / step))
      }
      items[0].style.setProperty('--depth', depth.toFixed(3))
      // The first card's depth is how far the whole stack has come. The rail appears as that card settles.
      if (!progress) return
      progress.style.setProperty('--progress', (depth / (items.length - 1)).toFixed(3))
      progress.style.setProperty('--shown', Math.min(1, Math.max(0, 1 - (tops[0] - stick) / 96)).toFixed(3))
      progress.lastElementChild.textContent = label(Math.round(depth) + 1, items.length)
    }
    const queue = () => {
      raf ||= requestAnimationFrame(update)
    }

    update()
    scroller.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    return () => {
      scroller.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
      cancelAnimationFrame(raf)
    }
  }, [count, rail])

  return (
    <div ref={root} className={['scroll-stack', !rail && 'scroll-stack--plain', className].filter(Boolean).join(' ')}>
      {rail ? (
        <div className="scroll-stack__progress" aria-hidden>
          <span className="scroll-stack__rail" />
          <span className="scroll-stack__count">{label(1, count)}</span>
        </div>
      ) : null}
      {Children.map(children, (child) => (
        <div className="scroll-stack__item">
          <div className="scroll-stack__card">{child}</div>
        </div>
      ))}
    </div>
  )
}
