import { createContext, use } from 'react'
import { useAdmin } from './admin.ts'
import type { ReadableJournal } from '../data/journal.ts'
import type { CmsSection } from '../hooks/useCmsSection.ts'
import type { JournalData } from '../lib/siteData.ts'

export const JournalContext = createContext<CmsSection<JournalData> | null>(null)

export function useJournal(): CmsSection<JournalData> {
  const ctx = use(JournalContext)
  if (!ctx) throw new Error('useJournal needs <JournalProvider>')
  return ctx
}

/**
 * The journal a page shows: its loader data (published, as readers see it), or in edit mode the draft,
 * drafts included and the English left empty where it is empty.
 * @param reader  the page's loader data
 */
export function useJournalContent(reader: ReadableJournal): ReadableJournal {
  const cms = useJournal()
  const { editing } = useAdmin()
  return editing && cms.isEditing ? cms.content : reader
}
