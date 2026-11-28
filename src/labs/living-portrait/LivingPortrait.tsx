import { useEffect, useRef } from 'react'
import './livingPortrait.css'
import bgSrc from './bg.webp'
import cutSrc from './cut.webp'
import altSrc from './alt.webp'
import { mountHeroFx } from './heroFx.ts'

/**
 * Full-screen portrait with a big name between the picture and the cut-out figure.
 * Hover on the figure shows tracking boxes, double-click glitches (heroFx.ts).
 */
interface LivingPortraitProps {
  name: string
  /** The section's accessible name. */
  label: string
}

export function LivingPortrait({ name, label }: LivingPortraitProps) {
  const root = useRef<HTMLElement>(null)
  const bg = useRef<HTMLImageElement>(null)
  const cut = useRef<HTMLImageElement>(null)
  const alt = useRef<HTMLImageElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!root.current || !bg.current || !cut.current || !alt.current || !canvas.current) return
    return mountHeroFx({ root: root.current, bg: bg.current, cut: cut.current, alt: alt.current, canvas: canvas.current })
  }, [])

  return (
    <section className="living-portrait" ref={root} aria-label={label}>
      {/* Only this lab uses Anton, so it loads here instead of on every page. React hoists it into <head>. */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&display=swap" precedence="default" />
      <div className="living-portrait__stage">
        <img ref={bg} src={bgSrc} alt="" />
        <h1 className="living-portrait__name">{name}</h1>
        <img ref={cut} src={cutSrc} alt="" />
        <img ref={alt} src={altSrc} alt="" className="living-portrait__alt" />
        <canvas ref={canvas} aria-hidden />
      </div>
      <div className="living-portrait__scrim" aria-hidden />
    </section>
  )
}
