import { useEffect, useRef, useState } from 'react'

/**
 * @param {{ threshold?: number }} [options]
 */
export function useReveal({ threshold = 0.1 } = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          setVisible(true)
          obs.unobserve(e.target)
        })
      },
      { threshold },
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, visible }
}
