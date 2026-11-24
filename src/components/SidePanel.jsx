import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAdmin } from '../context/admin.js'
import { CMS_LABELS as T, EDIT_BAR_KEY } from '../data/admin.js'
import { clampOffset, parseOffset } from '../lib/editBarPosition.js'
import { Button } from './Button.jsx'
import { Drawer, DrawerBody, DrawerHeader } from './Drawer.jsx'
import { DropdownMenu } from './DropdownMenu.jsx'
import { TooltipGroup } from './Tooltip.jsx'
import '../styles/cms.css'

const SAVED_MS = 1600 // how long the save button shows "已儲存" after a save

/**
 * The edit-mode panel: a Drawer with save, logout and preview. The live page re-renders from the draft as you type.
 * A page with no fields uses variant="bar": the same actions in a floating toolbar, with logout under a menu.
 * Open by default; once collapsed it stays collapsed across pages until reopened from the dock button.
 * @param {{
 *   title: string, subtitle?: string,
 *   dirty: boolean, saving: boolean, error?: string,
 *   onSave: () => void, onLogout: () => void,
 *   preview?: boolean,  // adds the switch between editing and the page as readers see it
 *   variant?: 'drawer' | 'bar',
 *   children: import('react').ReactNode,
 * }} props
 */
export function SidePanel({ title, subtitle, dirty, saving, error, onSave, onLogout, preview = false, variant = 'drawer', children }) {
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

  const previewButton = preview ? (
    <Button variant="ghost" aria-pressed={previewing} onClick={() => setPreviewing(!previewing)}>
      <EyeIcon />
      {previewing ? T.backToEdit : T.preview}
    </Button>
  ) : null
  const saveButton = (
    <Button className="cms-save" data-state={saveState} onClick={onSave} disabled={saving || !dirty}>
      <SaveLabels state={saveState} idle={T.save} />
    </Button>
  )

  if (variant === 'bar') {
    return (
      <EditBar title={title} dirty={dirty} saving={saving} error={error} saveState={saveState} onSave={onSave} onLogout={onLogout} preview={preview}>
        {children}
      </EditBar>
    )
  }

  return (
    <>
      <Drawer open={panelOpen} label={title} push className="cms-panel">
        <DrawerHeader title={title} subtitle={subtitle}>
          <Button variant="ghost" onClick={() => setPanelOpen(false)} aria-label={T.collapse} title={T.collapse}>
            <ChevronIcon />
          </Button>
          {previewButton}
          <Button variant="ghost" onClick={onLogout}>
            {T.logout}
          </Button>
          {/* Lights up only when there is something to save */}
          {saveButton}
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

// Written to the element, not to state: a drag moves it on every pointer event.
function placeBar(el, offset, next) {
  const room = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight }
  const box = { left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight }
  const fitted = clampOffset(next, box, room)
  offset.current = fitted
  el.style.translate = `${fitted.x}px ${fitted.y}px`
  el.toggleAttribute('data-below', box.top + fitted.y + box.height / 2 < room.height / 2)
}

/** The panel's actions as a small toolbar that can be dragged anywhere and remembers where it was left. */
function EditBar({ title, dirty, saving, error, saveState, onSave, onLogout, preview, children }) {
  const { previewing, setPreviewing } = useAdmin()
  const bar = useRef(null)
  const drag = useRef(null)
  const offset = useRef({ x: 0, y: 0 })
  const light = saving ? 'saving' : error ? 'error' : dirty ? 'dirty' : 'clean'
  const previewLabel = previewing ? T.backToEdit : T.preview
  const saveLabel = saving ? T.saving : T.save

  const place = (next) => placeBar(bar.current, offset, next)
  const remember = () => {
    try {
      localStorage.setItem(EDIT_BAR_KEY, JSON.stringify(offset.current))
    } catch {
      /* private mode: the position lasts until the page closes */
    }
  }

  useLayoutEffect(() => {
    let saved = null
    try {
      saved = localStorage.getItem(EDIT_BAR_KEY)
    } catch {
      /* private mode: start from the resting place */
    }
    placeBar(bar.current, offset, parseOffset(saved))
    const again = () => placeBar(bar.current, offset, offset.current)
    const size = new ResizeObserver(again)
    size.observe(bar.current)
    window.addEventListener('resize', again)
    return () => {
      size.disconnect()
      window.removeEventListener('resize', again)
    }
  }, [])

  const dragStart = (e) => {
    if (e.button !== 0 || e.target.closest('button:not(.cms-bar__grip), [role=menu]')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX - offset.current.x, y: e.clientY - offset.current.y }
    bar.current.dataset.dragging = ''
  }
  const dragMove = (e) => {
    if (drag.current) place({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y })
  }
  const dragEnd = () => {
    if (!drag.current) return
    drag.current = null
    delete bar.current.dataset.dragging
    remember()
  }
  const gripKey = (e) => {
    const step = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] }[e.key]
    if (!step) return
    e.preventDefault()
    place({ x: offset.current.x + step[0], y: offset.current.y + step[1] })
    remember()
  }

  return createPortal(
    <TooltipGroup
      ref={bar}
      className="cms-bar"
      role="toolbar"
      aria-label={title}
      onPointerDownCapture={dragStart}
      onPointerMove={dragMove}
      onPointerUp={dragEnd}
      onPointerCancel={dragEnd}
    >
      {error ? (
        <p className="cms-bar__note" role="alert">
          {error}
        </p>
      ) : null}
      <button type="button" className="cms-bar__grip" aria-label={T.moveBar} data-sound="off" onKeyDown={gripKey}>
        <GripIcon />
      </button>
      <span className="cms-bar__status" role="status" data-state={light}>
        <span key={light} className="cms-bar__light" aria-hidden />
        {saving ? T.saving : error ? T.saveFailed : dirty ? T.unsaved : T.saved}
      </span>
      <span className="cms-bar__rule" aria-hidden />
      {preview ? (
        <Button variant="icon" aria-pressed={previewing} aria-label={previewLabel} data-tip={previewLabel} onClick={() => setPreviewing(!previewing)}>
          <EyeIcon />
        </Button>
      ) : null}
      {children}
      <Button
        variant="icon"
        className="cms-save cms-bar__save"
        data-state={saveState}
        aria-label={saveLabel}
        data-tip={saveLabel}
        data-kbd="Ctrl S"
        onClick={onSave}
        disabled={saving || !dirty}
      >
        <span className="icon-swap">
          <span data-off={saveState === 'saving' || saveState === 'saved' || undefined}>
            <SaveIcon />
          </span>
          <span data-off={saveState !== 'saving' || undefined}>
            <span className="cms-spin" />
          </span>
          <span data-off={saveState !== 'saved' || undefined}>
            <CheckIcon />
          </span>
        </span>
      </Button>
      <span className="cms-bar__rule" aria-hidden />
      <DropdownMenu
        label={T.more}
        tip={T.more}
        trigger={<MoreIcon />}
        items={[{ value: 'logout', label: T.logout }]}
        onSelect={onLogout}
        triggerClassName="btn btn--icon"
      />
    </TooltipGroup>,
    document.body,
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

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      {[3, 8, 13].flatMap((y) => [<circle key={`a${y}`} cx="6" cy={y} r="1.1" />, <circle key={`b${y}`} cx="10" cy={y} r="1.1" />])}
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3.5 2.5h7l3 3v7a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z" />
      <path d="M5 2.5v3h5v-3" />
      <path d="M5 13.5v-4.5h6v4.5" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <circle cx="3" cy="8" r="1.25" />
      <circle cx="8" cy="8" r="1.25" />
      <circle cx="13" cy="8" r="1.25" />
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
