import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { NavOverlay, NavToggle } from './NavOverlay.jsx'
import { SiteNavLinks } from './SiteNavLinks.jsx'
import '../styles/siteNav.css'
import '../styles/navOverlay.css'

/**
 * @param {{
 *   highlightWorkSection?: boolean
 *   highlightJournal?: boolean
 *   variant?: 'default' | 'case'
 * }} props
 */
export function SiteNav({
  highlightWorkSection = false,
  highlightJournal = false,
  variant = 'default',
}) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const close = () => setOpen(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setScrolled(window.scrollY > 80)
  }, [pathname])

  const navClass = [
    'site-nav',
    variant === 'case' ? 'site-nav--case' : 'site-nav--scroll-aware',
    scrolled ? 'is-scrolled' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <nav className={navClass}>
      <NavLink end to="/" className="site-nav__logo" onClick={close}>
        T E K U E I
      </NavLink>
      <div className="site-nav__links site-nav__links--desktop">
        <SiteNavLinks
          highlightWorkSection={highlightWorkSection}
          highlightJournal={highlightJournal}
        />
      </div>
      {!open && <NavToggle onToggle={() => setOpen(true)} />}
      <NavOverlay open={open} onClose={close} id="site-nav-overlay">
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
