import { useCallback, useEffect, useRef, useState } from 'react'
import '../styles/tooltip.css'

// Warm tooltips (after React Bits "Warm Tooltip"): the first one waits, then while the group is "warm"
// the same tooltip slides to the next trigger at once.
const TIP_DELAY = 400
const TIP_WARM = 300
const TIP_OUT = 100 // matches tooltip-out in tooltip.css

/**
 * A row of triggers that share one tooltip. Mark each trigger with data-tip (and data-kbd for a shortcut).
 * The tooltip is placed under the group, so the group needs a position (relative or absolute).
 * @param {{
 *   as?: import('react').ElementType,
 *   ref?: import('react').Ref<HTMLElement>,
 *   children?: import('react').ReactNode,
 * } & Record<string, any>} props
 */
export function TooltipGroup({ as: Tag = 'div', ref, children, ...rest }) {
  const box = useRef(null)
  const timer = useRef(0)
  const warmUntil = useRef(0)
  const [tip, setTip] = useState(null) // { text, kbd, x, travel, closing }
  const live = tip && !tip.closing

  useEffect(() => () => clearTimeout(timer.current), [])

  // A hidden tooltip keeps its text while it fades out, then goes.
  useEffect(() => {
    if (!tip?.closing) return undefined
    const id = setTimeout(() => setTip(null), TIP_OUT)
    return () => clearTimeout(id)
  }, [tip])

  const setRef = useCallback(
    (el) => {
      box.current = el
      if (typeof ref === 'function') ref(el)
      else if (ref) ref.current = el
    },
    [ref],
  )

  const place = (el) => {
    const b = box.current.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    setTip((t) => ({ text: el.dataset.tip, kbd: el.dataset.kbd, x: r.left - b.left + r.width / 2, travel: Boolean(t && !t.closing) }))
  }
  const hide = () => {
    clearTimeout(timer.current)
    if (live) warmUntil.current = performance.now() + TIP_WARM
    setTip((t) => (t && !t.closing ? { ...t, travel: false, closing: true } : t))
  }
  const over = (e) => {
    const el = e.target.closest('[data-tip]')
    if (!el || (live && el.dataset.tip === tip.text)) return
    clearTimeout(timer.current)
    if (live || performance.now() < warmUntil.current) place(el)
    else timer.current = setTimeout(() => place(el), TIP_DELAY)
  }
  const focus = (e) => {
    const el = e.target.closest('[data-tip]')
    if (el) place(el)
  }

  return (
    <Tag ref={setRef} {...rest} onPointerOver={over} onPointerLeave={hide} onFocus={focus} onBlur={hide} onPointerDown={hide}>
      {children}
      {tip ? (
        <div className="tooltip" role="tooltip" style={{ '--x': `${tip.x}px` }} data-travel={tip.travel || undefined} data-closing={tip.closing || undefined}>
          {tip.text}
          {tip.kbd ? <kbd>{tip.kbd}</kbd> : null}
        </div>
      ) : null}
    </Tag>
  )
}
