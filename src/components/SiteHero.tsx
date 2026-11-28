import '../styles/hero.css'
import '../styles/home.css'
import { HomeHero } from './HomeHero.tsx'
import { PageHead } from './PageHead.tsx'
import { HOME_META } from '../data/homepage.ts'
import { useLang } from '../i18n'

export default function SiteHero() {
  const { lang } = useLang()
  const meta = HOME_META[lang]

  return (
    <div className="hero-root home">
      <PageHead title={meta.title} description={meta.description} path="/" />
      <main>
        <HomeHero />
      </main>
    </div>
  )
}
