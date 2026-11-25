import { sitemapXml, readSiteData, siteCases, siteJournal } from '../src/lib/seo.js'
import { WORK_ITEMS } from '../src/data/work.js'

export async function onRequestGet({ env }) {
  const data = await readSiteData(env.BUCKET)
  const body = sitemapXml(siteJournal(data), siteCases(data?.work?.items ?? WORK_ITEMS, data?.work))
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
