import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { WashiPaperBackground } from './WashiPaperBackground.jsx'

/** 非首頁路由：和紙背景 + html 主題 class */
export function PaperSiteBackground() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const isCheckin = pathname === '/checkin'

  useEffect(() => {
    document.documentElement.classList.toggle('paper-site', !isHome && !isCheckin)
    return () => document.documentElement.classList.remove('paper-site')
  }, [isHome, isCheckin])

  if (isHome || isCheckin) return null
  return <WashiPaperBackground />
}
