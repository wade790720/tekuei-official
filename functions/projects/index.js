import { projectsIndexPage, servePage, siteCases } from '../../src/lib/seo.ts'
import { PROJECTS_PAGE, WORK_ITEMS } from '../../src/data/work.js'

export const onRequestGet = (ctx) =>
  servePage(ctx, (_, data) => projectsIndexPage(siteCases(data?.work?.items ?? WORK_ITEMS, data?.work), PROJECTS_PAGE.zh))
