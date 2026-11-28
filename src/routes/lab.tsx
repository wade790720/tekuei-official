import LabPage from '../labs/LabPage.tsx'
import { LAB_BY_ID } from '../labs/index.ts'
import { found, notFound, pageHeaders } from '../lib/cf.server.ts'
import type { Route } from './+types/lab'
import { langSwitchCache } from '../lib/langSwitch.ts'
export { shouldRevalidate } from '../lib/langSwitch.ts'

export const loader = ({ params }: Route.LoaderArgs) => (Object.hasOwn(LAB_BY_ID, params.slug) ? found(null) : notFound(null))
export const headers = pageHeaders

const cache = langSwitchCache<null>()
export const clientLoader = (args: Route.ClientLoaderArgs) => cache.clientLoader(args)

export default function Lab({ loaderData }: Route.ComponentProps) {
  cache.useRemember(loaderData)
  return <LabPage />
}
