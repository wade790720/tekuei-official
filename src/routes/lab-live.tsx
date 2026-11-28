import LabLive from '../labs/LabLive.tsx'
import { LAB_BY_ID } from '../labs/index.ts'
import { notFound, pageHeaders } from '../lib/cf.server.ts'
import type { PageHandle } from '../lib/htmlClass.ts'
import type { Route } from './+types/lab-live'
export { shouldRevalidate } from '../lib/langSwitch.ts'

// Falling Figure scrolls with Lenis and hides the browser scrollbar, like the piece it follows.
export const handle: PageHandle = {
  htmlClass: ({ slug }) => (slug === 'falling-figure' ? 'lab-live-doc about-fall-doc' : 'lab-live-doc'),
}

// An unknown lab is a 404, as on its lab page. A known one is code and needs no data.
export const loader = ({ params }: Route.LoaderArgs) => (Object.hasOwn(LAB_BY_ID, params.slug) ? null : notFound(null))
export const headers = pageHeaders

export default function LabLiveRoute() {
  return <LabLive />
}
