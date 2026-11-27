import { createContext, use } from 'react'
import type { CmsSection } from '../hooks/useCmsSection.ts'
import type { WorkData } from '../lib/siteData.ts'

export const WorkContext = createContext<CmsSection<WorkData> | null>(null)

/** The `work` section of the site data. */
export function useWork(): CmsSection<WorkData> {
  const ctx = use(WorkContext)
  if (!ctx) throw new Error('useWork needs <WorkProvider>')
  return ctx
}
