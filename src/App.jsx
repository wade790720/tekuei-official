import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import SiteHero from './components/SiteHero.jsx'
import AboutPage from './components/AboutPage.jsx'
import WorkListPage from './components/WorkListPage.jsx'
import JournalListPage from './components/JournalListPage.jsx'
import JournalPostPage from './components/JournalPostPage.jsx'
import CaseRouter from './components/CaseRouter.jsx'
import CheckinPage from './components/CheckinPage.jsx'
import HowToCheckinPage from './components/HowToCheckinPage.jsx'
import { SiteNav } from './components/SiteNav.jsx'
import { AdminProvider } from './context/AdminProvider.jsx'
import { JournalProvider } from './context/JournalProvider.jsx'

// Dev-only preview pages. The production build drops this import.
const ComponentLibrary = import.meta.env.DEV
  ? lazy(() => import('./components/dev/ComponentLibrary.jsx'))
  : null

function ScrollClasses() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.documentElement.classList.add('has-scroll-document')
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
      <AdminProvider>
      <JournalProvider>
      <ScrollClasses />
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
        {ComponentLibrary ? (
          <Route
            path="/dev/component-library/:page?"
            element={
              <Suspense fallback={null}>
                <ComponentLibrary />
              </Suspense>
            }
          />
        ) : null}
      </Routes>
      </JournalProvider>
      </AdminProvider>
    </BrowserRouter>
  )
}
