import { useLayoutEffect, useRef, useState } from 'react'
import { SOCIAL_ICONS } from './socialIcons.tsx'
import { Link, useLocation } from 'react-router'
import { HOME_FOOTER } from '../data/homepage.ts'
import { useLang, useLocalePath } from '../i18n'
import { stripLang } from '../lib/localePath.ts'
import '../styles/siteFooter.css'

type SocialName = keyof typeof SOCIAL_ICONS
const isSocial = (label: string): label is SocialName => Object.hasOwn(SOCIAL_ICONS, label)

/**
 * One-row footer: the brand, the site links and the social icons. An underline sits under the current
 * page and glides to the link under the pointer or the keyboard focus.
 */
export function SiteFooter() {
  const { lang } = useLang()
  const localePath = useLocalePath()
  const pathname = stripLang(useLocation().pathname)
  const { explore, contact } = HOME_FOOTER[lang]
  const email = contact.find((c) => c.href?.startsWith('mailto:'))?.href
  const links = [...explore, ...(email ? [{ label: 'Contact', href: email }] : [])]
  // The same accounts as the Journal footer. One with no address yet shows as a plain icon.
  const socials = contact.flatMap((c) => {
    const label = c.href?.startsWith('mailto:') ? 'Email' : c.label
    return isSocial(label) ? [{ label, href: c.href }] : []
  })
  const current = links.findIndex((l) => pathname === l.href || pathname.startsWith(`${l.href}/`))

  const [hot, setHot] = useState(-1)
  const nav = useRef<HTMLElement>(null)
  const target = hot >= 0 ? hot : current

  useLayoutEffect(() => {
    const el = nav.current
    if (!el) return
    const place = () => {
      const a = el.querySelectorAll<HTMLAnchorElement>('li > a')[target]
      el.dataset.underline = a ? 'on' : 'off'
      if (!a) return
      el.style.setProperty('--underline-x', `${a.offsetLeft}px`)
      el.style.setProperty('--underline-w', `${a.offsetWidth}px`)
    }
    place()
    // The first position is set without a glide; from then on it moves.
    const raf = requestAnimationFrame(() => {
      el.dataset.ready = ''
    })
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
          <Link to={localePath('/')} className="site-footer__logo">TEKUEI</Link>
          <span className="site-footer__copy">© {new Date().getFullYear()}</span>
        </div>
        <nav ref={nav} aria-label="Footer" className="site-footer__nav">
          <ul className="site-footer__links" onPointerLeave={() => setHot(-1)}>
            {links.map((l, i) => {
              const props = {
                className: i === current ? 'is-active' : undefined,
                'aria-current': i === current ? ('page' as const) : undefined,
                onPointerEnter: () => setHot(i),
                onFocus: () => setHot(i),
                onBlur: () => setHot(-1),
              }
              return (
                <li key={l.href}>
                  {l.href.startsWith('/') ? (
                    <Link to={localePath(l.href)} {...props}>{l.label}</Link>
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
                {SOCIAL_ICONS[s.label]}
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
