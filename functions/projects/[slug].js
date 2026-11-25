import { serveProject } from '../../src/lib/seo.js'
import { WORK_ITEMS } from '../../src/data/work.js'

export const onRequestGet = (ctx) => serveProject(ctx, WORK_ITEMS)
