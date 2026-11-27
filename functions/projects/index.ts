import { projectsIndexPage, servePage, siteCases } from '../../src/lib/seo.ts'
import type { Env } from '../env.d.ts'
import { PROJECTS_PAGE, WORK_ITEMS } from '../../src/data/work.ts'

export const onRequestGet: PagesFunction<Env> = (ctx) =>
  servePage(ctx, (_, data) => projectsIndexPage(siteCases(data?.work?.items ?? WORK_ITEMS, data?.work), PROJECTS_PAGE.zh))
