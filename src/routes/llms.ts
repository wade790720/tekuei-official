import { aboutInEnglish } from '../data/about.ts'
import { readSite } from '../lib/cf.server.ts'
import { aboutPage, readerWork } from '../lib/pageData.ts'
import { localizeWork } from '../lib/projectHref.ts'
import { llmsTxt, siteCases, siteJournal } from '../lib/seo.ts'
import type { Route } from './+types/llms'

export async function loader({ context }: Route.LoaderArgs) {
  const site = await readSite(context, ['journal', 'work', 'aboutPage'])
  const work = readerWork(site)
  const body = llmsTxt(siteJournal(site), siteCases(work.items, work), siteCases(localizeWork(work, 'en').items, work, 'en'), aboutInEnglish(aboutPage(site)))
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } })
}
