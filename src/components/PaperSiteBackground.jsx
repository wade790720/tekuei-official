import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { WashiPaperBackground } from './WashiPaperBackground.jsx'

/** 非首頁路由：和紙背景 + html 主題 class */
export function PaperSiteBackground() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  useEffect(() => {
    document.documentElement.classList.toggle('tekuei-paper-site', !isHome)
    return () => document.documentElement.classList.remove('tekuei-paper-site')
  }, [isHome])

  if (isHome) return null
  return <WashiPaperBackground />
}
