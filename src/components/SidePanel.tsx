import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent, ReactNode, RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useAdmin } from '../context/admin.ts'
import { CMS_LABELS as T, EDIT_BAR_KEY } from '../data/admin.ts'
import { clampOffset, parseOffset } from '../lib/editBarPosition.ts'
import type { Offset } from '../lib/editBarPosition.ts'
import { Button } from './Button.tsx'
import { Drawer, DrawerBody, DrawerHeader } from './Drawer.tsx'
import { DropdownMenu } from './DropdownMenu.tsx'
import type { MenuChoice } from './DropdownMenu.tsx'
import { TextField } from './TextField.tsx'
import { TooltipGroup } from './Tooltip.tsx'
import '../styles/cms.css'

const SAVED_MS = 1600

type SaveState = 'idle' | 'saving' | 'saved' | 'error'
type Light = 'clean' | 'dirty' | 'saving' | 'error'

/** One more action under ⋯, above logout. Each has an icon. */
export interface PanelMenuAction extends MenuChoice {
  icon: ReactNode
  onSelect: () => void
}

/**
 * The edit-mode panel: a Drawer of fields, with its actions as icon buttons in the header. The live page re-renders
 * from the draft as you type. A page with no fields uses variant="bar": the same buttons in a floating toolbar.
 * Open by default; once collapsed it stays collapsed across pages until reopened from the dock button.
 */
export interface SidePanelProps {
  title: string
  subtitle?: string
  dirty: boolean
  saving: boolean
  error?: string
  onSave: () => void
  onLogout: () => void
  /** Adds the switch between editing and the page as readers see it. */
  preview?: boolean
  /** The save button's name in its tooltip, e.g. 發布 or 更新 instead of 儲存. */
  saveLabel?: string
  /** The save button works with nothing changed (publishing does). */
  saveAlways?: boolean
  /** The status line for unsaved and saved. */
  labels?: { dirty?: string; saved?: string }
  menu?: PanelMenuAction[]
  variant?: 'drawer' | 'bar'
  /** The page's own icon buttons, between preview and save (TranslateSection). */
  actions?: ReactNode
  /** The fields; the toolbar has none. */
  children?: ReactNode
}

export function SidePanel({ title, subtitle, dirty, saving, error, onSave, onLogout, preview = false, variant = 'drawer', saveLabel = T.save, saveAlways = false, labels = {}, menu = [], actions, children }: SidePanelProps) {
  const { panelOpen, setPanelOpen } = useAdmin()
  const [justSaved, setJustSaved] = useState(false)
  const [prevSaving, setPrevSaving] = useState(saving)

  if (saving !== prevSaving) {
    setPrevSaving(saving)
    setJustSaved(!saving && !error)
  }

  useEffect(() => {
    if (!justSaved) return undefined
    const id = setTimeout(() => setJustSaved(false), SAVED_MS)
    return () => clearTimeout(id)
  }, [justSaved])

  const saveState: SaveState = saving ? 'saving' : justSaved && !dirty ? 'saved' : error ? 'error' : 'idle'
  const light: Light = saving ? 'saving' : error ? 'error' : dirty ? 'dirty' : 'clean'
  const status = saving ? T.saving : error ? `${T.saveFailed}：${error}` : dirty ? (labels.dirty ?? T.unsaved) : (labels.saved ?? T.saved)
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

function PanelStatus({ light, children }: { light: Light; children: ReactNode }) {
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
interface PanelActionsProps {
  preview: boolean
  actions?: ReactNode
  saveState: SaveState
  saveLabel: string
  canSave: boolean
  onSave: () => void
  menu: PanelMenuAction[]
  onLogout: () => void
}

function PanelActions({ preview, actions, saveState, saveLabel, canSave, onSave, menu, onLogout }: PanelActionsProps) {
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

function placeBar(el: HTMLElement, offset: RefObject<Offset>, next: Offset) {
  const room = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight }
  const box = { left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight }
  const fitted = clampOffset(next, box, room)
  offset.current = fitted
  el.style.translate = `${fitted.x}px ${fitted.y}px`
  el.toggleAttribute('data-below', box.top + fitted.y + box.height / 2 < room.height / 2)
}

const GRIP_STEPS: Partial<Record<string, [number, number]>> = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] }

interface EditBarProps {
  title: string
  error?: string
  status: ReactNode
  children: ReactNode
}

function EditBar({ title, error, status, children }: EditBarProps) {
  const bar = useRef<HTMLDivElement>(null)
  const drag = useRef<Offset | null>(null)
  const offset = useRef<Offset>({ x: 0, y: 0 })

  const place = (next: Offset) => {
    if (bar.current) placeBar(bar.current, offset, next)
  }
  const remember = () => {
    try {
      localStorage.setItem(EDIT_BAR_KEY, JSON.stringify(offset.current))
    } catch {
      /* private mode: the position lasts until the page closes */
    }
  }

  useLayoutEffect(() => {
    const el = bar.current
    if (!el) return
    let saved: string | null = null
    try {
      saved = localStorage.getItem(EDIT_BAR_KEY)
    } catch {
      /* private mode: start from the resting place */
    }
    placeBar(el, offset, parseOffset(saved))
    const again = () => placeBar(el, offset, offset.current)
    const size = new ResizeObserver(again)
    size.observe(el)
    window.addEventListener('resize', again)
    return () => {
      size.disconnect()
      window.removeEventListener('resize', again)
    }
  }, [])

  const dragStart = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target instanceof Element && e.target.closest('button:not(.cms-bar__grip), [role=menu]'))) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX - offset.current.x, y: e.clientY - offset.current.y }
    e.currentTarget.dataset.dragging = ''
  }
  const dragMove = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current) place({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y })
  }
  const dragEnd = () => {
    if (!drag.current) return
    drag.current = null
    if (bar.current) delete bar.current.dataset.dragging
    remember()
  }
  const gripKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const step = GRIP_STEPS[e.key]
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
export interface FormRowProps {
  label: ReactNode
  hint?: ReactNode
  error?: ReactNode
  htmlFor?: string
  children: ReactNode
}

export function FormRow({ label, hint, error, children, htmlFor }: FormRowProps) {
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
 */
export interface SortRowsProps<T> {
  items: readonly T[]
  keyOf: (item: T) => string
  /** Names the row in the handle's label. */
  nameOf: (item: T) => string
  onMove: (from: number, to: number) => void
  /** The .cms-sort under the pointer. */
  listAt?: (x: number, y: number) => Element | null | undefined
  /** Dropped in another list, before its row `at`. */
  onMoveTo?: (from: number, list: Element, at: number) => void
  /** The row's own layout; the default is the panel's list row. */
  rowClassName?: string
  /** The cells after the handle. */
  children: (item: T, i: number) => ReactNode
}

interface RowDrag {
  from: number
  gap: number
  list: Element | null
}

export function SortRows<T>({ items, keyOf, nameOf, onMove, listAt, onMoveTo, rowClassName = 'cms-row cms-post', children }: SortRowsProps<T>) {
  const [drag, setDrag] = useState<RowDrag | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const rows = useRef<(HTMLDivElement | null)[]>([])
  const marked = useRef<Element | null>(null)
  const rowsOf = (list: Element) => [...list.querySelectorAll<HTMLElement>(':scope > .cms-sort__row')]
  const gapIn = (list: Element, y: number) => {
    const k = rowsOf(list).findIndex((el) => y < el.getBoundingClientRect().top + el.offsetHeight / 2)
    return k < 0 ? rowsOf(list).length : k
  }
  const mark = (list: Element | null, gap = 0) => {
    marked.current?.removeAttribute('data-drop')
    const els = list ? rowsOf(list) : []
    marked.current = list ? (els[gap] ?? els.at(-1) ?? list) : null
    marked.current?.setAttribute('data-drop', gap < els.length ? 'before' : 'after')
  }
  const target = (d: RowDrag) => (d.gap > d.from ? d.gap - 1 : d.gap)
  const dragMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag || !root.current) return
    const under = listAt?.(e.clientX, e.clientY)
    const list = under && under !== root.current ? under : null
    const gap = gapIn(list ?? root.current, e.clientY)
    if (gap === drag.gap && list === drag.list) return
    mark(list, gap)
    setDrag({ ...drag, gap, list })
  }
  const dragStop = () => {
    mark(null)
    setDrag(null)
  }
  const dragEnd = () => {
    if (drag?.list) onMoveTo?.(drag.from, drag.list, drag.gap)
    else if (drag && target(drag) !== drag.from) onMove(drag.from, target(drag))
    dragStop()
  }
  const dragKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const to = e.key === 'ArrowUp' ? i - 1 : e.key === 'ArrowDown' ? i + 1 : -1
    if (to < 0 || to >= items.length) return
    e.preventDefault()
    onMove(i, to)
    requestAnimationFrame(() => rows.current[to]?.querySelector<HTMLElement>('.cms-drag')?.focus())
  }
  const moved = drag && !drag.list && target(drag) !== drag.from

  return (
    <div className="cms-sort" ref={root} data-dragging={drag ? '' : undefined}>
      {items.map((item, i) => (
        <div
          className={`cms-sort__row ${rowClassName}`}
          key={keyOf(item)}
          ref={(el) => {
            rows.current[i] = el
          }}
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
export interface TagsInputProps {
  id: string
  tags: string[]
  parse: (text: string) => string[]
  onChange: (tags: string[]) => void
}

export function TagsInput({ id, tags, parse, onChange }: TagsInputProps) {
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

export interface PanelSectionProps {
  title: ReactNode
  action?: ReactNode
  children: ReactNode
}

export function PanelSection({ title, action, children }: PanelSectionProps) {
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

function SaveLabels({ state, idle }: { state: SaveState; idle: ReactNode }) {
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
