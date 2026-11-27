import { aboutPage, servePage } from '../src/lib/seo.ts'
import type { Env } from './env.d.ts'

export const onRequestGet: PagesFunction<Env> = (ctx) => servePage(ctx, (_, data) => aboutPage(data))
