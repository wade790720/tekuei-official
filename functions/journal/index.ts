import { journalIndexPage, servePage } from '../../src/lib/seo.ts'
import type { Env } from '../env.d.ts'
import { JOURNAL_META } from '../../src/data/journal.ts'

export const onRequestGet: PagesFunction<Env> = (ctx) => servePage(ctx, (journal) => journalIndexPage(journal, JOURNAL_META.zh))
