import { journalIndexPage, servePage } from '../../src/lib/seo.ts'
import { JOURNAL_META } from '../../src/data/journal.ts'

export const onRequestGet = (ctx) => servePage(ctx, (journal) => journalIndexPage(journal, JOURNAL_META.zh))
