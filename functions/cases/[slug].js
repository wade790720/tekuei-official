import { serveCase } from '../../src/lib/seo.ts'
import { WORK_ITEMS } from '../../src/data/work.js'

export const onRequestGet = (ctx) => serveCase(ctx, WORK_ITEMS)
