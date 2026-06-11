import { NavLink } from 'react-router-dom'

/**
 * @param {{ highlightWorkSection?: boolean, highlightJournal?: boolean }} props
 */
export function TekueiSiteNav({ highlightWorkSection = false, highlightJournal = false }) {
  return (
    <nav className="tekuei-site-nav">
      <NavLink end to="/" className="tekuei-site-nav__logo">
        T E K U E I
      </NavLink>
      <div className="tekuei-site-nav__links">
        <NavLink to="/about" className={({ isActive }) => (isActive ? 'is-active' : '')}>
          About
        </NavLink>
        <NavLink
          to="/work"
          className={({ isActive }) =>
            isActive || highlightWorkSection ? 'is-active' : ''
          }
        >
          Work
        </NavLink>
        <NavLink
          to="/journal"
          className={({ isActive }) =>
            isActive || highlightJournal ? 'is-active' : ''
          }
        >
          Journal
        </NavLink>
        <a href="/#contact">Contact</a>
      </div>
    </nav>
  )
}
