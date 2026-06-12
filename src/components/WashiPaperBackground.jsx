import { useEffect, useRef } from 'react'
import { mountWashiPaper } from '../lib/washiPaperEngine.js'
import '../styles/washiPaper.css'

/** 和紙材質 WebGL 背景（與首頁 canvas 紙面同源，無墨流） */
export function WashiPaperBackground() {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const raf = requestAnimationFrame(() => {
      engineRef.current = mountWashiPaper(canvas)
    })

    return () => {
      cancelAnimationFrame(raf)
      engineRef.current?.dispose()
      engineRef.current = null
    }
  }, [])

  return <canvas ref={canvasRef} className="washi-paper-bg" aria-hidden="true" />
}
