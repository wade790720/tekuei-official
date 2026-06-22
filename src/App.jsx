import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import SiteHero from './components/SiteHero.jsx'
import AboutPage from './components/AboutPage.jsx'
import WorkListPage from './components/WorkListPage.jsx'
import JournalListPage from './components/JournalListPage.jsx'
import JournalPostPage from './components/JournalPostPage.jsx'
import CaseRouter from './components/CaseRouter.jsx'
import CheckinPage from './components/CheckinPage.jsx'
import HowToCheckinPage from './components/HowToCheckinPage.jsx'
import { PaperSiteBackground } from './components/PaperSiteBackground.jsx'
import { SiteNav } from './components/SiteNav.jsx'

function ScrollClasses() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.documentElement.classList.add('tekuei-has-scroll-document')
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function AppNav() {
  const { pathname } = useLocation()
  const isCheckin = pathname === '/checkin'

  if (isCheckin) return null

  const isCase = pathname.startsWith('/cases/')

  return (
    <SiteNav
      variant={isCase ? 'case' : 'default'}
      highlightJournal={pathname.startsWith('/journal')}
      highlightWorkSection={pathname.startsWith('/work') || isCase}
    />
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollClasses />
      <PaperSiteBackground />
      <AppNav />
      <Routes>
        <Route path="/" element={<SiteHero />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/work" element={<WorkListPage />} />
        <Route path="/journal" element={<JournalListPage />} />
        <Route path="/journal/:slug" element={<JournalPostPage />} />
        <Route path="/cases/:slug" element={<CaseRouter />} />
        <Route path="/checkin" element={<CheckinPage />} />
        <Route path="/how-to-checkin" element={<HowToCheckinPage />} />
      </Routes>
    </BrowserRouter>
  )
}
