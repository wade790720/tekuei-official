import CaseRouter from '../components/CaseRouter.tsx'
import { CASE_BY_SLUG } from '../data/cases/index.ts'
import { found, notFound, pageHeaders, readSite } from '../lib/cf.server.ts'
import { langSwitchCache } from '../lib/langSwitch.ts'
import { projectPage } from '../lib/pageData.ts'
import type { ProjectPageData } from '../lib/pageData.ts'
import type { Route } from './+types/project'
export { shouldRevalidate } from '../lib/langSwitch.ts'

// A draft or a project with no page is a 404; in edit mode the page still opens it from the draft.
export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const isCase = Object.hasOwn(CASE_BY_SLUG, params.slug)
  const page = projectPage(await readSite(context, isCase ? ['work', 'cases'] : ['work']), params.slug, isCase)
  return page.found ? found(page) : notFound(page)
}
export const headers = pageHeaders

const cache = langSwitchCache<ProjectPageData>()
export const clientLoader = (args: Route.ClientLoaderArgs) => cache.clientLoader(args)

export default function Project({ loaderData }: Route.ComponentProps) {
  cache.useRemember(loaderData)
  return <CaseRouter page={loaderData} />
}
