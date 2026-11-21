// The site's top navigation and its parts: SiteNavLinks (shared by the bar and the phone menu),
// NavToggle (the phone menu button) and NavOverlay (the full-screen phone menu).
import { forwardRef, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation } from 'react-router-dom'
import { HOME_FOOTER } from '../data/homepage.js'
import { NAV_LABELS, SITE_LOGO } from '../data/nav.js'
import { useLang } from '../i18n'
import { playWaterRipple } from '../lib/waterRipple.js'
import '../styles/siteNav.css'
import '../styles/navOverlay.css'

// No page has a contact section, so Contact opens a new email. The address is the same in both languages.
const CONTACT_HREF = HOME_FOOTER.zh.contact.find((link) => link.href?.startsWith('mailto:')).href

function subscribeScroll(onChange) {
  window.addEventListener('scroll', onChange, { passive: true })
  return () => window.removeEventListener('scroll', onChange)
}

/**
 * @param {{
 *   highlightWorkSection?: boolean
 *   highlightJournal?: boolean
 *   variant?: 'default' | 'case'
 * }} props
 */
export function SiteNav({
  highlightWorkSection = false,
  highlightJournal = false,
  variant = 'default',
}) {
  useLocation() // re-render on route change, so `scrolled` is read again
  const [open, setOpen] = useState(false)
  const { lang, toggle } = useLang()
  const t = NAV_LABELS[lang]
  const toggleRef = useRef(null)
  const close = () => setOpen(false)
  const switchLang = (e) => {
    // Keyboard presses have no pointer position (detail 0): start from the button's centre.
    const r = e.currentTarget.getBoundingClientRect()
    const fromPointer = e.detail > 0
    // The language changes while the waves are strongest, so the new text seems to arrive with them.
    playWaterRipple(fromPointer ? e.clientX : r.left + r.width / 2, fromPointer ? e.clientY : r.top + r.height / 2, toggle)
  }
  // The toggle unmounts while the menu is open; give it focus back once the menu has gone.
  const onMenuExited = () => toggleRef.current?.focus()

  // Read on every render too, so a route change (which re-renders the nav) picks up the new position.
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 80)

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
        <SiteNavLinks
          highlightWorkSection={highlightWorkSection}
          highlightJournal={highlightJournal}
        />
        <button type="button" className="site-nav__lang" onClick={switchLang} aria-label={t.lang}>
          {lang === 'zh' ? 'EN' : 'TW'}
        </button>
      </div>
      {!open && <NavToggle ref={toggleRef} onToggle={() => setOpen(true)} />}
      <NavOverlay open={open} onClose={close} onExited={onMenuExited} id="site-nav-overlay">
        <SiteNavLinks
          variant="overlay"
          onNavigate={close}
          highlightWorkSection={highlightWorkSection}
          highlightJournal={highlightJournal}
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

// ── SiteNavLinks ──

/**
 * @param {{
 *   onNavigate?: () => void
 *   variant?: 'desktop' | 'overlay'
 *   highlightWorkSection?: boolean
 *   highlightJournal?: boolean
 * }} props
 */
function SiteNavLinks({
  onNavigate,
  variant = 'desktop',
  highlightWorkSection = false,
  highlightJournal = false,
}) {
  const overlay = variant === 'overlay'

  const linkClass = (active) =>
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
        to="/work"
        className={({ isActive }) =>
          linkClass(isActive || highlightWorkSection)
        }
        onClick={onNavigate}
      >
        Work
      </NavLink>
      <NavLink
        to="/journal"
        className={({ isActive }) =>
          linkClass(isActive || highlightJournal)
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

// ── NavToggle / NavOverlay ──

const OVERLAY_MS = 250 // also --nav-overlay-ms in navOverlay.css

// Shown only while the menu is closed (SiteNav unmounts it when the menu opens),
// so it announces "opens a dialog" instead of a live expanded state.
const NavToggle = forwardRef(function NavToggle({ onToggle, className = '' }, ref) {
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
})

const OverlayClose = forwardRef(function OverlayClose({ onClose, label }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className="nav-overlay__close"
      onClick={onClose}
      aria-label={label}
    >
      <span className="nav-overlay__close-line" aria-hidden />
      <span className="nav-overlay__close-line" aria-hidden />
    </button>
  )
})

function overlayDuration() {
  if (typeof window === 'undefined') return OVERLAY_MS
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : OVERLAY_MS
}

function NavOverlay({ open, onClose, onExited, children, id = 'nav-overlay' }) {
  const { lang } = useLang()
  const t = NAV_LABELS[lang]
  const closeBtn = useRef(null)
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
  // Wait for is-active: before it the overlay is visibility: hidden and cannot take focus.
  useEffect(() => {
    if (active) closeBtn.current?.focus()
  }, [active])

  // Two frames after mounting, add is-active so the opening transition runs from the hidden state.
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

  // Unmount when the closing animation ends.
  useEffect(() => {
    if (!closing) return undefined
    const timer = window.setTimeout(() => setClosing(false), overlayDuration())
    return () => window.clearTimeout(timer)
  }, [closing])

  useEffect(() => {
    if (!mounted) return undefined

    const root = document.documentElement
    root.classList.add('nav-overlay-open')

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      root.classList.remove('nav-overlay-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [mounted, onClose])

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
      style={{ '--nav-overlay-ms': `${OVERLAY_MS}ms` }}
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
