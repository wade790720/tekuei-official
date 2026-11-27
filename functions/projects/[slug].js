import { serveProject } from '../../src/lib/seo.ts'
import { WORK_ITEMS } from '../../src/data/work.ts'

export const onRequestGet = (ctx) => serveProject(ctx, WORK_ITEMS)
