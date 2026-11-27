import LabLive from '../labs/LabLive.tsx'
import type { PageHandle } from '../lib/htmlClass.ts'
export { shouldRevalidate } from '../lib/langSwitch.ts'

// Falling Figure scrolls with Lenis and hides the browser scrollbar, like the piece it follows.
export const handle: PageHandle = {
  htmlClass: ({ slug }) => (slug === 'falling-figure' ? 'lab-live-doc about-fall-doc' : 'lab-live-doc'),
}

export default function LabLiveRoute() {
  return <LabLive />
}
