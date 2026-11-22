import { useEffect, useEffectEvent, useId, useRef, useState } from 'react'
import { usePresence } from '../hooks/usePresence.js'
import '../styles/dropdownMenu.css'


/**
 * A menu that drops down from a button: icon, label and shortcut per row, thin dividers between groups.
 * Same role as Radix / shadcn DropdownMenu. With `value` it works as a picker and checks the current item.
 * Use it instead of the native <select>, whose open list the OS draws in light colours.
 * Keyboard: Enter / Space / ↓ opens, ↑ ↓ Home End move, Enter picks, Esc or Tab closes.
 * @param {{
 *   label: string,                 // accessible name of the trigger
 *   trigger: import('react').ReactNode,
 *   items: ({ value: string, label: string, icon?: import('react').ReactNode, kbd?: string } | 'divider')[],
 *   value?: string,                // set for a picker: the current item is checked
 *   onSelect: (value: string) => void,
 *   triggerClassName?: string,
 *   tip?: string,                  // tooltip text for the warm-tooltip toolbar
 *   triggerProps?: Record<string, unknown>, // extra props for the trigger button, e.g. draggable
 * }} props
 */
export function DropdownMenu({ label, trigger, items, value, onSelect, triggerClassName = 'dropdown-menu__trigger', tip, triggerProps }) {
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const button = useRef(null)
  const list = useRef(null)
  const id = useId()
  const shown = usePresence(open, '--duration-exit')
  const choices = items.filter((it) => it !== 'divider')

  const focusItem = (i) => list.current?.querySelectorAll('[role^=menuitem]')[(i + choices.length) % choices.length]?.focus()

  // Opening moves focus into the list: to the checked item, or the first one.
  const focusChecked = useEffectEvent(() => focusItem(Math.max(0, choices.findIndex((c) => c.value === value))))
  useEffect(() => {
    if (!open) return undefined
    focusChecked()
    const away = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])

  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) button.current?.focus()
  }
  const pick = (v) => {
    close()
    onSelect(v)
  }

  const listKey = (e) => {
    const i = choices.findIndex((c) => c.value === document.activeElement?.dataset.value)
    if (e.key === 'ArrowDown') focusItem(i + 1)
    else if (e.key === 'ArrowUp') focusItem(i - 1)
    else if (e.key === 'Home') focusItem(0)
    else if (e.key === 'End') focusItem(choices.length - 1)
    else if (e.key === 'Escape') close()
    else if (e.key === 'Tab') return close(false)
    else return
    e.preventDefault()
  }

  const triggerKey = (e) => {
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
          {items.map((it, i) =>
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
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(it.value)}
              >
                <span className="dropdown-menu__icon" aria-hidden>
                  {it.icon}
                </span>
                <span className="dropdown-menu__label">{it.label}</span>
                {it.kbd ? <kbd className="dropdown-menu__kbd">{it.kbd}</kbd> : null}
                {value !== undefined && it.value === value ? <CheckIcon /> : null}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  )
}

function CheckIcon() {
  return (
    <svg className="dropdown-menu__check" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
