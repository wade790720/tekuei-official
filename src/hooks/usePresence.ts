import { useEffect, useState } from 'react'
import { tokenMs } from '../lib/tokenMs.ts'

/**
 * Keeps an element mounted for the `exitToken` duration (a tokens.css name) after `open` turns false, so its exit animation can play.
 * Returns true while it should render; it is closing when this is true and `open` is false.
 */
export function usePresence(open: boolean, exitToken: string): boolean {
  const [present, setPresent] = useState(open)
  if (open && !present) setPresent(true)

  useEffect(() => {
    if (open || !present) return undefined
    const id = setTimeout(() => setPresent(false), tokenMs(exitToken))
    return () => clearTimeout(id)
  }, [open, present, exitToken])

  return present
}
