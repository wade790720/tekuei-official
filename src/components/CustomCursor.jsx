import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e) => {
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
    }

    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  return <div className="cursor-dot" ref={ref} aria-hidden />
}
