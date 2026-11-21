import { useEffect } from 'react'
import '../styles/hero.css'
import '../styles/home.css'
import { HomeHero } from './HomeHero.jsx'
import { HOME_META } from '../data/homepage.js'
import { useLang } from '../i18n'

export default function SiteHero() {
  const { lang } = useLang()
  const meta = HOME_META[lang]

  useEffect(() => {
    document.title = meta.title
    const metaEl = document.querySelector('meta[name="description"]')
    if (metaEl) metaEl.setAttribute('content', meta.description)
  }, [meta])

  return (
    <div className="hero-root home">
      <main>
        <HomeHero />
      </main>
    </div>
  )
}
