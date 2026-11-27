import { cloneWork, getDefaultWork } from '../data/work.ts'
import { useCmsSection } from '../hooks/useCmsSection.js'
import { WorkContext } from './work.js'

// One work state for the whole app: the Projects list and each project page share it,
// so a project created in the list is still there, unsaved, on its own page.
export function WorkProvider({ children }) {
  const cms = useCmsSection('work', getDefaultWork, cloneWork)
  return <WorkContext value={cms}>{children}</WorkContext>
}
