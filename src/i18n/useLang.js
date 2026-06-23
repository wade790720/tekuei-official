import { useContext } from 'react'
import { LangContext } from './langContext.js'

export function useLang() {
  return useContext(LangContext)
}
