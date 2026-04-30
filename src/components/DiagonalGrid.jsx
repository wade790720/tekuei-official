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

export function DiagonalGrid() {
  const svgRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const paint = () => {
      const W = window.innerWidth
      const H = window.innerHeight
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
      svg.innerHTML = buildSvgMarkup(W, H)
    }

    paint()
    window.addEventListener('resize', paint)
    return () => window.removeEventListener('resize', paint)
  }, [])

  return (
    <svg ref={svgRef} className="grid-svg" aria-hidden>
      {/* lines injected */}
    </svg>
  )
}
