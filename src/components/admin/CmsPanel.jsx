import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAdmin } from '../../context/admin.js'
import { CMS_LABELS as T } from '../../data/admin.js'
import '../../styles/cms.css'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
const SAVE_KEY = isMac ? '⌘S' : 'Ctrl S'

/**
 * Right-side edit panel. It lies over the live page, which re-renders from the draft as you type.
 * Open by default; once collapsed it stays collapsed across pages until reopened from the dock button.
 * @param {{
 *   title: string, subtitle?: string,
 *   dirty: boolean, saving: boolean, error?: string,
 *   onSave: () => void, onLogout: () => void,
 *   children: import('react').ReactNode,
 * }} props
 */
export function CmsPanel({ title, subtitle, dirty, saving, error, onSave, onLogout, children }) {
  const { panelOpen, setPanelOpen } = useAdmin()

  // html.has-cms-panel moves the page and nav left (cms.css) while the panel is open.
  useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.toggle('has-cms-panel', panelOpen)
    return () => root.classList.remove('has-cms-panel')
  }, [panelOpen])

  const status = saving ? T.saving : error ? `${T.saveFailed}：${error}` : dirty ? T.unsaved : T.saved

  // Portal to <body>: page roots such as .journal-page set z-index and would trap the panel under the nav.
  if (!panelOpen) {
    return createPortal(
      <button type="button" className="cms-dock" onClick={() => setPanelOpen(true)} aria-label={T.expand}>
        <PencilIcon />
        <span>{T.dock}</span>
        {dirty ? <span className="cms-dock__dot" title={T.unsaved} /> : null}
      </button>,
      document.body,
    )
  }

  return createPortal(
    <aside className="cms-panel" aria-label={title}>
      <header className="cms-panel__head">
        <div className="cms-panel__heading">
          <div className="cms-panel__title">{title}</div>
          {subtitle ? <div className="cms-panel__subtitle">{subtitle}</div> : null}
        </div>
        <div className="cms-panel__actions">
          <button type="button" className="cms-btn cms-btn--ghost" onClick={() => setPanelOpen(false)} aria-label={T.collapse} title={T.collapse}>
            <ChevronIcon />
          </button>
          <button type="button" className="cms-btn cms-btn--ghost" onClick={onLogout}>
            {T.logout}
          </button>
          {/* Lights up only when there is something to save */}
          <button type="button" className="cms-btn" onClick={onSave} disabled={saving || !dirty}>
            {saving ? T.saving : T.save}
            <kbd className="cms-btn__kbd">{SAVE_KEY}</kbd>
          </button>
        </div>
      </header>
      <div className="cms-panel__status" role="status" data-state={error ? 'error' : dirty ? 'dirty' : 'clean'}>
        {status}
      </div>
      <div className="cms-panel__body">{children}</div>
    </aside>,
    document.body,
  )
}

/** One label | value row, as in the Framer CMS sheet. */
export function CmsRow({ label, hint, children, htmlFor }) {
  return (
    <div className="cms-row">
      <label className="cms-row__label" htmlFor={htmlFor}>
        {label}
      </label>
      <div className="cms-row__value">
        {children}
        {hint ? <div className="cms-row__hint">{hint}</div> : null}
      </div>
    </div>
  )
}

export function CmsSection({ title, action, children }) {
  return (
    <section className="cms-section">
      <div className="cms-section__head">
        <h3 className="cms-section__title">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

export function CmsInput({ value, onChange, ...rest }) {
  return <input className="cms-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />
}

/** A textarea that grows with its text. */
export function CmsTextarea({ value, onChange, mono = false, ...rest }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])
  return (
    <textarea
      ref={ref}
      rows={1}
      className={`cms-input cms-textarea${mono ? ' cms-textarea--mono' : ''}`}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  )
}

export function CmsSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(checked)}
      aria-label={label}
      className="cms-switch"
      onClick={() => onChange(!checked)}
    >
      <span className="cms-switch__knob" aria-hidden />
    </button>
  )
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M10.5 2.5l3 3L6 13H3v-3l7.5-7.5z" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
