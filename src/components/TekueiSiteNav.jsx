import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { NavOverlay, NavToggle } from './NavOverlay.jsx'
import { SiteNavLinks } from './SiteNavLinks.jsx'
import '../styles/tekueiNavOverlay.css'

/**
 * @param {{ highlightWorkSection?: boolean, highlightJournal?: boolean }} props
 */
export function TekueiSiteNav({ highlightWorkSection = false, highlightJournal = false }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <nav className="tekuei-site-nav">
      <NavLink end to="/" className="tekuei-site-nav__logo" onClick={close}>
        T E K U E I
      </NavLink>
      <div className="tekuei-site-nav__links tekuei-site-nav__links--desktop">
        <SiteNavLinks
          highlightWorkSection={highlightWorkSection}
          highlightJournal={highlightJournal}
        />
      </div>
      {!open && <NavToggle onToggle={() => setOpen(true)} />}
      <NavOverlay open={open} onClose={close} id="tekuei-site-nav-overlay">
        <SiteNavLinks
          variant="overlay"
          onNavigate={close}
          highlightWorkSection={highlightWorkSection}
          highlightJournal={highlightJournal}
        />
      </NavOverlay>
    </nav>
  )
}
