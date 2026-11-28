import JournalListPage from '../components/JournalListPage.tsx'
import type { ReadableJournal } from '../data/journal.ts'
import { found, pageHeaders, readSite } from '../lib/cf.server.ts'
import { langSwitchCache } from '../lib/langSwitch.ts'
import { journalList } from '../lib/pageData.ts'
import type { Route } from './+types/journal'
export { shouldRevalidate } from '../lib/langSwitch.ts'

export const loader = async ({ context }: Route.LoaderArgs) => found(journalList(await readSite(context, ['journal'])))
export const headers = pageHeaders

const cache = langSwitchCache<ReadableJournal>()
export const clientLoader = (args: Route.ClientLoaderArgs) => cache.clientLoader(args)

export default function Journal({ loaderData }: Route.ComponentProps) {
  cache.useRemember(loaderData)
  return <JournalListPage journal={loaderData} />
}
