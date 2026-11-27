import { cloneWork, getDefaultWork } from '../data/work.ts'
import { useCmsSection } from '../hooks/useCmsSection.ts'
import { WorkContext } from './work.ts'
import type { ReactNode } from 'react'

// One work state for the whole app: the Projects list and each project page share it,
// so a project created in the list is still there, unsaved, on its own page.
export function WorkProvider({ children }: { children: ReactNode }) {
  const cms = useCmsSection('work', getDefaultWork, cloneWork)
  return <WorkContext value={cms}>{children}</WorkContext>
}
