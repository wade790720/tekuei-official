import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const OVERLAY_MS = 460

export function NavToggle({ onToggle, className = '' }) {
  return (
    <button
      type="button"
      className={['nav-toggle', className].filter(Boolean).join(' ')}
      onClick={onToggle}
      aria-expanded={false}
      aria-label="開啟選單"
    >
      <span className="nav-toggle__line" aria-hidden />
      <span className="nav-toggle__line" aria-hidden />
      <span className="nav-toggle__line" aria-hidden />
    </button>
  )
}

function OverlayClose({ onClose }) {
  return (
    <button
      type="button"
      className="nav-overlay__close"
      onClick={onClose}
      aria-label="關閉選單"
    >
      <span className="nav-overlay__close-line" aria-hidden />
      <span className="nav-overlay__close-line" aria-hidden />
    </button>
  )
}

function overlayDuration() {
  if (typeof window === 'undefined') return OVERLAY_MS
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : OVERLAY_MS
}

export function NavOverlay({ open, onClose, children, id = 'nav-overlay' }) {
  const [mounted, setMounted] = useState(open)
  const [active, setActive] = useState(false)
  const [closing, setClosing] = useState(false)

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
      aria-label="網站導覽"
      style={{ '--nav-overlay-ms': `${OVERLAY_MS}ms` }}
    >
      <header className="nav-overlay__bar">
        <span className="nav-overlay__mark">T E K U E I</span>
        <OverlayClose onClose={onClose} />
      </header>
      <div className="nav-overlay__body">
        <nav className="nav-overlay__menu">{children}</nav>
      </div>
    </div>,
    document.body,
  )
}
