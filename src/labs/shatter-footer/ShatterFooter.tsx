import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router'
import { HOME_FOOTER } from '../../data/homepage.ts'
import { useLang, useLocalePath } from '../../i18n'
import { mountShatterImage } from './shatterImage.ts'
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

const stagger = (i: number) => ({ '--i': i }) as CSSProperties

interface FooterLinkProps {
  href?: string
  i: number
  children: ReactNode
}

function FooterLink({ href, i, children }: FooterLinkProps) {
  const localePath = useLocalePath()
  const props = { className: 'shatter-footer__link', style: stagger(i) }
  if (!href) return <span {...props}>{children}</span>
  return href.startsWith('/') && !/\.\w+$/.test(href) ? (
    <Link to={localePath(href)} {...props}>
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
  const localePath = useLocalePath()
  const footer = HOME_FOOTER[lang]
  const root = useRef<HTMLElement>(null)
  const sea = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!sea.current) return
    return mountShatterImage(sea.current, {
        src: seaImage,
        crop: [0, 583, 1920, 705],
        onPlay: () => root.current?.classList.add('is-in'),
      })
  }, [])

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
          <Link to={localePath('/')} className="shatter-footer__brand shatter-footer__r" style={stagger(0)}>
            T E K U E I
          </Link>
          <div className="shatter-footer__sub shatter-footer__r" style={stagger(1)}>
            德 溎
          </div>
          <div className="shatter-footer__copy shatter-footer__r" style={stagger(3)}>
            © 2026 TEKUEI
          </div>
        </div>
        {columns.map((col, c) => (
          <div className="shatter-footer__col" key={c}>
            <div className="shatter-footer__title shatter-footer__r" style={stagger(c * 2 + 2)}>
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
