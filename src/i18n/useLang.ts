import { use } from 'react'
import { LangContext } from './langContext.ts'
import type { LangState } from './langContext.ts'

export function useLang(): LangState {
  return use(LangContext)
}
