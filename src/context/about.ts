import { createContext, use } from 'react'
import type { CmsSection } from '../hooks/useCmsSection.ts'
import type { AboutPageData } from '../lib/siteData.ts'

export const AboutContext = createContext<CmsSection<AboutPageData> | null>(null)

export function useAbout(): CmsSection<AboutPageData> {
  const ctx = use(AboutContext)
  if (!ctx) throw new Error('useAbout needs <AboutProvider>')
  return ctx
}
