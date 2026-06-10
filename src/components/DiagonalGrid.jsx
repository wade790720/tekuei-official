import { useEffect, useRef } from 'react'

function buildSvgMarkup(W, H) {
  const diagStep = 52
  const crossStep = 104
  const cDiag = 'rgba(200,192,180,0.038)'
  const cCross = 'rgba(200,192,180,0.072)'
  const ext = W + H
  let d = ''

  for (let i = -H; i <= W + H; i += diagStep) {
    d += `<line x1="${i}" y1="0" x2="${i + ext}" y2="${ext}" stroke="${cDiag}" stroke-width=".35"/>`
  }
  for (let i = -H; i <= W + H; i += diagStep) {
    d += `<line x1="${i + ext}" y1="0" x2="${i}" y2="${ext}" stroke="${cDiag}" stroke-width=".35"/>`
  }
  for (let x = 0; x <= W; x += crossStep) {
    d += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${cCross}" stroke-width=".4"/>`
  }
  for (let y = 0; y <= H; y += crossStep) {
    d += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${cCross}" stroke-width=".4"/>`
  }
  return d
}

/**
 * @param {{ extent?: 'viewport' | 'document', className?: string }} props
 */
export function DiagonalGrid({ extent = 'viewport', className = '' }) {
  const svgRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    let raf = 0

    const paint = () => {
      const W = window.innerWidth
      const H =
        extent === 'document'
          ? Math.max(
              window.innerHeight,
              document.documentElement.scrollHeight,
            )
          : window.innerHeight
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
      if (extent === 'document') {
        svg.style.height = `${H}px`
      } else {
        svg.style.height = ''
      }
      svg.innerHTML = buildSvgMarkup(W, H)
    }

    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(paint)
    }

    schedule()
    window.addEventListener('resize', schedule)
    window.addEventListener('scroll', schedule, { passive: true })

    const ro =
      extent === 'document' && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(schedule)
        : null
    ro?.observe(document.documentElement)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('scroll', schedule)
      ro?.disconnect()
    }
  }, [extent])

  return (
    <svg ref={svgRef} className={['grid-svg', className].filter(Boolean).join(' ')} aria-hidden>
      {/* injected */}
    </svg>
  )
}
