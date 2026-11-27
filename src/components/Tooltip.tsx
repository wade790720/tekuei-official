import { useCallback, useEffect, useRef, useState } from 'react'
import type { FocusEvent, HTMLAttributes, PointerEvent, Ref } from 'react'
import { tokenMs } from '../lib/tokenMs.ts'
import '../styles/tooltip.css'

// Warm tooltips (after React Bits "Warm Tooltip"): the first one waits, then while the group is "warm"
// the same tooltip slides to the next trigger at once.
const TIP_DELAY = 400
const TIP_WARM = 300

interface Tip {
  text: string
  kbd?: string
  /** centre of the trigger, from the group's left edge */
  x: number
  /** slides from the previous trigger instead of fading in */
  travel: boolean
  closing?: boolean
}

export interface TooltipGroupProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>
}

/**
 * A row of triggers that share one tooltip. Mark each trigger with data-tip (and data-kbd for a shortcut).
 * The tooltip is placed under the group, so the group needs a position (relative or absolute).
 */
export function TooltipGroup({ ref, children, ...rest }: TooltipGroupProps) {
  const box = useRef<HTMLDivElement | null>(null)
  const timer = useRef(0)
  const warmUntil = useRef(0)
  const [tip, setTip] = useState<Tip | null>(null)
  const live = tip && !tip.closing

  useEffect(() => () => clearTimeout(timer.current), [])

  // A hidden tooltip keeps its text while it fades out, then goes.
  useEffect(() => {
    if (!tip?.closing) return undefined
    const id = setTimeout(() => setTip(null), tokenMs('--duration-exit'))
    return () => clearTimeout(id)
  }, [tip])

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      box.current = el
      if (typeof ref === 'function') ref(el)
      else if (ref) ref.current = el
    },
    [ref],
  )

  const place = (el: HTMLElement) => {
    const b = box.current?.getBoundingClientRect()
    if (!b) return
    const r = el.getBoundingClientRect()
    setTip((t) => ({ text: el.dataset.tip ?? '', kbd: el.dataset.kbd, x: r.left - b.left + r.width / 2, travel: Boolean(t && !t.closing) }))
  }
  const hide = () => {
    clearTimeout(timer.current)
    if (live) warmUntil.current = performance.now() + TIP_WARM
    setTip((t) => (t && !t.closing ? { ...t, travel: false, closing: true } : t))
  }
  const trigger = (target: EventTarget) => (target instanceof Element ? target.closest<HTMLElement>('[data-tip]') : null)
  const over = (e: PointerEvent<HTMLDivElement>) => {
    const el = trigger(e.target)
    if (!el || (live && el.dataset.tip === tip.text)) return
    clearTimeout(timer.current)
    if (live || performance.now() < warmUntil.current) place(el)
    else timer.current = setTimeout(() => place(el), TIP_DELAY)
  }
  const focus = (e: FocusEvent<HTMLDivElement>) => {
    const el = trigger(e.target)
    if (el) place(el)
  }

  return (
    <div ref={setRef} {...rest} onPointerOver={over} onPointerLeave={hide} onFocus={focus} onBlur={hide} onPointerDown={hide}>
      {children}
      {tip ? (
        <div className="tooltip" role="tooltip" style={{ '--x': `${tip.x}px` }} data-travel={tip.travel || undefined} data-closing={tip.closing || undefined}>
          {tip.text}
          {tip.kbd ? <kbd>{tip.kbd}</kbd> : null}
        </div>
      ) : null}
    </div>
  )
}
