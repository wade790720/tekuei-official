import { useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { ScrollShadow } from './ScrollShadow.jsx'
import '../styles/drawer.css'

/**
 * A panel that slides in from the right edge. Put DrawerHeader and DrawerBody inside.
 * Portalled to <body>: page roots such as .journal-page set z-index and would trap it under the nav.
 * @param {{
 *   open: boolean,
 *   label: string,      // accessible name of the panel
 *   push?: boolean,     // wide screens (1100px+): the page moves left instead of being covered
 *   className?: string,
 *   children?: import('react').ReactNode,
 * }} props
 */
export function Drawer({ open, label, push = false, className = '', children }) {
  // html.has-drawer pads the body (drawer.css) and stops the fixed nav at the drawer (siteNav.css).
  useLayoutEffect(() => {
    if (!open || !push) return undefined
    const root = document.documentElement
    root.classList.add('has-drawer')
    return () => root.classList.remove('has-drawer')
  }, [open, push])

  if (!open) return null
  return createPortal(
    <aside className={className ? `drawer ${className}` : 'drawer'} aria-label={label}>
      {children}
    </aside>,
    document.body,
  )
}

/** Title, optional subtitle, and the actions (children) on the right. */
export function DrawerHeader({ title, subtitle, children }) {
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
export function DrawerBody({ children }) {
  return <ScrollShadow className="drawer__body">{children}</ScrollShadow>
}
