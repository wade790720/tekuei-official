import { useEffect, useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Links, Meta, Outlet, Scripts, useLocation, useMatches, useNavigationType } from 'react-router'
import './index.css'
import './styles/tokens.css'
import { SiteNav } from './components/SiteNav.tsx'
import { DefaultHead } from './components/DefaultHead.tsx'
import { AdminProvider } from './context/AdminProvider.tsx'
import { JournalProvider } from './context/JournalProvider.tsx'
import { WorkProvider } from './context/WorkProvider.tsx'
import { PAGE_ERROR } from './data/nav.ts'
import { LangProvider, useLang } from './i18n'
import { htmlClassOf } from './lib/htmlClass.ts'
import type { PageHandle } from './lib/htmlClass.ts'
import { langOf, samePage, stripLang } from './lib/localePath.ts'
import { mountReveal } from './lib/reveal.ts'
import { mountClickSounds } from './lib/uiSound.ts'

// Site-wide defaults for social cards and search. Each page renders its own <title> and description (DefaultHead
// when it has none), so neither is here.
const SITE_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://tekuei.com/#website',
      name: 'TEKUEI 德溎',
      url: 'https://tekuei.com/',
      inLanguage: 'zh-Hant',
      description: '遵循內心並實踐創造，追求卓越，為熱愛而學習，勇於面對未知與挑戰。',
      author: { '@id': 'https://tekuei.com/#person' },
    },
    {
      '@type': 'Person',
      '@id': 'https://tekuei.com/#person',
      name: 'Wade',
      alternateName: 'TEKUEI 德溎',
      url: 'https://tekuei.com/about',
      jobTitle: '軟體工程師、策展人',
      description:
        '10 年軟體工程師經歷，策劃過 10 餘檔展覽，同時是 MONOLAB 共同創辦人。目前專注記錄日常想法，以及行銷、軟體工程、AI 相關的內容創作。',
      knowsAbout: ['軟體工程', '美學', '設計', '行銷', 'AI'],
    },
  ],
}
const SITE_DESCRIPTION = '探索底層邏輯與真相，對未知領域充滿好奇，喜愛技術、行銷與人工智慧。'

// The page scrolls on <html> (index.css); each route module's handle adds its own classes.
export const handle: PageHandle = { htmlClass: () => 'has-scroll-document' }

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  // Screen readers and browser translation read <html lang>.
  return (
    <html lang={langOf(pathname) === 'en' ? 'en' : 'zh-Hant'} className={htmlClassOf(useMatches())}>
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0b0b0d" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:site_name" content="TEKUEI 德溎" />
        <meta property="og:locale" content="zh_TW" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tekuei.com/" />
        <meta property="og:title" content="TEKUEI 德溎" />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:image" content="https://tekuei.com/og.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://tekuei.com/og.jpg" />
        <meta name="twitter:title" content="TEKUEI 德溎" />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_LD) }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;1,8..60,400&family=Noto+Serif+TC:wght@300;400&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {/* SiteNav makes #root inert while the mobile menu, portalled to <body>, is open. */}
        <div id="root">{children}</div>
        <Scripts />
      </body>
    </html>
  )
}

// The title and description the server sent, read before hydration. React normally takes them over, but on some
// pages (About) it renders its own beside them, so a server copy goes once React has another of the same kind.
const SERVER_HEAD = typeof document === 'undefined' ? [] : [...document.head.querySelectorAll('title, meta[name="description"]')]
const HEAD_KINDS = ['title', 'meta[name="description"]']

function dropServerHeadCopies() {
  for (const kind of HEAD_KINDS) {
    const all = [...document.head.querySelectorAll(kind)]
    if (all.length < 2) continue
    for (const el of all) if (SERVER_HEAD.includes(el)) el.remove()
  }
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
    <LangProvider>
      <AdminProvider>
        <JournalProvider>
          <WorkProvider>
            <ScrollClasses />
            <AppNav />
            {children}
          </WorkProvider>
        </JournalProvider>
      </AdminProvider>
    </LangProvider>
  )
}

function PageError() {
  const { lang } = useLang()
  const t = PAGE_ERROR[lang]
  return (
    <main className="page-error" role="alert">
      <DefaultHead />
      <h1>{t.title}</h1>
      <p>{t.hint}</p>
    </main>
  )
}

export default function Root() {
  useEffect(() => {
    dropServerHeadCopies()
    const observer = new MutationObserver(dropServerHeadCopies)
    observer.observe(document.head, { childList: true })
    return () => observer.disconnect()
  }, [])
  return (
    <Shell>
      <Outlet />
    </Shell>
  )
}

/** A page that failed to draw, or R2 that could not be read (503). The nav stays, so the reader can leave. */
export function ErrorBoundary() {
  return (
    <Shell>
      <PageError />
    </Shell>
  )
}
