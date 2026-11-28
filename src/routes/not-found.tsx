import { DefaultHead } from '../components/DefaultHead.tsx'
import { notFound, pageHeaders } from '../lib/cf.server.ts'
import type { Route } from './+types/not-found'
import { langSwitchCache } from '../lib/langSwitch.ts'
export { shouldRevalidate } from '../lib/langSwitch.ts'

export const loader = () => notFound(null)
export const headers = pageHeaders

const cache = langSwitchCache<null>()
export const clientLoader = (args: Route.ClientLoaderArgs) => cache.clientLoader(args)

export default function NotFound({ loaderData }: Route.ComponentProps) {
  cache.useRemember(loaderData)
  return <DefaultHead />
}
