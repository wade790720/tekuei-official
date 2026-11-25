import { createContext, use } from 'react'

export const WorkContext = createContext(null)

/** @returns {ReturnType<typeof import('../hooks/useCmsSection.js').useCmsSection>} the `work` section of the site data */
export function useWork() {
  const ctx = use(WorkContext)
  if (!ctx) throw new Error('useWork needs <WorkProvider>')
  return ctx
}
