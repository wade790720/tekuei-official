import { postPage, servePage } from '../../src/lib/seo.ts'

export const onRequestGet = (ctx) => servePage(ctx, (journal) => postPage(journal, ctx.params.slug))
