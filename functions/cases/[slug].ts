import { serveCase } from '../../src/lib/seo.ts'
import type { Env } from '../env.d.ts'
import { WORK_ITEMS } from '../../src/data/work.ts'

export const onRequestGet: PagesFunction<Env> = (ctx) => serveCase(ctx, WORK_ITEMS)
