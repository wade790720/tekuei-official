import { createContext, useContext } from 'react'

export const JournalContext = createContext(null)

/** @returns {ReturnType<typeof useCmsSection> & { content: import('../data/journal.js').JournalData }} */
export function useJournal() {
  const ctx = useContext(JournalContext)
  if (!ctx) throw new Error('useJournal needs <JournalProvider>')
  return ctx
}
