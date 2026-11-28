import JournalPostPage from '../components/JournalPostPage.tsx'
import { getDefaultJournal } from '../data/journal.ts'
import type { ReadableJournal } from '../data/journal.ts'
import { found, notFound, pageHeaders, readSite } from '../lib/cf.server.ts'
import { langSwitchCache } from '../lib/langSwitch.ts'
import { journalPost } from '../lib/pageData.ts'
import type { Route } from './+types/journal-post'
export { shouldRevalidate } from '../lib/langSwitch.ts'

// A draft is a 404 like an unknown slug: the page draws "not found", or the draft itself once Wade is editing.
export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const post = journalPost(await readSite(context, ['journal']), params.slug)
  return post ? found(post) : notFound(getDefaultJournal())
}
export const headers = pageHeaders

const cache = langSwitchCache<ReadableJournal>()
export const clientLoader = (args: Route.ClientLoaderArgs) => cache.clientLoader(args)

export default function JournalPost({ loaderData }: Route.ComponentProps) {
  cache.useRemember(loaderData)
  return <JournalPostPage journal={loaderData} />
}
