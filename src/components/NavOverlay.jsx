import { forwardRef, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { NAV_LABELS } from '../data/nav.js'
import { useLang } from '../i18n'

const OVERLAY_MS = 460

// Shown only while the menu is closed (SiteNav unmounts it when the menu opens),
// so it announces "opens a dialog" instead of a live expanded state.
export const NavToggle = forwardRef(function NavToggle({ onToggle, className = '' }, ref) {
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

export function NavOverlay({ open, onClose, onExited, children, id = 'nav-overlay' }) {
  const { lang } = useLang()
  const t = NAV_LABELS[lang]
  const closeBtn = useRef(null)
  const exited = useRef(onExited)
  const wasMounted = useRef(open)
  const [mounted, setMounted] = useState(open)
  const [active, setActive] = useState(false)
  const [closing, setClosing] = useState(false)

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

  useEffect(() => {
    if (open) {
      setClosing(false)
      setMounted(true)
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setActive(true))
      })
      return () => cancelAnimationFrame(raf)
    }

    if (!mounted) return undefined

    setActive(false)
    setClosing(true)
    const ms = overlayDuration()
    if (ms === 0) {
      setMounted(false)
      setClosing(false)
      return undefined
    }

    const timer = window.setTimeout(() => {
      setMounted(false)
      setClosing(false)
    }, ms)
    return () => window.clearTimeout(timer)
  }, [open, mounted])

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
        <span className="nav-overlay__mark">T E K U E I</span>
        <OverlayClose ref={closeBtn} onClose={onClose} label={t.close} />
      </header>
      <div className="nav-overlay__body">
        <nav className="nav-overlay__menu">{children}</nav>
      </div>
    </div>,
    document.body,
  )
}
