import { useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HOME_FOOTER } from '../data/homepage.js'
import { useLang } from '../i18n'
import '../styles/siteFooter.css'

const ICONS = {
  X: (
    <path
      d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.18h1.7L7.4 4.73H5.58l11.09 14.45Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  GitHub: (
    <>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </>
  ),
  Email: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  LinkedIn: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  Instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.25" cy="6.75" r="0.75" fill="currentColor" stroke="none" />
    </>
  ),
  YouTube: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="4" />
      <path d="M10 9.25v5.5L14.75 12 10 9.25z" fill="currentColor" stroke="none" />
    </>
  ),
  Facebook: <path d="M14.5 21v-7.5h2.5l.5-3h-3V8.75c0-.9.3-1.5 1.6-1.5h1.5V4.6A20 20 0 0 0 15.4 4.5c-2.3 0-3.9 1.4-3.9 4v2h-2.5v3h2.5V21" />,
}

/**
 * One-row footer: the brand, the site links and the social icons. An underline sits under the current
 * page and glides to the link under the pointer or the keyboard focus.
 */
export function SiteFooter() {
  const { lang } = useLang()
  const { pathname } = useLocation()
  const { explore, contact } = HOME_FOOTER[lang]
  const email = contact.find((c) => c.href?.startsWith('mailto:'))
  const links = [...explore, ...(email ? [{ label: 'Contact', href: email.href }] : [])]
  // The same accounts as the Journal footer. One with no address yet shows as a plain icon.
  const socials = contact
    .map((c) => (c.href?.startsWith('mailto:') ? { ...c, label: 'Email' } : c))
    .filter((c) => ICONS[c.label])
  const current = links.findIndex((l) => pathname === l.href || pathname.startsWith(`${l.href}/`))

  const [hot, setHot] = useState(-1)
  const nav = useRef(null)
  const target = hot >= 0 ? hot : current

  useLayoutEffect(() => {
    const el = nav.current
    const place = () => {
      const a = el.querySelectorAll('li > a')[target]
      el.dataset.underline = a ? 'on' : 'off'
      if (!a) return
      el.style.setProperty('--underline-x', `${a.offsetLeft}px`)
      el.style.setProperty('--underline-w', `${a.offsetWidth}px`)
    }
    place()
    // The first position is set without a glide; from then on it moves.
    const raf = requestAnimationFrame(() => (el.dataset.ready = ''))
    const resize = new ResizeObserver(place)
    resize.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      resize.disconnect()
    }
  }, [target, lang])

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__logo">TEKUEI</Link>
          <span className="site-footer__copy">© {new Date().getFullYear()}</span>
        </div>
        <nav ref={nav} aria-label="Footer" className="site-footer__nav">
          <ul className="site-footer__links" onPointerLeave={() => setHot(-1)}>
            {links.map((l, i) => {
              const props = {
                className: i === current ? 'is-active' : undefined,
                'aria-current': i === current ? 'page' : undefined,
                onPointerEnter: () => setHot(i),
                onFocus: () => setHot(i),
                onBlur: () => setHot(-1),
              }
              return (
                <li key={l.href}>
                  {l.href.startsWith('/') ? (
                    <Link to={l.href} {...props}>{l.label}</Link>
                  ) : (
                    <a href={l.href} {...props}>{l.label}</a>
                  )}
                </li>
              )
            })}
          </ul>
          <span className="site-footer__underline" aria-hidden />
        </nav>
        <ul className="site-footer__social" style={{ '--social-top': Math.ceil(socials.length / 2) }}>
          {socials.map((s, i) => {
            const icon = (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {ICONS[s.label]}
              </svg>
            )
            return (
              <li key={s.label} data-row-start={i === Math.ceil(socials.length / 2) || undefined}>
                {s.href ? (
                  <a
                    href={s.href}
                    {...(s.href.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noreferrer' })}
                    aria-label={s.label}
                    className="site-footer__icon"
                  >
                    {icon}
                  </a>
                ) : (
                  <span role="img" aria-label={s.label} className="site-footer__icon">
                    {icon}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </footer>
  )
}
