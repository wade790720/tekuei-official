// Measurement lines over a page header, like the dimension lines on a floor plan or an engineering drawing:
// a ruler with end ticks and its length under the header, a line down the side of the title block, and a
// corner mark. Every number is measured from the page in px, and counts up while its line is drawn.
// A small marker on the ruler follows the pointer's x, as on the rulers of a drawing program.
// Colours come from CSS: `color` for the lines and numbers, `--measure-accent` for the marker.

const TICK = 6 // half the length of an end tick
const MINOR = 24 // a short tick every 24px along the ruler
const CORNER = 10
const SIDE = 16 // the side line sits this far left of the block
const LABEL_GAP = 28 // half the gap a number leaves in its line
const ROOM = 8.5 // the ruler sits this far above the canvas's bottom edge, so its number is not cut off
const DRAW_MS = 900

const easeOut = (t: number) => 1 - (1 - t) ** 3

/**
 * @param {HTMLCanvasElement} canvas  fills the header; it is decoration, so the page marks it aria-hidden
 * @param {{ block: HTMLElement }} opts  the element whose width and height are measured
 * @returns {() => void} cleanup
 */
export function mountMeasureLines(canvas: HTMLCanvasElement, { block }: { block: HTMLElement }): () => void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}
  const style = getComputedStyle(canvas)
  const line = style.color
  const accent = style.getPropertyValue('--measure-accent').trim() || line
  const font = `11px ${style.fontFamily}`
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let progress = still ? 1 : 0
  let pointerX: number | null = null
  let raf = 0
  let start = 0

  const draw = () => {
    const box = canvas.getBoundingClientRect()
    if (box.bottom < 0) return // scrolled away
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    if (canvas.width !== Math.round(box.width * dpr) || canvas.height !== Math.round(box.height * dpr)) {
      canvas.width = Math.round(box.width * dpr)
      canvas.height = Math.round(box.height * dpr)
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, box.width, box.height)

    const b = block.getBoundingClientRect()
    const pads = getComputedStyle(block)
    const x0 = b.left - box.left + parseFloat(pads.paddingLeft)
    const x1 = b.right - box.left - parseFloat(pads.paddingRight)
    const top = b.top - box.top
    const bottom = b.bottom - box.top
    const base = Math.round(box.height) - ROOM
    const p = easeOut(progress)

    ctx.font = font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineWidth = 1
    ctx.strokeStyle = line
    ctx.fillStyle = line
    ctx.beginPath()

    // Under the header: the column's width. The ruler grows from the left and leaves a gap for the number.
    const mid = (x0 + x1) / 2
    const end = x0 + (x1 - x0) * p
    ctx.moveTo(x0, base - TICK)
    ctx.lineTo(x0, base)
    ctx.lineTo(Math.min(end, mid - LABEL_GAP), base)
    if (end > mid + LABEL_GAP) {
      ctx.moveTo(mid + LABEL_GAP, base)
      ctx.lineTo(end, base)
    }
    for (let x = x0 + MINOR; x < Math.min(end, x1 - 1); x += MINOR) {
      if (Math.abs(x - mid) < LABEL_GAP) continue
      ctx.moveTo(Math.round(x) + 0.5, base)
      ctx.lineTo(Math.round(x) + 0.5, base - 3)
    }
    if (p === 1) {
      ctx.moveTo(x1, base)
      ctx.lineTo(x1, base - TICK)
    }

    // Down the side of the title block: its height. Left out where the page margin has no room for it.
    const sx = Math.round(x0 - SIDE) + 0.5
    const side = sx > 12
    if (side) {
      const sm = (top + bottom) / 2
      const send = top + (bottom - top) * p
      ctx.moveTo(sx - TICK, top)
      ctx.lineTo(sx + TICK, top)
      ctx.moveTo(sx, top)
      ctx.lineTo(sx, Math.min(send, sm - LABEL_GAP))
      if (send > sm + LABEL_GAP) {
        ctx.moveTo(sx, sm + LABEL_GAP)
        ctx.lineTo(sx, send)
      }
      if (p === 1) {
        ctx.moveTo(sx - TICK, bottom)
        ctx.lineTo(sx + TICK, bottom)
      }
    }

    // A corner mark at the far side of the block
    ctx.moveTo(x1 - CORNER, top)
    ctx.lineTo(x1, top)
    ctx.lineTo(x1, top + CORNER)
    ctx.stroke()

    ctx.fillText(String(Math.round((x1 - x0) * p)), mid, base)
    if (side) {
      ctx.save()
      ctx.translate(sx, (top + bottom) / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText(String(Math.round((bottom - top) * p)), 0, 0)
      ctx.restore()
    }

    if (pointerX !== null && p === 1) {
      const x = Math.min(x1, Math.max(x0, pointerX - box.left))
      ctx.fillStyle = accent
      ctx.beginPath()
      ctx.moveTo(x, base - 2)
      ctx.lineTo(x - 4, base - 9)
      ctx.lineTo(x + 4, base - 9)
      ctx.fill()
    }
  }

  function tick(now: number) {
    start ||= now
    progress = Math.min(1, (now - start) / DRAW_MS)
    draw()
    raf = progress < 1 ? requestAnimationFrame(tick) : 0
  }
  // After the entrance nothing loops: a pointer move or a resize asks for one frame.
  const redraw = () => {
    raf ||= requestAnimationFrame(() => {
      raf = 0
      draw()
    })
  }
  const move = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return
    pointerX = e.clientX
    redraw()
  }

  const resize = new ResizeObserver(redraw)
  resize.observe(canvas)
  resize.observe(block)
  // The marker only shows while the header is on screen, so the pointer is only followed then.
  const seen = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) window.addEventListener('pointermove', move)
    else window.removeEventListener('pointermove', move)
  })
  if (still) draw()
  else {
    raf = requestAnimationFrame(tick)
    seen.observe(canvas)
  }

  return () => {
    cancelAnimationFrame(raf)
    resize.disconnect()
    seen.disconnect()
    window.removeEventListener('pointermove', move)
  }
}
