import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAdmin } from '../context/admin.ts'
import { CMS_LABELS as T, EDIT_BAR_KEY } from '../data/admin.ts'
import { clampOffset, parseOffset } from '../lib/editBarPosition.ts'
import { Button } from './Button.jsx'
import { Drawer, DrawerBody, DrawerHeader } from './Drawer.jsx'
import { DropdownMenu } from './DropdownMenu.jsx'
import { TextField } from './TextField.jsx'
import { TooltipGroup } from './Tooltip.jsx'
import '../styles/cms.css'

const SAVED_MS = 1600 // how long the save button shows "已儲存" after a save

/**
 * The edit-mode panel: a Drawer of fields, with its actions as icon buttons in the header. The live page re-renders
 * from the draft as you type. A page with no fields uses variant="bar": the same buttons in a floating toolbar.
 * Open by default; once collapsed it stays collapsed across pages until reopened from the dock button.
 * @param {{
 *   title: string, subtitle?: string,
 *   dirty: boolean, saving: boolean, error?: string,
 *   onSave: () => void, onLogout: () => void,
 *   preview?: boolean,  // adds the switch between editing and the page as readers see it
 *   saveLabel?: string,   // the save button's name in its tooltip, e.g. 發布 or 更新 instead of 儲存
 *   saveAlways?: boolean, // the save button works with nothing changed (publishing does)
 *   labels?: { dirty?: string, saved?: string },  // the status line for unsaved and saved
 *   menu?: { value: string, label: string, icon: import('react').ReactNode, onSelect: () => void }[],  // more actions under ⋯, above logout; each has an icon
 *   variant?: 'drawer' | 'bar',
 *   actions?: import('react').ReactNode,  // the page's own icon buttons, between preview and save (TranslateSection)
 *   children?: import('react').ReactNode, // the fields; the toolbar has none
 * }} props
 */
export function SidePanel({ title, subtitle, dirty, saving, error, onSave, onLogout, preview = false, variant = 'drawer', saveLabel = T.save, saveAlways = false, labels = {}, menu = [], actions, children }) {
  const { panelOpen, setPanelOpen } = useAdmin()
  const [justSaved, setJustSaved] = useState(false)
  const [prevSaving, setPrevSaving] = useState(saving)

  // A save that ends without an error shows a tick on the button.
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
  const light = saving ? 'saving' : error ? 'error' : dirty ? 'dirty' : 'clean'
  const status = saving ? T.saving : error ? `${T.saveFailed}：${error}` : dirty ? (labels.dirty ?? T.unsaved) : (labels.saved ?? T.saved)
  // One set of buttons for both layouts, so the drawer and the toolbar cannot drift apart.
  const buttons = (
    <PanelActions
      preview={preview}
      actions={actions}
      saveState={saveState}
      saveLabel={saving ? T.saving : saveLabel}
      canSave={!saving && (dirty || saveAlways)}
      onSave={onSave}
      menu={menu}
      onLogout={onLogout}
    />
  )

  if (variant === 'bar') {
    return (
      <EditBar title={title} error={error} status={<PanelStatus light={light}>{saving ? T.saving : error ? T.saveFailed : dirty ? T.unsaved : T.saved}</PanelStatus>}>
        {buttons}
      </EditBar>
    )
  }

  return (
    <>
      <Drawer open={panelOpen} label={title} push className="cms-panel">
        <DrawerHeader title={title} subtitle={subtitle}>
          <TooltipGroup className="cms-actions">
            <Button variant="icon" onClick={() => setPanelOpen(false)} aria-label={T.collapse} data-tip={T.collapse}>
              <ChevronIcon />
            </Button>
            {buttons}
          </TooltipGroup>
        </DrawerHeader>
        <div className="cms-panel__status">
          <PanelStatus light={light}>{status}</PanelStatus>
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

/** The save state as a light and a line of text: green saved, gold unsaved or saving, red failed. */
function PanelStatus({ light, children }) {
  return (
    <span className="cms-bar__status" role="status" data-state={light}>
      <span key={light} className="cms-bar__light" aria-hidden />
      {children}
    </span>
  )
}

/**
 * The actions of an edit panel, as 32px icon buttons with their names in tooltips: preview, the page's own
 * actions (translate), save, then logout: a button of its own, or the last row of the menu when the page has
 * more actions. It sits inside a TooltipGroup.
 */
function PanelActions({ preview, actions, saveState, saveLabel, canSave, onSave, menu, onLogout }) {
  const { previewing, setPreviewing } = useAdmin()
  const previewLabel = previewing ? T.backToEdit : T.preview
  return (
    <>
      {preview ? (
        <Button variant="icon" aria-pressed={previewing} aria-label={previewLabel} data-tip={previewLabel} onClick={() => setPreviewing(!previewing)}>
          <EyeIcon />
        </Button>
      ) : null}
      {actions}
      <Button
        variant="icon"
        className="cms-save cms-bar__save"
        data-state={saveState}
        aria-label={saveLabel}
        data-tip={saveLabel}
        data-kbd="Ctrl S"
        onClick={onSave}
        disabled={!canSave}
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
      {/* One action is a button. A menu is for a choice between two or more. */}
      {menu.length ? (
        <DropdownMenu
          label={T.more}
          tip={T.more}
          trigger={<MoreIcon />}
          items={[...menu, 'divider', { value: 'logout', label: T.logout, icon: <LogoutIcon /> }]}
          onSelect={(value) => (value === 'logout' ? onLogout() : menu.find((m) => m.value === value)?.onSelect())}
          triggerClassName="btn btn--icon"
        />
      ) : (
        <Button variant="icon" aria-label={T.logout} data-tip={T.logout} onClick={onLogout}>
          <LogoutIcon />
        </Button>
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
function EditBar({ title, error, status, children }) {
  const bar = useRef(null)
  const drag = useRef(null)
  const offset = useRef({ x: 0, y: 0 })

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
      {status}
      <span className="cms-bar__rule" aria-hidden />
      {children}
    </TooltipGroup>,
    document.body,
  )
}

/** One label | value row, as in the Framer CMS sheet. `hint` shows while the field is in use; `error` always shows. */
export function FormRow({ label, hint, error, children, htmlFor }) {
  return (
    <div className="cms-row">
      <label className="cms-row__label" htmlFor={htmlFor}>
        {label}
      </label>
      <div className="cms-row__value">
        {children}
        {hint ? <div className="cms-row__hint">{hint}</div> : null}
        {error ? (
          <div className="cms-row__error" role="alert">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  )
}

/**
 * Rows that reorder: drag one by its handle (mouse, pen or touch), or focus the handle and press ↑ / ↓.
 * With listAt and onMoveTo, a row can also be dragged into another list of the same kind.
 * @param {{
 *   items: unknown[],
 *   keyOf: (item: any) => string,
 *   nameOf: (item: any) => string,           // names the row in the handle's label
 *   onMove: (from: number, to: number) => void,
 *   listAt?: (x: number, y: number) => Element | null | undefined,  // the .cms-sort under the pointer
 *   onMoveTo?: (from: number, list: Element, at: number) => void,   // dropped in another list, before its row `at`
 *   rowClassName?: string,                   // the row's own layout; the default is the panel's list row
 *   children: (item: any, i: number) => import('react').ReactNode,  // the cells after the handle
 * }} props
 */
export function SortRows({ items, keyOf, nameOf, onMove, listAt, onMoveTo, rowClassName = 'cms-row cms-post', children }) {
  const [drag, setDrag] = useState(null) // { from, gap, list } while a row is dragged; gap k = insert before row k; list = another list, or null
  const root = useRef(null)
  const rows = useRef([])
  const marked = useRef(null)
  const rowsOf = (list) => [...list.querySelectorAll(':scope > .cms-sort__row')]
  const gapIn = (list, y) => {
    const k = rowsOf(list).findIndex((el) => y < el.getBoundingClientRect().top + el.offsetHeight / 2)
    return k < 0 ? rowsOf(list).length : k
  }
  // The other list belongs to another component, so its drop line is set on the DOM.
  const mark = (list, gap) => {
    marked.current?.removeAttribute('data-drop')
    const els = list ? rowsOf(list) : []
    marked.current = list ? (els[gap] ?? els.at(-1) ?? list) : null
    marked.current?.setAttribute('data-drop', gap < els.length ? 'before' : 'after')
  }
  // Removing the dragged row first shifts the rows below it up by one.
  const target = (d) => (d.gap > d.from ? d.gap - 1 : d.gap)
  const dragMove = (e) => {
    if (!drag) return
    const under = listAt?.(e.clientX, e.clientY)
    const list = under && under !== root.current ? under : null
    const gap = gapIn(list ?? root.current, e.clientY)
    if (gap === drag.gap && list === drag.list) return // pointermove fires far more often than the gap changes
    mark(list, gap)
    setDrag({ ...drag, gap, list })
  }
  const dragStop = () => {
    mark(null)
    setDrag(null)
  }
  const dragEnd = () => {
    if (drag?.list) onMoveTo(drag.from, drag.list, drag.gap)
    else if (drag && target(drag) !== drag.from) onMove(drag.from, target(drag))
    dragStop()
  }
  const dragKey = (e, i) => {
    const to = e.key === 'ArrowUp' ? i - 1 : e.key === 'ArrowDown' ? i + 1 : -1
    if (to < 0 || to >= items.length) return
    e.preventDefault()
    onMove(i, to)
    requestAnimationFrame(() => rows.current[to]?.querySelector('.cms-drag')?.focus())
  }
  const moved = drag && !drag.list && target(drag) !== drag.from

  return (
    <div className="cms-sort" ref={root} data-dragging={drag ? '' : undefined}>
      {items.map((item, i) => (
        <div
          className={`cms-sort__row ${rowClassName}`}
          key={keyOf(item)}
          ref={(el) => (rows.current[i] = el)}
          data-dragged={drag?.from === i || undefined}
          data-drop={!moved ? undefined : drag.gap === i ? 'before' : drag.gap === items.length && i === items.length - 1 ? 'after' : undefined}
        >
          <button
            type="button"
            className="cms-drag"
            aria-label={`拖曳調整「${nameOf(item)}」的順序，或用上下鍵`}
            onPointerDown={(e) => {
              e.preventDefault()
              e.currentTarget.setPointerCapture(e.pointerId)
              setDrag({ from: i, gap: i, list: null })
            }}
            onPointerMove={dragMove}
            onPointerUp={dragEnd}
            onPointerCancel={dragStop}
            onKeyDown={(e) => dragKey(e, i)}
          >
            <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden>
              {[2, 7, 12].flatMap((y) => [<circle key={`a${y}`} cx="2.5" cy={y} r="1.2" />, <circle key={`b${y}`} cx="7.5" cy={y} r="1.2" />])}
            </svg>
          </button>
          {children(item, i)}
        </div>
      ))}
    </div>
  )
}

/**
 * Tags as one line of text. It keeps what Wade types (a trailing comma, a half-typed tag) and saves the parsed list.
 * Give it a `key` that changes with the item it edits.
 */
export function TagsInput({ id, tags, parse, onChange }) {
  const [text, setText] = useState(() => tags.join(', '))
  return (
    <TextField
      id={id}
      value={text}
      onChange={(v) => {
        setText(v)
        onChange(parse(v))
      }}
    />
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

/** Making a draft public: the menu's 發布. */
export function PublishIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 10.5v-8M4.8 5.5 8 2.5l3.2 3M2.5 10.5v2a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-2" />
    </svg>
  )
}

/** Taking a post or project out of public view: the menu's 取消公開. */
export function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6.3 3.7A6.4 6.4 0 0 1 8 3.5c3.6 0 5.8 3.2 6.5 4.5a8.6 8.6 0 0 1-1.7 2.3M10.8 11.6A5.9 5.9 0 0 1 8 12.5c-3.6 0-5.8-3.2-6.5-4.5a9 9 0 0 1 2.7-3.1" />
      <path d="M6.6 6.6a2 2 0 0 0 2.8 2.8M2 2l12 12" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 13.5H3.5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1H6M10.5 11l3-3-3-3M13.5 8h-7" />
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
