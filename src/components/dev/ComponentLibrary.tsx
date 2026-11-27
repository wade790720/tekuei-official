// Dev-only page (/dev/component-library): the design system docs, laid out like the Radix Themes docs.
// Sections: 概覽 (guides), 主題 (tokens), then the component groups. One page per entry.
// App.tsx mounts it only when import.meta.env.DEV, so the page and its assets stay out of production.
import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { Link, NavLink, useLocation, useNavigate, useParams } from 'react-router'
import { ColorPage } from './ColorPage.tsx'
import { ComponentPage } from './ComponentPage.tsx'
import { componentToc, type TocItem } from './componentToc.ts'
import { GROUPS } from './componentLibrary.data.tsx'
import {
  BreakpointsPage,
  GettingStarted,
  LayoutGuide,
  MotionPage,
  RadiusPage,
  Resources,
  Styling,
  ThemeOverview,
} from './GuidePages.tsx'
import { GUIDES, type GuideId } from './guides.data.ts'
import type { ComponentEntry } from './libraryTypes.ts'
import { SpacingPage } from './SpacingPage.tsx'
import { TypographyDoc } from './TypographyDoc.tsx'
import '../../styles/work.css'
import '../../styles/journal.css'
import '../../styles/cms.css'
import '../../styles/componentLibrary.css'

const BASE = '/dev/component-library'
const TOKENS_FILE = 'src/styles/tokens.css'

const TYPOGRAPHY: { name: string; lead: string; toc: TocItem[] } = {
  name: 'Typography',
  lead: '字級、字重、字型和行內格式',
  toc: [
    ['base', '基本元件'],
    ['formatting', '行內格式'],
    ['scale', '字級'],
    ['weight', '字重'],
    ['family', '字型'],
    ['spec', '實際使用'],
    ['rules', '原則'],
  ],
}

interface PageBase {
  id: string
  name: string
  lead: string
  file?: string
  toc: TocItem[]
}

type LibraryPage =
  | (PageBase & { kind: 'guide'; Body: ComponentType })
  | (PageBase & { kind: 'component'; item: ComponentEntry })

interface Section {
  id: string
  title: string
  pages: LibraryPage[]
}

const guide = (id: GuideId | 'typography', Body: ComponentType, file?: string): LibraryPage => ({
  id,
  kind: 'guide',
  Body,
  file,
  ...(id === 'typography' ? TYPOGRAPHY : GUIDES[id]),
})

const SECTIONS: Section[] = [
  {
    id: 'overview',
    title: '概覽',
    pages: [
      guide('introduction', GettingStarted),
      guide('styling', Styling),
      guide('layout', LayoutGuide),
      guide('resources', Resources),
    ],
  },
  {
    id: 'theme',
    title: '主題',
    pages: [
      guide('theme', ThemeOverview, TOKENS_FILE),
      guide('color', ColorPage, TOKENS_FILE),
      guide('typography', TypographyDoc, TOKENS_FILE),
      guide('spacing', SpacingPage, TOKENS_FILE),
      guide('radius', RadiusPage, TOKENS_FILE),
      guide('motion', MotionPage, TOKENS_FILE),
      guide('breakpoints', BreakpointsPage),
    ],
  },
  ...GROUPS.map((g) => ({
    id: g.id,
    title: g.title,
    pages: [...g.items].sort(byName).map((item) => ({
      id: item.id,
      kind: 'component' as const,
      name: item.name,
      lead: item.summary,
      file: item.file,
      toc: componentToc(item),
      item,
    })),
  })),
]

function byName(a: ComponentEntry, b: ComponentEntry) {
  return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
}

type PageWithSection = LibraryPage & { section: Section }

const PAGES: PageWithSection[] = SECTIONS.flatMap((section) => section.pages.map((p) => ({ ...p, section })))
const PAGE_BY_ID: Record<string, PageWithSection | undefined> = Object.fromEntries(PAGES.map((p) => [p.id, p]))
const pageHref = (id: string) => (id === 'introduction' ? BASE : `${BASE}/${id}`)

function SideLink({ page, onPick }: { page: LibraryPage; onPick: () => void }) {
  return (
    <NavLink
      to={pageHref(page.id)}
      end
      className="cl-side__link"
      onClick={onPick}
    >
      {page.name}
    </NavLink>
  )
}

interface SidebarProps {
  current: LibraryPage | undefined
  open: boolean
  onToggle: () => void
  onPick: () => void
}

function Sidebar({ current, open, onToggle, onPick }: SidebarProps) {
  return (
    <nav className="cl-side" aria-label="元件庫目錄" data-open={open || undefined}>
      <button type="button" className="cl-side__toggle" aria-expanded={open} onClick={onToggle}>
        <span>目錄</span>
        <span className="cl-side__current">{current?.name}</span>
      </button>
      {SECTIONS.map((s) => (
        <div key={s.id} className="cl-side__group">
          <h2 className="cl-side__title">{s.title}</h2>
          {s.pages.map((p) => (
            <SideLink key={p.id} page={p} onPick={onPick} />
          ))}
        </div>
      ))}
    </nav>
  )
}

function PageHeader({ page }: { page: PageWithSection }) {
  const intro = page.id === 'introduction'
  return (
    <header className="cl-head">
      <div className="cl-head__pre">
        {intro ? 'DEV ONLY' : page.section.title}
      </div>
      <h1 className={`cl-head__title${page.kind === 'component' ? ' cl-head__title--code' : ''}`}>
        {intro ? 'Component Library' : page.name}
      </h1>
      <p className="cl-head__desc">{page.lead}</p>
      {page.file ? <code className="cl-head__file">{page.file}</code> : null}
    </header>
  )
}

function Pager({ page }: { page: PageWithSection }) {
  const i = PAGES.indexOf(page)
  const [prev, next] = [PAGES[i - 1], PAGES[i + 1]]
  return (
    <nav className="cl-pager" aria-label="上一頁與下一頁">
      {prev ? (
        <Link to={pageHref(prev.id)} className="cl-pager__link">
          <small>上一頁</small>
          {prev.name}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={pageHref(next.id)} className="cl-pager__link cl-pager__link--next">
          <small>下一頁</small>
          {next.name}
        </Link>
      ) : null}
    </nav>
  )
}

function QuickNav({ toc }: { toc?: TocItem[] }) {
  if (!toc?.length) return null
  return (
    <nav className="cl-quick" aria-label="本頁">
      <div className="cl-quick__title">本頁</div>
      {toc.map(([id, label, level]) => (
        <a key={id} href={`#${id}`} className={`cl-quick__link${level === 3 ? ' cl-quick__link--sub' : ''}`}>
          {label}
        </a>
      ))}
    </nav>
  )
}

export default function ComponentLibrary() {
  const { page: pageId } = useParams()
  const { hash } = useLocation()
  const navigate = useNavigate()
  const page = PAGE_BY_ID[pageId ?? 'introduction']
  const [menuOpen, setMenuOpen] = useState(false) // narrow screens only: the sidebar folds into a button
  // Old links pointed at #anchors on one long page; send them to the matching page.
  const legacy = !pageId && PAGE_BY_ID[hash.slice(1)] ? hash.slice(1) : null

  useEffect(() => {
    if (legacy) navigate(pageHref(legacy), { replace: true })
  }, [legacy, navigate])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pageId])

  return (
    <div className="journal-page cl-page">
      <title>{page && page.id !== 'introduction' ? `${page.name} · Component Library` : 'Component Library · TEKUEI'}</title>
      <Sidebar current={page} open={menuOpen} onToggle={() => setMenuOpen((o) => !o)} onPick={() => setMenuOpen(false)} />

      <div className="cl-body">
        <main className="cl-main">
          {page ? (
            <>
              <PageHeader page={page} />
              {page.kind === 'component' ? <ComponentPage item={page.item} /> : <page.Body />}
              <Pager page={page} />
            </>
          ) : (
            <header className="cl-head">
              <h1 className="cl-head__title">找不到這一頁</h1>
              <Link to={BASE} className="cl-head__desc">
                回到開始使用
              </Link>
            </header>
          )}
        </main>
        <QuickNav toc={page?.toc} />
      </div>
    </div>
  )
}
