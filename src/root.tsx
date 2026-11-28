import { useEffect, useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Links, Meta, Outlet, Scripts, useLocation, useMatches, useNavigationType } from 'react-router'
import './index.css'
import './styles/tokens.css'
import { SiteNav } from './components/SiteNav.tsx'
import { PageError } from './components/PageError.tsx'
import { AboutProvider } from './context/AboutProvider.tsx'
import { AdminProvider } from './context/AdminProvider.tsx'
import { JournalProvider } from './context/JournalProvider.tsx'
import { WorkProvider } from './context/WorkProvider.tsx'
import { LangProvider, useLang } from './i18n'
import { htmlClassOf } from './lib/htmlClass.ts'
import type { PageHandle } from './lib/htmlClass.ts'
import { samePage, stripLang } from './lib/localePath.ts'
import { mountReveal } from './lib/reveal.ts'
import { mountClickSounds } from './lib/uiSound.ts'

// The site-wide part of the head: each page draws its own title, description, canonical, social tags and
// JSON-LD (PageHead), the site's WebSite and Person included, so none of those is here.
// Without JS nothing adds is-visible, so the entrance would leave the page blank.
const NO_SCRIPT = '<style>.fade-in{opacity:1!important;transform:none!important;filter:none!important}</style>'

// The page scrolls on <html> (index.css); each route module's handle adds its own classes.
export const handle: PageHandle = { htmlClass: () => 'has-scroll-document' }

export function Layout({ children }: { children: ReactNode }) {
  return (
    <LangProvider>
      <Document>{children}</Document>
    </LangProvider>
  )
}

function Document({ children }: { children: ReactNode }) {
  const { lang } = useLang()
  // Screen readers and browser translation read <html lang>.
  return (
    <html lang={lang === 'en' ? 'en' : 'zh-Hant'} className={htmlClassOf(useMatches())}>
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0b0b0d" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:site_name" content="TEKUEI 德溎" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;1,8..60,400&family=Noto+Serif+TC:wght@300;400&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
        <noscript dangerouslySetInnerHTML={{ __html: NO_SCRIPT }} />
      </head>
      <body>
        {/* SiteNav makes #root inert while the mobile menu, portalled to <body>, is open. */}
        <div id="root">{children}</div>
        <Scripts />
      </body>
    </html>
  )
}

// Scroll position of each history entry, so back / forward returns to where the reader was.
const scrollByEntry = new Map<string, number>()

/**
 * A new page starts at the top. Back and forward (POP) return to the saved position instead. The same page with
 * a new query (the Journal tag filter) or in the other language (the language button) keeps the scroll.
 */
function ScrollClasses() {
  const { pathname, key } = useLocation()
  const type = useNavigationType()
  const entry = useRef(key)
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    window.history.scrollRestoration = 'manual' // the browser would restore before React draws the page
    const save = () => scrollByEntry.set(entry.current, window.scrollY)
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [])

  useLayoutEffect(() => {
    entry.current = key
    const newPage = lastPath.current !== null && !samePage(pathname, lastPath.current)
    if (type === 'POP') window.scrollTo({ top: scrollByEntry.get(key) ?? 0, left: 0, behavior: 'instant' })
    else if (newPage) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    // A new page (not the first load): move focus to its h1, so a screen reader announces where you are
    if (newPage) {
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

function AppNav() {
  const path = stripLang(useLocation().pathname)
  // Check-in and the live lab pages are bare: the live pages also run inside the lab page's iframe.
  if (path === '/checkin' || path.endsWith('/live')) return null
  const isCase = path.startsWith('/projects/') || path.startsWith('/labs/')
  return (
    <SiteNav
      variant={isCase ? 'case' : 'default'}
      current={path.startsWith('/journal') ? 'journal' : path.startsWith('/projects') || isCase ? 'projects' : undefined}
    />
  )
}

/** What every page sits in, the error screen included: the providers, the nav, the scroll and the reveal. */
function Shell({ children }: { children: ReactNode }) {
  useEffect(() => mountClickSounds(), [])
  // After hydration, so the server's class on each .fade-in still matches when React reads it.
  useEffect(() => mountReveal(), [])
  return (
    <AdminProvider>
      <JournalProvider>
        <WorkProvider>
          <AboutProvider>
            <ScrollClasses />
            <AppNav />
            {children}
          </AboutProvider>
        </WorkProvider>
      </JournalProvider>
    </AdminProvider>
  )
}

export default function Root() {
  return (
    <Shell>
      <Outlet />
    </Shell>
  )
}

/** The shell itself failed. A page's own failure is caught below it (routes/page.tsx), so edit mode survives that. */
export function ErrorBoundary() {
  return <PageError />
}
