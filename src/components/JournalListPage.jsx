import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { HomeFadeIn } from './HomeFadeIn.jsx'
import { JOURNAL_HEADER, JOURNAL_META, JOURNAL_POSTS } from '../data/journal.js'
import { HOME_FOOTER } from '../data/homepage.js'
import { useLang } from '../i18n'
import { mountGlyphField } from '../lib/glyphField.js'
import { mountShatterImage } from '../lib/shatterImage.js'
import seaImage from '../assets/journal/footer-sea.webp'
import '../styles/work.css'
import '../styles/journal.css'

export default function JournalListPage() {
  const { lang } = useLang()
  const meta = JOURNAL_META[lang]
  const header = JOURNAL_HEADER[lang]
  const posts = JOURNAL_POSTS[lang]
  const glyphs = useRef(null)

  useEffect(() => mountGlyphField(glyphs.current), [])

  useEffect(() => {
    document.title = meta.title
    const metaEl = document.querySelector('meta[name="description"]')
    if (metaEl) metaEl.setAttribute('content', meta.description)
  }, [meta])

  return (
    <div className="journal-page">
      <header className="journal-header">
        <canvas className="journal-header__glyphs" ref={glyphs} aria-hidden />
        <div className="journal-header__inner">
          <HomeFadeIn>
            <div className="journal-header__pre">{header.pre}</div>
            <h1 className="journal-header__title">Journal</h1>
            <p className="journal-header__desc">
              {header.desc.map((line, i) => (
                <span key={line}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </p>
          </HomeFadeIn>
          <div className="journal-header__count" aria-hidden>
            {String(posts.length).padStart(2, '0')} Entries
          </div>
        </div>
        <div className="journal-header__slash" aria-hidden />
      </header>

      <div className="journal-list" role="list">
        {posts.map((post, index) => (
          <HomeFadeIn key={post.slug} as={Link} to={`/journal/${post.slug}`} className="journal-card" role="listitem">
            <div className="journal-card__index">
              <span className="journal-card__num">{post.num}</span>
              <span className="journal-card__line" aria-hidden />
            </div>
            <div className="journal-card__body">
              <div className="journal-card__meta">
                <span className="journal-card__category">{post.category}</span>
                <span className="journal-card__dot" aria-hidden>·</span>
                <time dateTime={post.date.replace(/\./g, '-')}>{post.date}</time>
                <span className="journal-card__dot" aria-hidden>·</span>
                <span>{post.readMin} min</span>
              </div>
              <h2 className="journal-card__title">{post.title}</h2>
              <div className="journal-card__title-en">{post.titleEn}</div>
              <p className="journal-card__excerpt">{post.excerpt}</p>
            </div>
            <div className="journal-card__arrow" aria-hidden>
              <span className="journal-card__arrow-line" />
              <span>READ</span>
            </div>
            {index < posts.length - 1 ? (
              <div className="journal-card__rule" aria-hidden />
            ) : null}
          </HomeFadeIn>
        ))}
      </div>

      <JournalFooter />
    </div>
  )
}

// Home-page anchors (#work) need the home path when used from /journal.
const toHome = (href) => (href.startsWith('#') ? `/${href}` : href)

function FooterLink({ href, i, children }) {
  const target = toHome(href)
  const props = { className: 'journal-footer__link', style: { '--i': i } }
  return target.startsWith('/') ? (
    <Link to={target} {...props}>
      {children}
    </Link>
  ) : (
    <a href={target} {...props}>
      {children}
    </a>
  )
}

function JournalFooter() {
  const { lang } = useLang()
  const footer = HOME_FOOTER[lang]
  const root = useRef(null)
  const sea = useRef(null)

  useEffect(
    () =>
      mountShatterImage(sea.current, {
        src: seaImage,
        crop: [0, 389, 1280, 470],
        onPlay: () => root.current?.classList.add('is-in'),
      }),
    [],
  )

  const columns = [
    { title: 'Explore', links: footer.explore },
    { title: 'Services', links: footer.services.map((s) => ({ label: s, href: '#contact' })) },
    { title: 'Contact', links: footer.contact },
  ]

  return (
    <footer className="journal-footer" ref={root}>
      <div className="journal-footer__rules" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="journal-footer__cols">
        <div className="journal-footer__col">
          <Link to="/" className="journal-footer__brand journal-footer__r" style={{ '--i': 0 }}>
            T E K U E I
          </Link>
          <div className="journal-footer__sub journal-footer__r" style={{ '--i': 1 }}>
            德 溎
          </div>
          <p className="journal-footer__tagline journal-footer__r" style={{ '--i': 2 }}>
            {footer.tagline.map((line, i) => (
              <span key={line}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </p>
          <div className="journal-footer__copy journal-footer__r" style={{ '--i': 3 }}>
            © 2026 TEKUEI
          </div>
        </div>
        {columns.map((col, c) => (
          <div className="journal-footer__col" key={col.title}>
            <div className="journal-footer__title journal-footer__r" style={{ '--i': c * 2 + 2 }}>
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
      <canvas className="journal-footer__sea" ref={sea} aria-hidden />
    </footer>
  )
}
