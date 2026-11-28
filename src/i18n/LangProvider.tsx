import { startTransition, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { hasEnglish, langOf, otherLangPath } from '../lib/localePath.ts'
import { readStored, writeStored } from '../lib/safeStorage.ts'
import type { Lang } from '../lib/siteData.ts'
import { LangContext } from './langContext.ts'

function savedLang(): Lang | null {
  const saved = readStored('lang')
  return saved === 'en' || saved === 'zh' ? saved : null
}
const saveLang = (lang: Lang) => writeStored('lang', lang)

/**
 * The language is in the URL: Chinese at the root, English under /en, so the server and the browser agree.
 * The button goes to the same page in the other language and keeps the scroll. localStorage only remembers what a
 * reader chose: someone who chose English and then opens a Chinese link is moved to its English URL after the page
 * loads. A reader who chose Chinese is never moved off an English link, and nothing looks at the browser's language.
 * The pages with one URL (/checkin, a lab's live page) take ?lang=en (the English lab page's preview and its full
 * screen link), else follow the saved choice after hydration.
 */
export function LangProvider({ children }: { children: ReactNode }) {
  const { pathname, search, hash } = useLocation()
  const navigate = useNavigate()
  const fromUrl = langOf(pathname)
  const oneUrl = !hasEnglish(pathname)
  const param = new URLSearchParams(search).get('lang')
  const fromParam: Lang | null = param === 'en' || param === 'zh' ? param : null
  const [oneUrlLang, setOneUrlLang] = useState<Lang>(fromParam ?? 'zh')
  const lang = oneUrl ? oneUrlLang : fromUrl

  useEffect(() => {
    const saved = savedLang()
    if (saved !== 'en') return
    const english = otherLangPath(window.location.pathname)
    if (!hasEnglish(window.location.pathname)) {
      if (!new URLSearchParams(window.location.search).has('lang')) startTransition(() => setOneUrlLang('en'))
    }
    else if (langOf(window.location.pathname) === 'zh' && english) {
      navigate(english + window.location.search + window.location.hash, { replace: true, preventScrollReset: true })
    }
  }, [navigate])

  const toggle = () => {
    const next: Lang = lang === 'zh' ? 'en' : 'zh'
    saveLang(next)
    const other = otherLangPath(pathname)
    if (oneUrl || !other) setOneUrlLang(next)
    else navigate(other + search + hash, { preventScrollReset: true })
  }
  return <LangContext value={{ lang, toggle }}>{children}</LangContext>
}
