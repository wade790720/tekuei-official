import { useLayoutEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ScrollShadow } from './ScrollShadow.tsx'
import { usePresence } from '../hooks/usePresence.ts'
import '../styles/drawer.css'

export interface DrawerProps {
  open: boolean
  /** accessible name of the panel */
  label: string
  /** wide screens (1100px+): the page moves left instead of being covered */
  push?: boolean
  className?: string
  children?: ReactNode
}

/**
 * A panel that slides in from the right edge. Put DrawerHeader and DrawerBody inside.
 * Portalled to <body>: page roots such as .journal-page set z-index and would trap it under the nav.
 */
export function Drawer({ open, label, push = false, className = '', children }: DrawerProps) {
  useLayoutEffect(() => {
    if (!open || !push) return undefined
    const root = document.documentElement
    root.classList.add('has-drawer')
    return () => root.classList.remove('has-drawer')
  }, [open, push])

  const shown = usePresence(open, '--duration-base')
  if (!shown) return null
  return createPortal(
    <aside className={className ? `drawer ${className}` : 'drawer'} aria-label={label} data-closing={open ? undefined : true} inert={!open}>
      {children}
    </aside>,
    document.body,
  )
}

export interface DrawerHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  /** the actions on the right */
  children?: ReactNode
}

/** Title, optional subtitle, and the actions (children) on the right. */
export function DrawerHeader({ title, subtitle, children }: DrawerHeaderProps) {
  return (
    <header className="drawer__head">
      <div className="drawer__heading">
        <div className="drawer__title">{title}</div>
        {subtitle ? <div className="drawer__subtitle">{subtitle}</div> : null}
      </div>
      {children ? <div className="drawer__actions">{children}</div> : null}
    </header>
  )
}

/** The scrolling part of the drawer. */
export function DrawerBody({ children }: { children?: ReactNode }) {
  return <ScrollShadow className="drawer__body">{children}</ScrollShadow>
}
