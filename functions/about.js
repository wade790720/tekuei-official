import { aboutPage, servePage } from '../src/lib/seo.ts'

export const onRequestGet = (ctx) => servePage(ctx, (_, data) => aboutPage(data))
