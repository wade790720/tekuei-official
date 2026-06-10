import { useEffect, useRef } from 'react'

/**
 * @param {number} speed — 捲動位移倍率（正值 = 向下捲時元素下移）
 */
export function useScrollParallax(speed = 0.2) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0

    const update = () => {
      const y = window.scrollY
      el.style.transform = `translate3d(0, ${y * speed}px, 0)`
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [speed])

  return ref
}

/**
 * Hero 主文案：捲動時輕微上移並淡出
 */
export function useHeroContentParallax() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0

    const update = () => {
      const y = window.scrollY
      const progress = Math.min(y / 520, 1)
      el.style.transform = `translate3d(0, ${y * 0.1}px, 0)`
      el.style.opacity = String(1 - progress * 0.85)
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return ref
}
