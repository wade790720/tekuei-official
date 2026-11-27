import { sitemapXml, readSiteData, siteCases, siteJournal } from '../src/lib/seo.ts'
import type { ApiContext } from './env.d.ts'
import { WORK_ITEMS } from '../src/data/work.ts'

export const onRequestGet = async ({ env }: ApiContext) => {
  const data = await readSiteData(env.BUCKET)
  const body = sitemapXml(siteJournal(data), siteCases(data?.work?.items ?? WORK_ITEMS, data?.work))
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
