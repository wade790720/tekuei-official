import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { NavOverlay, NavToggle } from './NavOverlay.jsx'
import { SiteNavLinks } from './SiteNavLinks.jsx'
import '../styles/tekueiSiteNav.css'
import '../styles/tekueiNavOverlay.css'

/**
 * @param {{
 *   highlightWorkSection?: boolean
 *   highlightJournal?: boolean
 *   scrollAware?: boolean
 * }} props
 */
export function TekueiSiteNav({
  highlightWorkSection = false,
  highlightJournal = false,
  scrollAware = false,
}) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const close = () => setOpen(false)

  useEffect(() => {
    if (!scrollAware) return undefined
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [scrollAware])

  const navClass = [
    'tekuei-site-nav',
    scrollAware ? 'tekuei-site-nav--scroll-aware' : '',
    scrollAware && scrolled ? 'is-scrolled' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <nav className={navClass}>
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
