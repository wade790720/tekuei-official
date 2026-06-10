import { useEffect, useRef } from 'react'

/**
 * interactiveSelector — 對應游標底下的元素，`elementFromPoint` + `closest` 判斷是否放大。
 * 省略時不使用放大效果。
 *
 * @param {{ interactiveSelector?: string }} props
 */
export function CustomCursor({ interactiveSelector }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e) => {
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`

      if (!interactiveSelector) return
      let grow = false
      try {
        const under = document.elementFromPoint(e.clientX, e.clientY)
        grow = !!(under?.closest(interactiveSelector))
      } catch {
        grow = false
      }
      el.classList.toggle('cursor-dot--hover', grow)
    }

    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [interactiveSelector])

  return <div className="cursor-dot" ref={ref} aria-hidden />
}
