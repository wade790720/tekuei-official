import AboutPage from '../components/AboutPage.tsx'
import { found, pageHeaders, readSite } from '../lib/cf.server.ts'
import { langSwitchCache } from '../lib/langSwitch.ts'
import { aboutPage } from '../lib/pageData.ts'
import type { AboutPageData } from '../lib/siteData.ts'
import type { Route } from './+types/about'
export { shouldRevalidate } from '../lib/langSwitch.ts'

export const loader = async ({ context }: Route.LoaderArgs) => found(aboutPage(await readSite(context, ['aboutPage'])))
export const headers = pageHeaders

const cache = langSwitchCache<AboutPageData>()
export const clientLoader = (args: Route.ClientLoaderArgs) => cache.clientLoader(args)

export default function About({ loaderData }: Route.ComponentProps) {
  cache.useRemember(loaderData)
  return <AboutPage about={loaderData} />
}
