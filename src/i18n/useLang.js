import { use } from 'react'
import { LangContext } from './langContext.js'

export function useLang() {
  return use(LangContext)
}
