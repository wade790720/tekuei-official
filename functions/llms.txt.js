import { llmsTxt, readSiteData, siteCases, siteJournal } from '../src/lib/seo.js'
import { WORK_ITEMS } from '../src/data/work.js'

export async function onRequestGet({ env }) {
  const data = await readSiteData(env.BUCKET)
  const body = llmsTxt(siteJournal(data), siteCases(data?.work?.items ?? WORK_ITEMS, data?.work))
  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
