import WorkListPage from '../components/WorkListPage.tsx'
import { found, pageHeaders, readSite } from '../lib/cf.server.ts'
import { langSwitchCache } from '../lib/langSwitch.ts'
import { projectList } from '../lib/pageData.ts'
import type { ProjectListData } from '../lib/pageData.ts'
import type { Route } from './+types/projects'
export { shouldRevalidate } from '../lib/langSwitch.ts'

export const loader = async ({ context }: Route.LoaderArgs) => found(projectList(await readSite(context, ['work'])))
export const headers = pageHeaders

const cache = langSwitchCache<ProjectListData>()
export const clientLoader = (args: Route.ClientLoaderArgs) => cache.clientLoader(args)

export default function Projects({ loaderData }: Route.ComponentProps) {
  cache.useRemember(loaderData)
  return <WorkListPage work={loaderData} />
}
