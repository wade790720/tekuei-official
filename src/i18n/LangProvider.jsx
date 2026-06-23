import { useState } from 'react'
import { LangContext } from './langContext.js'

export function LangProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('lang') ?? 'zh',
  )
  const toggle = () =>
    setLang((l) => {
      const next = l === 'zh' ? 'en' : 'zh'
      localStorage.setItem('lang', next)
      return next
    })
  return (
    <LangContext.Provider value={{ lang, toggle }}>
      {children}
    </LangContext.Provider>
  )
}
