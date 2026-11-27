import { aboutPage, servePage } from '../src/lib/seo.js'

export const onRequestGet = (ctx) => servePage(ctx, (_, data) => aboutPage(data))
