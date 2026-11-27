import { serveProject } from '../../src/lib/seo.ts'
import type { Env } from '../env.d.ts'
import { WORK_ITEMS } from '../../src/data/work.ts'

export const onRequestGet: PagesFunction<Env> = (ctx) => serveProject(ctx, WORK_ITEMS)
