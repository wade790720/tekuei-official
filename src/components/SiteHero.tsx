import '../styles/hero.css'
import '../styles/home.css'
import { HomeHero } from './HomeHero.tsx'
import { HOME_META } from '../data/homepage.ts'
import { useLang } from '../i18n'

export default function SiteHero() {
  const { lang } = useLang()
  const meta = HOME_META[lang]

  return (
    <div className="hero-root home">
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <main>
        <HomeHero />
      </main>
    </div>
  )
}
