import { journalIndexPage, servePage } from '../../src/lib/seo.js'
import { JOURNAL_META } from '../../src/data/journal.js'

export const onRequestGet = (ctx) => servePage(ctx, (journal) => journalIndexPage(journal, JOURNAL_META.zh))
