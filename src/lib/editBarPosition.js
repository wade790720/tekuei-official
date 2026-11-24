const EDGE = 8

/**
 * Keeps the dragged toolbar on screen.
 * @param {{ x: number, y: number }} offset  from the toolbar's resting place
 * @param {{ left: number, top: number, width: number, height: number }} box  its resting place
 * @param {{ width: number, height: number }} viewport
 */
export function clampOffset(offset, box, viewport) {
  const fit = (v, start, size, room) => {
    const min = EDGE - start
    return Math.max(min, Math.min(room - EDGE - start - size, v))
  }
  return {
    x: fit(offset.x, box.left, box.width, viewport.width),
    y: fit(offset.y, box.top, box.height, viewport.height),
  }
}

/** @param {string | null} saved  from localStorage, so it may be anything */
export function parseOffset(saved) {
  try {
    const { x, y } = JSON.parse(saved)
    return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : { x: 0, y: 0 }
  } catch {
    return { x: 0, y: 0 }
  }
}
