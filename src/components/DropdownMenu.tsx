import { useEffect, useEffectEvent, useId, useRef, useState } from 'react'
import type { ButtonHTMLAttributes, KeyboardEvent, ReactNode } from 'react'
import { usePresence } from '../hooks/usePresence.ts'
import '../styles/dropdownMenu.css'

export interface MenuChoice<V extends string = string> {
  value: V
  label: string
  icon?: ReactNode
  kbd?: string
}

export type MenuItem<V extends string = string> = MenuChoice<V> | 'divider'

export interface DropdownMenuProps<V extends string = string> {
  /** accessible name of the trigger */
  label: string
  trigger: ReactNode
  items: readonly MenuItem<V>[]
  /** set for a picker: the current item is checked */
  value?: V
  onSelect: (value: V) => void
  triggerClassName?: string
  /** tooltip text for the warm-tooltip toolbar */
  tip?: string
  /** extra props for the trigger button, e.g. draggable */
  triggerProps?: ButtonHTMLAttributes<HTMLButtonElement>
}

/**
 * A menu that drops down from a button: icon, label and shortcut per row, thin dividers between groups.
 * Same role as Radix / shadcn DropdownMenu. With `value` it works as a picker and checks the current item.
 * Use it instead of the native <select>, whose open list the OS draws in light colours.
 * Keyboard: Enter / Space / ↓ opens, ↑ ↓ Home End move, Enter picks, Esc or Tab closes.
 */
export function DropdownMenu<V extends string = string>({
  label,
  trigger,
  items,
  value,
  onSelect,
  triggerClassName = 'dropdown-menu__trigger',
  tip,
  triggerProps,
}: DropdownMenuProps<V>) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const id = useId()
  const shown = usePresence(open, '--duration-exit')
  const choices = items.filter((it) => it !== 'divider')
  if (import.meta.env.DEV && choices.length < 2) {
    console.error(`DropdownMenu「${label}」只有 ${choices.length} 個選項。一個動作用 Button，選單是給兩個以上的選項用的。`)
  }

  const focusItem = (i: number) =>
    list.current?.querySelectorAll<HTMLElement>('[role^=menuitem]')[(i + choices.length) % choices.length]?.focus()

  // Opening moves focus into the list: to the checked item, or the first one.
  const focusChecked = useEffectEvent(() => focusItem(Math.max(0, choices.findIndex((c) => c.value === value))))
  useEffect(() => {
    if (!open) return undefined
    focusChecked()
    const away = (e: PointerEvent) => {
      if (!(e.target instanceof Node && root.current?.contains(e.target))) setOpen(false)
    }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])

  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) button.current?.focus()
  }
  const pick = (v: V) => {
    close()
    onSelect(v)
  }

  const listKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const focused = document.activeElement
    const i = choices.findIndex((c) => focused instanceof HTMLElement && c.value === focused.dataset.value)
    if (e.key === 'ArrowDown') focusItem(i + 1)
    else if (e.key === 'ArrowUp') focusItem(i - 1)
    else if (e.key === 'Home') focusItem(0)
    else if (e.key === 'End') focusItem(choices.length - 1)
    else if (e.key === 'Escape') close()
    else if (e.key === 'Tab') return close(false)
    else return
    e.preventDefault()
  }

  const triggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
    }
  }

  return (
    <div className="dropdown-menu" ref={root}>
      <button
        ref={button}
        type="button"
        className={triggerClassName}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        data-tip={open ? undefined : tip}
        // Keeps the editor's text selection. A draggable trigger needs the default, or its drag never starts.
        onMouseDown={(e) => e.currentTarget.draggable || e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={triggerKey}
        {...triggerProps}
      >
        {trigger}
      </button>
      {shown ? (
        <div
          className="dropdown-menu__list"
          role="menu"
          id={id}
          aria-label={label}
          ref={list}
          onKeyDown={listKey}
          data-closing={open ? undefined : true}
          inert={!open}
        >
          <MenuItems items={items} value={value} onPick={pick} />
        </div>
      ) : null}
    </div>
  )
}

export interface MenuItemsProps<V extends string = string> {
  items: readonly MenuItem<V>[]
  value?: V
  active?: V
  onPick: (value: V) => void
}

/**
 * The rows of a menu list. DropdownMenu draws its list with it, and so does the editor's "/" menu,
 * where focus stays in the text and `active` marks the row the arrow keys are on.
 */
export function MenuItems<V extends string = string>({ items, value, active, onPick }: MenuItemsProps<V>) {
  // A menu with no icons at all (a plain picker) has no icon column; one with some keeps the labels in line.
  const hasIcons = items.some((it) => it !== 'divider' && it.icon)
  return items.map((it, i) =>
    it === 'divider' ? (
      <div key={`d${i}`} className="dropdown-menu__divider" role="separator" />
    ) : (
      <button
        key={it.value}
        type="button"
        role={value === undefined ? 'menuitem' : 'menuitemradio'}
        aria-checked={value === undefined ? undefined : it.value === value}
        className="dropdown-menu__item"
        data-value={it.value}
        data-active={it.value === active || undefined}
        tabIndex={-1}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onPick(it.value)}
      >
        {hasIcons ? (
          <span className="dropdown-menu__icon" aria-hidden>
            {it.icon}
          </span>
        ) : null}
        <span className="dropdown-menu__label">{it.label}</span>
        {it.kbd ? <kbd className="dropdown-menu__kbd">{it.kbd}</kbd> : null}
        {value !== undefined && it.value === value ? <CheckIcon /> : null}
      </button>
    ),
  )
}

function CheckIcon() {
  return (
    <svg className="dropdown-menu__check" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
