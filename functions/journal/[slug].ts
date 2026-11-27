import { postPage, servePage } from '../../src/lib/seo.ts'
import type { Env } from '../env.d.ts'

export const onRequestGet: PagesFunction<Env, 'slug'> = (ctx) =>
  servePage(ctx, (journal) => (typeof ctx.params.slug === 'string' ? postPage(journal, ctx.params.slug) : null))
