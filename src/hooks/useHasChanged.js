import { useState } from 'react'

/** True once `value` has differed from its first value. Lets a state icon animate on change but not on page load. */
export function useHasChanged(value) {
  const [first] = useState(value)
  const [changed, setChanged] = useState(false)
  if (!changed && value !== first) setChanged(true)
  return changed
}
