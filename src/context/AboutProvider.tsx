import { cloneAbout, getDefaultAbout } from '../data/about.ts'
import { useCmsSection } from '../hooks/useCmsSection.ts'
import { AboutContext } from './about.ts'
import type { ReactNode } from 'react'

// Above the pages, like the journal: an unsaved edit to About survives a visit to another page.
export function AboutProvider({ children }: { children: ReactNode }) {
  return <AboutContext value={useCmsSection('aboutPage', getDefaultAbout, cloneAbout)}>{children}</AboutContext>
}
