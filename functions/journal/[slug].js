import { postPage, servePage } from '../../src/lib/seo.js'

export const onRequestGet = (ctx) => servePage(ctx, (journal) => postPage(journal, ctx.params.slug))
