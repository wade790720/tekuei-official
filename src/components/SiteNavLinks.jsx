import { NavLink } from 'react-router-dom'

/**
 * @param {{
 *   onNavigate?: () => void
 *   variant?: 'desktop' | 'overlay'
 *   highlightWorkSection?: boolean
 *   highlightJournal?: boolean
 * }} props
 */
export function SiteNavLinks({
  onNavigate,
  variant = 'desktop',
  highlightWorkSection = false,
  highlightJournal = false,
}) {
  const overlay = variant === 'overlay'

  const linkClass = (active) =>
    [overlay ? 'tekuei-nav-overlay__link' : '', active ? 'is-active' : '']
      .filter(Boolean)
      .join(' ')

  return (
    <>
      <NavLink
        to="/about"
        className={({ isActive }) => linkClass(isActive)}
        onClick={onNavigate}
      >
        About
      </NavLink>
      <NavLink
        to="/work"
        className={({ isActive }) =>
          linkClass(isActive || highlightWorkSection)
        }
        onClick={onNavigate}
      >
        Work
      </NavLink>
      <NavLink
        to="/journal"
        className={({ isActive }) =>
          linkClass(isActive || highlightJournal)
        }
        onClick={onNavigate}
      >
        Journal
      </NavLink>
      <a
        href="/#contact"
        className={overlay ? 'tekuei-nav-overlay__link' : undefined}
        onClick={onNavigate}
      >
        Contact
      </a>
    </>
  )
}
