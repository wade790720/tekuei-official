import { cloneJournal, copyJournalDraft, getDefaultJournal } from '../data/journal.js'
import { useCmsSection } from '../hooks/useCmsSection.js'
import { JournalContext } from './journal.js'

// One journal state for the whole app: the list, the post page and the home page
// share it, so an unsaved draft survives moving between pages.
export function JournalProvider({ children }) {
  const cms = useCmsSection('journal', getDefaultJournal, cloneJournal, copyJournalDraft)
  return <JournalContext value={cms}>{children}</JournalContext>
}
