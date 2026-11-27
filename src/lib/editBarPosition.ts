const EDGE = 8

export interface Offset {
  x: number
  y: number
}

/**
 * Keeps the dragged toolbar on screen.
 * @param offset  from the toolbar's resting place
 * @param box  its resting place
 */
export function clampOffset(
  offset: Offset,
  box: { left: number; top: number; width: number; height: number },
  viewport: { width: number; height: number },
): Offset {
  const fit = (v: number, start: number, size: number, room: number) => {
    const min = EDGE - start
    return Math.max(min, Math.min(room - EDGE - start - size, v))
  }
  return {
    x: fit(offset.x, box.left, box.width, viewport.width),
    y: fit(offset.y, box.top, box.height, viewport.height),
  }
}

/** @param saved  from localStorage, so it may be anything */
export function parseOffset(saved: string | null): Offset {
  try {
    const { x, y } = JSON.parse(saved ?? 'null')
    return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : { x: 0, y: 0 }
  } catch {
    return { x: 0, y: 0 }
  }
}
