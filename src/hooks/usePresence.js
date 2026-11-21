import { useEffect, useState } from 'react'

/**
 * Keeps an element mounted for `exitMs` after `open` turns false, so its exit animation can play.
 * Returns true while it should render; it is closing when this is true and `open` is false.
 */
export function usePresence(open, exitMs) {
  const [present, setPresent] = useState(open)
  if (open && !present) setPresent(true)

  useEffect(() => {
    if (open || !present) return undefined
    const id = setTimeout(() => setPresent(false), exitMs)
    return () => clearTimeout(id)
  }, [open, present, exitMs])

  return present
}
