import { startTransition, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Lang } from '../lib/siteData.ts'
import { LangContext } from './langContext.ts'

// Anything but "en" is Chinese. Every text lookup is keyed by this value, so a stale or
// hand-edited one would blank the whole site, header included.
// Storage throws when the browser blocks site data; this provider sits outside the page error boundary.
function savedLang(): Lang {
  try {
    return localStorage.getItem('lang') === 'en' ? 'en' : 'zh'
  } catch {
    return 'zh'
  }
}
export function LangProvider({ children }: { children: ReactNode }) {
  // The server has no saved choice, so the page hydrates in Chinese and the saved one follows. As a transition, so
  // React finishes hydrating the lazy pages first: an urgent update would re-render them on the client and leave the
  // server's <title> and description behind in the head.
  const [lang, setLang] = useState<Lang>('zh')
  useEffect(() => {
    if (savedLang() === 'en') startTransition(() => setLang('en'))
  }, [])
  const toggle = () => {
    const next: Lang = lang === 'zh' ? 'en' : 'zh'
    try {
      localStorage.setItem('lang', next)
    } catch {
      /* the choice lasts until reload */
    }
    setLang(next)
  }
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
