import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import SiteHero from './components/SiteHero.jsx'
import AboutPage from './components/AboutPage.jsx'
import WorkListPage from './components/WorkListPage.jsx'
import JournalListPage from './components/JournalListPage.jsx'
import JournalPostPage from './components/JournalPostPage.jsx'
import CaseRouter from './components/CaseRouter.jsx'
import CheckinPage from './components/CheckinPage.jsx'
import HowToCheckinPage from './components/HowToCheckinPage.jsx'
import { SiteNav } from './components/SiteNav.jsx'
import { mountClickSounds } from './lib/uiSound.js'
import { AdminProvider } from './context/AdminProvider.jsx'
import { JournalProvider } from './context/JournalProvider.jsx'

// Dev-only preview pages. The production build drops this import.
const ComponentLibrary = import.meta.env.DEV
  ? lazy(() => import('./components/dev/ComponentLibrary.jsx'))
  : null

// Scroll position of each history entry, so back / forward returns to where the reader was.
const scrollByEntry = new Map()

/**
 * A new page starts at the top. Back and forward (POP) return to the saved position instead.
 * A new query on the same page (the Journal tag filter) keeps the scroll.
 */
function ScrollClasses() {
  const { pathname, key } = useLocation()
  const type = useNavigationType()
  const entry = useRef(key)
  const lastPath = useRef(null)

  useEffect(() => {
    document.documentElement.classList.add('has-scroll-document')
    window.history.scrollRestoration = 'manual' // the browser would restore before React draws the page
    const save = () => scrollByEntry.set(entry.current, window.scrollY)
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [])

  useLayoutEffect(() => {
    entry.current = key
    if (type === 'POP') window.scrollTo({ top: scrollByEntry.get(key) ?? 0, left: 0, behavior: 'instant' })
    else if (pathname !== lastPath.current) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    lastPath.current = pathname
  }, [key, pathname, type])
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
  useEffect(() => mountClickSounds(), [])
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
