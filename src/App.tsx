import { Component, lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Routes, Route, useLocation, useNavigationType, useParams } from 'react-router-dom'
import SiteHero from './components/SiteHero.tsx'
import WorkListPage from './components/WorkListPage.tsx'
import JournalListPage from './components/JournalListPage.tsx'
import JournalPostPage from './components/JournalPostPage.tsx'
import { SiteNav } from './components/SiteNav.tsx'
import { mountClickSounds } from './lib/uiSound.ts'
import { mountReveal } from './lib/reveal.ts'
import { AdminProvider } from './context/AdminProvider.tsx'
import { JournalProvider } from './context/JournalProvider.tsx'
import { WorkProvider } from './context/WorkProvider.tsx'
import { PAGE_ERROR } from './data/nav.ts'
import { useLang } from './i18n'

// Labs load when first visited, so Lenis and the canvas effects stay out of the main bundle.
const LabPage = lazy(() => import('./labs/LabPage.tsx'))
const LabLive = lazy(() => import('./labs/LabLive.tsx'))
const AboutPage = lazy(() => import('./components/AboutPage.tsx'))
const CaseRouter = lazy(() => import('./components/CaseRouter.tsx'))
// Only LIFF check-in visitors need the phone input and libphonenumber.
const CheckinPage = lazy(() => import('./components/CheckinPage.tsx'))
const HowToCheckinPage = lazy(() => import('./components/HowToCheckinPage.tsx'))

// Dev-only preview pages. The production build drops this import.
const ComponentLibrary = import.meta.env.DEV
  ? lazy(() => import('./components/dev/ComponentLibrary.tsx'))
  : null

// Scroll position of each history entry, so back / forward returns to where the reader was.
const scrollByEntry = new Map<string, number>()

/**
 * A new page starts at the top. Back and forward (POP) return to the saved position instead.
 * A new query on the same page (the Journal tag filter) keeps the scroll.
 */
function ScrollClasses() {
  const { pathname, key } = useLocation()
  const type = useNavigationType()
  const entry = useRef(key)
  const lastPath = useRef<string | null>(null)

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
    // A new page (not the first load): move focus to its h1, so a screen reader announces where you are
    if (lastPath.current !== null && pathname !== lastPath.current) {
      requestAnimationFrame(() => {
        const h1 = document.querySelector<HTMLElement>('main h1')
        if (!h1) return
        h1.setAttribute('tabindex', '-1')
        h1.focus({ preventScroll: true })
      })
    }
    lastPath.current = pathname
  }, [key, pathname, type])
  return null
}

// Without this, one error while a page draws (a field missing in the saved data, a chunk that
// failed to load) takes the whole site down to a blank screen. The header stays, so the reader can leave.
interface PageBoundaryProps {
  path: string
  fallback: ReactNode
  children: ReactNode
}

class PageBoundary extends Component<PageBoundaryProps, { failed: boolean }> {
  override state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  // Another page gets a fresh try.
  override componentDidUpdate(prev: PageBoundaryProps) {
    if (this.state.failed && prev.path !== this.props.path) this.setState({ failed: false })
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function PageError() {
  const { lang } = useLang()
  const t = PAGE_ERROR[lang]
  return (
    <main className="page-error" role="alert">
      <h1>{t.title}</h1>
      <p>{t.hint}</p>
    </main>
  )
}

function Pages({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return (
    <PageBoundary path={pathname} fallback={<PageError />}>
      {children}
    </PageBoundary>
  )
}

function AppNav() {
  const { pathname } = useLocation()
  const isCheckin = pathname === '/checkin'

  // Live lab pages are bare: they also run inside the lab page's iframe.
  if (isCheckin || pathname.endsWith('/live')) return null

  const isCase = pathname.startsWith('/projects/') || pathname.startsWith('/labs/')

  return (
    <SiteNav
      variant={isCase ? 'case' : 'default'}
      current={pathname.startsWith('/journal') ? 'journal' : pathname.startsWith('/projects') || isCase ? 'projects' : undefined}
    />
  )
}

export default function App() {
  useEffect(() => mountClickSounds(), [])
  useEffect(() => mountReveal(), [])
  return (
    <BrowserRouter>
      <AdminProvider>
      <JournalProvider>
      <WorkProvider>
      <ScrollClasses />
      <AppNav />
      <Pages>
      <Suspense fallback={<div className="site-loading-bar" />}>
      <Routes>
        <Route path="/" element={<SiteHero />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/projects" element={<WorkListPage />} />
        <Route path="/work" element={<Navigate to="/projects" replace />} />
        <Route path="/journal" element={<JournalListPage />} />
        <Route path="/journal/:slug" element={<JournalPostPage />} />
        <Route path="/projects/:slug" element={<CaseRouter />} />
        <Route path="/cases/:slug" element={<MovedCase />} />
        <Route path="/labs/:slug" element={<LabPage />} />
        <Route path="/labs/:slug/live" element={<LabLive />} />
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
      </Suspense>
      </Pages>
      </WorkProvider>
      </JournalProvider>
      </AdminProvider>
    </BrowserRouter>
  )
}

/** Old case links (/cases/<slug>) in the app; on the live site a Pages Function answers them with a 301 first. */
function MovedCase() {
  const { slug } = useParams()
  return <Navigate to={`/projects/${slug}`} replace />
}
