import { NavLink } from 'react-router-dom'

/**
 * @param {{ highlightWorkSection?: boolean }} props — 落在案例占位頁時仍讓 Work 看起來為 active。
 */
export function TekueiSiteNav({ highlightWorkSection = false }) {
  return (
    <nav className="tekuei-site-nav">
      <NavLink end to="/" className="tekuei-site-nav__logo">
        T E K U E I
      </NavLink>
      <div className="tekuei-site-nav__links">
        <a href="#about">About</a>
        <NavLink
          to="/work"
          className={({ isActive }) =>
            isActive || highlightWorkSection ? 'is-active' : ''
          }
        >
          Work
        </NavLink>
        <a href="#journal">Journal</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
  )
}
