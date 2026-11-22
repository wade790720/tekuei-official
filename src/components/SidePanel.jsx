import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAdmin } from '../context/admin.js'
import { CMS_LABELS as T } from '../data/admin.js'
import { Button } from './Button.jsx'
import { Drawer, DrawerBody, DrawerHeader } from './Drawer.jsx'
import '../styles/cms.css'

const SAVED_MS = 1600 // how long the save button shows "已儲存" after a save

/**
 * The edit-mode panel: a Drawer with save, logout and preview. The live page re-renders from the draft as you type.
 * Open by default; once collapsed it stays collapsed across pages until reopened from the dock button.
 * @param {{
 *   title: string, subtitle?: string,
 *   dirty: boolean, saving: boolean, error?: string,
 *   onSave: () => void, onLogout: () => void,
 *   preview?: boolean,  // adds the switch between editing and the page as readers see it
 *   children: import('react').ReactNode,
 * }} props
 */
export function SidePanel({ title, subtitle, dirty, saving, error, onSave, onLogout, preview = false, children }) {
  const { panelOpen, setPanelOpen, previewing, setPreviewing } = useAdmin()
  const [justSaved, setJustSaved] = useState(false)
  const [prevSaving, setPrevSaving] = useState(saving)

  // A save that ends without an error flashes "已儲存" on the button.
  if (saving !== prevSaving) {
    setPrevSaving(saving)
    setJustSaved(!saving && !error)
  }

  useEffect(() => {
    if (!justSaved) return undefined
    const id = setTimeout(() => setJustSaved(false), SAVED_MS)
    return () => clearTimeout(id)
  }, [justSaved])

  const saveState = saving ? 'saving' : justSaved && !dirty ? 'saved' : error ? 'error' : 'idle'

  const status = saving ? T.saving : error ? `${T.saveFailed}：${error}` : dirty ? T.unsaved : T.saved

  return (
    <>
      <Drawer open={panelOpen} label={title} push className="cms-panel">
        <DrawerHeader title={title} subtitle={subtitle}>
          <Button variant="ghost" onClick={() => setPanelOpen(false)} aria-label={T.collapse} title={T.collapse}>
            <ChevronIcon />
          </Button>
          {preview ? (
            <Button variant="ghost" aria-pressed={previewing} onClick={() => setPreviewing(!previewing)}>
              <EyeIcon />
              {previewing ? T.backToEdit : T.preview}
            </Button>
          ) : null}
          <Button variant="ghost" onClick={onLogout}>
            {T.logout}
          </Button>
          {/* Lights up only when there is something to save */}
          <Button className="cms-save" data-state={saveState} onClick={onSave} disabled={saving || !dirty}>
            <SaveLabels state={saveState} idle={T.save} />
          </Button>
        </DrawerHeader>
        <div className="cms-panel__status" role="status" data-state={error ? 'error' : dirty ? 'dirty' : 'clean'}>
          {status}
        </div>
        <DrawerBody>{children}</DrawerBody>
      </Drawer>
      {/* Collapsed: the dock shows the same save states, so a Ctrl+S save is visible */}
      {panelOpen
        ? null
        : createPortal(
            <>
              <button type="button" className="cms-dock cms-save" data-state={saveState} onClick={() => setPanelOpen(true)} aria-label={T.expand}>
                <SaveLabels
                  state={saveState}
                  idle={
                    <>
                      <PencilIcon />
                      {T.dock}
                    </>
                  }
                />
                {/* Stays while saving so the dock keeps its width; it goes once the save lands */}
                {dirty ? <span className="cms-dock__dot" title={T.unsaved} /> : null}
              </button>
              {/* The button's aria-label hides its text, so the state is announced here */}
              <span className="cms-dock__status" role="status">
                {saveState === 'idle' ? '' : status}
              </span>
            </>,
            document.body,
          )}
    </>
  )
}

/** One label | value row, as in the Framer CMS sheet. */
export function FormRow({ label, hint, children, htmlFor }) {
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

export function PanelSection({ title, action, children }) {
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

/**
 * Idle, saving and saved labels in one grid cell, so the button keeps the widest label's width.
 * Used by the save button and the dock button.
 */
function SaveLabels({ state, idle }) {
  return (
    <span className="cms-save__stack">
      <span className="cms-save__label" data-on={state === 'idle' || state === 'error' || undefined}>
        {idle}
      </span>
      <span className="cms-save__label" data-on={state === 'saving' || undefined}>
        <span className="cms-spin" aria-hidden />
        {T.saving}
      </span>
      <span className="cms-save__label" data-on={state === 'saved' || undefined}>
        <CheckIcon />
        {T.saved}
      </span>
    </span>
  )
}

export function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 8.5l3.2 3L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
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

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  )
}
