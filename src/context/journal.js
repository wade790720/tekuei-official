import { createContext, use } from 'react'

export const JournalContext = createContext(null)

/** @returns {ReturnType<typeof useCmsSection> & { content: import('../data/journal.ts').JournalData }} */
export function useJournal() {
  const ctx = use(JournalContext)
  if (!ctx) throw new Error('useJournal needs <JournalProvider>')
  return ctx
}
