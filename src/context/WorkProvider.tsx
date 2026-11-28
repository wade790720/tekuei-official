import { cloneWork, getDefaultWork } from '../data/work.ts'
import { useCmsSection } from '../hooks/useCmsSection.ts'
import { WorkContext } from './work.ts'
import type { ReactNode } from 'react'

export function WorkProvider({ children }: { children: ReactNode }) {
  const cms = useCmsSection('work', getDefaultWork, cloneWork)
  return <WorkContext value={cms}>{children}</WorkContext>
}
