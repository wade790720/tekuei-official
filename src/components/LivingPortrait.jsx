import { useEffect, useRef } from 'react'
import '../styles/livingPortrait.css'
import bgSrc from '../assets/hero/bg.webp'
import cutSrc from '../assets/hero/cut.webp'
import altSrc from '../assets/hero/alt.webp'
import { mountHeroFx } from '../lib/heroFx.js'

/**
 * Full-screen portrait with a big name between the picture and the cut-out figure.
 * Hover on the figure shows tracking boxes, double-click glitches (heroFx.js).
 * @param {{ name: string, label: string }} props  label = the section's accessible name
 */
export function LivingPortrait({ name, label }) {
  const root = useRef(null)
  const bg = useRef(null)
  const cut = useRef(null)
  const alt = useRef(null)
  const canvas = useRef(null)

  useEffect(
    () => mountHeroFx({ root: root.current, bg: bg.current, cut: cut.current, alt: alt.current, canvas: canvas.current }),
    [],
  )

  return (
    <section className="living-portrait" ref={root} aria-label={label}>
      {/* Layers, bottom to top: full picture, name, cut-out figure. */}
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
