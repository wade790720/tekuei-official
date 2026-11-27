import { createContext, use } from 'react'
import type { CmsSection } from '../hooks/useCmsSection.ts'
import type { JournalData } from '../lib/siteData.ts'

export const JournalContext = createContext<CmsSection<JournalData> | null>(null)

export function useJournal(): CmsSection<JournalData> {
  const ctx = use(JournalContext)
  if (!ctx) throw new Error('useJournal needs <JournalProvider>')
  return ctx
}
