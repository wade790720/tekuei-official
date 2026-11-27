import { cloneJournal, copyJournalDraft, getDefaultJournal, stampUpdated, today } from '../data/journal.ts'
import { useCmsSection } from '../hooks/useCmsSection.js'
import { JournalContext } from './journal.js'

// One journal state for the whole app: the list, the post page and the home page
// share it, so an unsaved draft survives moving between pages.
export function JournalProvider({ children }) {
  const cms = useCmsSection('journal', getDefaultJournal, cloneJournal, copyJournalDraft)
  // Every save marks the posts it changes, so search engines can tell an edited post from an old one.
  const saveDraft = (token, change) =>
    cms.saveDraft(token, (d) => {
      change?.(d)
      stampUpdated(d, cms.savedContent, today())
    })
  return <JournalContext value={{ ...cms, saveDraft }}>{children}</JournalContext>
}
