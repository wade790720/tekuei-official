import { createContext } from 'react'
import type { Lang } from '../lib/siteData.ts'

export interface LangState {
  lang: Lang
  toggle: () => void
}

export const LangContext = createContext<LangState>({ lang: 'zh', toggle() {} })
