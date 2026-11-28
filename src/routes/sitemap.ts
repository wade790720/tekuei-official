import { aboutInEnglish } from '../data/about.ts'
import { readSite } from '../lib/cf.server.ts'
import { aboutPage, readerWork } from '../lib/pageData.ts'
import { siteCases, siteJournal, sitemapXml } from '../lib/seo.ts'
import type { Route } from './+types/sitemap'

export async function loader({ context }: Route.LoaderArgs) {
  const site = await readSite(context, ['journal', 'work', 'aboutPage'])
  const work = readerWork(site)
  const body = sitemapXml(siteJournal(site), siteCases(work.items, work), aboutInEnglish(aboutPage(site)))
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } })
}
