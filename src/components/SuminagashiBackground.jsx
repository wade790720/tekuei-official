import { useEffect, useRef } from 'react'
import { mountSuminagashi } from '../lib/suminagashiEngine.js'
import '../styles/suminagashiBackground.css'

/**
 * 全屏墨流し背景（和紙 + GPU 流體墨染），無控制列
 */
export function SuminagashiBackground() {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    document.documentElement.classList.add('home-ink')

    let engine = null
    const start = () => {
      engine = mountSuminagashi(canvas, {
        interactiveSelector: 'a,button,input,textarea,select,[role="button"]',
      })
      engineRef.current = engine
    }

    const raf = requestAnimationFrame(start)

    return () => {
      cancelAnimationFrame(raf)
      engine?.dispose()
      engineRef.current = null
      document.documentElement.classList.remove('home-ink')
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="suminagashi-bg"
      aria-hidden="true"
    />
  )
}
