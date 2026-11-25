import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { HOME_FOOTER } from '../../data/homepage.js'
import { useLang } from '../../i18n'
import { mountShatterImage } from './shatterImage.js'
import seaImage from './sea.webp'
import './shatterFooter.css'

/** The live piece: one screen with the footer at its bottom. */
export function ShatterFooterStage() {
  return (
    <div className="shatter-footer-stage">
      <ShatterFooter />
    </div>
  )
}

function FooterLink({ href, i, children }) {
  const props = { className: 'shatter-footer__link', style: { '--i': i } }
  // An entry without an address is listed as plain text.
  if (!href) return <span {...props}>{children}</span>
  // Site routes go through the router; files such as /sitemap.xml need a real page load.
  return href.startsWith('/') && !/\.\w+$/.test(href) ? (
    <Link to={href} {...props}>
      {children}
    </Link>
  ) : (
    <a href={href} {...props}>
      {children}
    </a>
  )
}

function ShatterFooter() {
  const { lang } = useLang()
  const footer = HOME_FOOTER[lang]
  const root = useRef(null)
  const sea = useRef(null)

  useEffect(
    () =>
      mountShatterImage(sea.current, {
        src: seaImage,
        crop: [0, 583, 1920, 705], // the bottom strip of the 1920 × 1288 image, in the canvas's 1280:470 ratio
        onPlay: () => root.current?.classList.add('is-in'),
      }),
    [],
  )

  const columns = [
    { title: footer.titles.explore, links: footer.explore },
    { title: footer.titles.resources, links: footer.resources },
    { title: footer.titles.contact, links: footer.contact },
  ]

  return (
    <footer className="shatter-footer" ref={root}>
      <div className="shatter-footer__rules" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="shatter-footer__cols">
        <div className="shatter-footer__col">
          <Link to="/" className="shatter-footer__brand shatter-footer__r" style={{ '--i': 0 }}>
            T E K U E I
          </Link>
          <div className="shatter-footer__sub shatter-footer__r" style={{ '--i': 1 }}>
            德 溎
          </div>
          <div className="shatter-footer__copy shatter-footer__r" style={{ '--i': 3 }}>
            © 2026 TEKUEI
          </div>
        </div>
        {columns.map((col, c) => (
          <div className="shatter-footer__col" key={c}>
            <div className="shatter-footer__title shatter-footer__r" style={{ '--i': c * 2 + 2 }}>
              {col.title}
            </div>
            {col.links.map((link, k) => (
              <FooterLink key={link.label} href={link.href} i={c * 2 + 3 + k}>
                {link.label}
              </FooterLink>
            ))}
          </div>
        ))}
      </div>
      <div className="shatter-footer__sea-box">
        <canvas className="shatter-footer__sea" ref={sea} aria-hidden />
      </div>
    </footer>
  )
}
