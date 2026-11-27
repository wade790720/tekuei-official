import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Lang } from '../lib/siteData.ts'
import { LangContext } from './langContext.ts'

export function LangProvider({ children }: { children: ReactNode }) {
  // Anything but "en" is Chinese. Every text lookup is keyed by this value, so a stale or
  // hand-edited one would blank the whole site, header included.
  // Storage throws when the browser blocks site data; this provider sits outside the page error boundary.
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return localStorage.getItem('lang') === 'en' ? 'en' : 'zh'
    } catch {
      return 'zh'
    }
  })
  const toggle = () =>
    setLang((l) => {
      const next: Lang = l === 'zh' ? 'en' : 'zh'
      try {
        localStorage.setItem('lang', next)
      } catch {
        /* the choice lasts until reload */
      }
      return next
    })
  // Screen readers and browser translation read <html lang>, so it follows the switch
  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hant'
  }, [lang])
  return (
    <LangContext value={{ lang, toggle }}>
      {children}
    </LangContext>
  )
}
