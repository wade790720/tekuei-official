// The site's top navigation and its parts: SiteNavLinks (shared by the bar and the phone menu),
// NavToggle (the phone menu button) and NavOverlay (the full-screen phone menu).
import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from 'react'
import type { MouseEvent, ReactNode, Ref } from 'react'
import { createPortal } from 'react-dom'
import { NavLink } from 'react-router'
import { HOME_FOOTER } from '../data/homepage.ts'
import { NAV_LABELS, SITE_LOGO } from '../data/nav.ts'
import { useLang } from '../i18n'
import { playWaterRipple } from '../lib/waterRipple.ts'
import { tokenMs } from '../lib/tokenMs.ts'
import '../styles/siteNav.css'
import '../styles/navOverlay.css'

// No page has a contact section, so Contact opens a new email. The address is the same in both languages.
// With no email in the list, Contact goes to About.
const CONTACT_HREF = HOME_FOOTER.zh.contact.find((link) => link.href?.startsWith('mailto:'))?.href ?? '/about'

function subscribeScroll(onChange: () => void) {
  window.addEventListener('scroll', onChange, { passive: true })
  return () => window.removeEventListener('scroll', onChange)
}

type NavSection = 'projects' | 'journal'

export interface SiteNavProps {
  /** Section to mark as the current page when the URL is a child of it. */
  current?: NavSection
  variant?: 'default' | 'case'
}

export function SiteNav({ current, variant = 'default' }: SiteNavProps) {
  const [open, setOpen] = useState(false)
  const { lang, toggle } = useLang()
  const t = NAV_LABELS[lang]
  const toggleRef = useRef<HTMLButtonElement>(null)
  const close = () => setOpen(false)
  const switchLang = (e: MouseEvent<HTMLButtonElement>) => {
    // Keyboard presses have no pointer position (detail 0): start from the button's centre.
    const r = e.currentTarget.getBoundingClientRect()
    const fromPointer = e.detail > 0
    // The language changes while the waves are strongest, so the new text seems to arrive with them.
    playWaterRipple(fromPointer ? e.clientX : r.left + r.width / 2, fromPointer ? e.clientY : r.top + r.height / 2, toggle)
  }
  // The toggle unmounts while the menu is open; give it focus back once the menu has gone.
  const onMenuExited = () => toggleRef.current?.focus()

  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 80, () => false)

  const navClass = [
    'site-nav',
    variant === 'case' ? 'site-nav--case' : 'site-nav--scroll-aware',
    scrolled ? 'is-scrolled' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <nav className={navClass}>
      <NavLink end to="/" className="site-nav__logo" onClick={close}>
        <span className="site-logo">
          {SITE_LOGO}
          <span className="site-logo__cursor" aria-hidden />
        </span>
      </NavLink>
      <div className="site-nav__links site-nav__links--desktop">
        <SiteNavLinks current={current} />
        <button type="button" className="site-nav__lang" onClick={switchLang} aria-label={t.lang}>
          {lang === 'zh' ? 'EN' : 'TW'}
        </button>
      </div>
      {!open && <NavToggle ref={toggleRef} onToggle={() => setOpen(true)} />}
      <NavOverlay open={open} onClose={close} onExited={onMenuExited} id="site-nav-overlay">
        <SiteNavLinks
          variant="overlay"
          onNavigate={close}
          current={current}
        />
        <button
          type="button"
          className="site-nav__lang site-nav__lang--overlay"
          onClick={(e) => {
            switchLang(e)
            close()
          }}
          aria-label={t.lang}
        >
          {lang === 'zh' ? 'EN' : 'TW'}
        </button>
      </NavOverlay>
    </nav>
  )
}


interface SiteNavLinksProps {
  onNavigate?: () => void
  variant?: 'desktop' | 'overlay'
  current?: NavSection
}

function SiteNavLinks({ onNavigate, variant = 'desktop', current }: SiteNavLinksProps) {
  const overlay = variant === 'overlay'

  const linkClass = (active: boolean) =>
    [overlay ? 'nav-overlay__link' : '', active ? 'is-active' : '']
      .filter(Boolean)
      .join(' ')

  return (
    <>
      <NavLink
        to="/about"
        className={({ isActive }) => linkClass(isActive)}
        onClick={onNavigate}
      >
        About
      </NavLink>
      <NavLink
        to="/projects"
        className={({ isActive }) =>
          linkClass(isActive || current === 'projects')
        }
        onClick={onNavigate}
      >
        Projects
      </NavLink>
      <NavLink
        to="/journal"
        className={({ isActive }) =>
          linkClass(isActive || current === 'journal')
        }
        onClick={onNavigate}
      >
        Journal
      </NavLink>
      <a
        href={CONTACT_HREF}
        className={overlay ? 'nav-overlay__link' : undefined}
        onClick={onNavigate}
      >
        Contact
      </a>
    </>
  )
}


// Shown only while the menu is closed (SiteNav unmounts it when the menu opens),
// so it announces "opens a dialog" instead of a live expanded state.
function NavToggle({ ref, onToggle, className = '' }: { ref: Ref<HTMLButtonElement>; onToggle: () => void; className?: string }) {
  const { lang } = useLang()
  return (
    <button
      ref={ref}
      type="button"
      className={['nav-toggle', className].filter(Boolean).join(' ')}
      onClick={onToggle}
      aria-haspopup="dialog"
      aria-label={NAV_LABELS[lang].open}
    >
      <span className="nav-toggle__line" aria-hidden />
      <span className="nav-toggle__line" aria-hidden />
      <span className="nav-toggle__line" aria-hidden />
    </button>
  )
}

function OverlayClose({ ref, onClose, label }: { ref: Ref<HTMLButtonElement>; onClose: () => void; label: string }) {
  return (
    <button
      ref={ref}
      type="button"
      className="nav-toggle nav-overlay__close"
      onClick={onClose}
      aria-label={label}
    >
      <span className="nav-toggle__line" aria-hidden />
      <span className="nav-toggle__line" aria-hidden />
      <span className="nav-toggle__line" aria-hidden />
    </button>
  )
}

// How long the overlay stays mounted after it starts to close (the closing transitions in navOverlay.css).
function overlayDuration() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : tokenMs('--duration-base')
}

interface NavOverlayProps {
  open: boolean
  onClose: () => void
  onExited?: () => void
  children: ReactNode
  id?: string
}

function NavOverlay({ open, onClose, onExited, children, id = 'nav-overlay' }: NavOverlayProps) {
  const { lang } = useLang()
  const t = NAV_LABELS[lang]
  const closeBtn = useRef<HTMLButtonElement>(null)
  const exited = useRef(onExited)
  const [active, setActive] = useState(false)
  const [closing, setClosing] = useState(false)
  // React to `open` changing during render, not in an effect (no extra render pass).
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setClosing(false)
    } else {
      setActive(false)
      setClosing(overlayDuration() > 0)
    }
  }
  // Stays in the DOM while the closing animation runs.
  const mounted = open || closing
  const wasMounted = useRef(mounted)

  useEffect(() => {
    exited.current = onExited
  })

  // Fires after the closing animation, once .site-nav is visible again and can take focus.
  useEffect(() => {
    if (wasMounted.current && !mounted) exited.current?.()
    wasMounted.current = mounted
  }, [mounted])

  // The toggle that opened the menu is gone now; move focus into the dialog.
  useEffect(() => {
    if (active) closeBtn.current?.focus()
  }, [active])

  // Two frames after mounting, add is-active so the opening transitions run from the closed state.
  useEffect(() => {
    if (!open) return undefined
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setActive(true))
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [open])

  // Unmount when the closing transitions end.
  useEffect(() => {
    if (!closing) return undefined
    const timer = window.setTimeout(() => setClosing(false), overlayDuration())
    return () => window.clearTimeout(timer)
  }, [closing])

  // An event, so a new onClose from each SiteNav render does not toggle inert and the listener again.
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  })

  useEffect(() => {
    if (!mounted) return undefined

    const root = document.documentElement
    root.classList.add('nav-overlay-open')
    // The menu covers the page; inert keeps Tab and screen readers out of what is hidden behind it.
    // The menu is portalled to <body>, outside #root.
    const app = document.getElementById('root')
    app?.setAttribute('inert', '')

    window.addEventListener('keydown', onKey)

    return () => {
      root.classList.remove('nav-overlay-open')
      app?.removeAttribute('inert')
      window.removeEventListener('keydown', onKey)
    }
  }, [mounted])

  if (!mounted) return null

  const cls = [
    'nav-overlay',
    active ? 'is-active' : '',
    closing ? 'is-closing' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return createPortal(
    <div
      id={id}
      className={cls}
      role="dialog"
      aria-modal="true"
      aria-label={t.dialog}
    >
      <header className="nav-overlay__bar">
        <span className="nav-overlay__mark">
          <span className="site-logo">
          {SITE_LOGO}
          <span className="site-logo__cursor" aria-hidden />
        </span>
        </span>
        <OverlayClose ref={closeBtn} onClose={onClose} label={t.close} />
      </header>
      <div className="nav-overlay__body">
        <nav className="nav-overlay__menu">{children}</nav>
      </div>
    </div>,
    document.body,
  )
}
