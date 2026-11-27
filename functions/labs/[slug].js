import { serveCase } from '../../src/lib/seo.ts'
import { WORK_ITEMS } from '../../src/data/work.ts'

export const onRequestGet = (ctx) => serveCase(ctx, WORK_ITEMS)
