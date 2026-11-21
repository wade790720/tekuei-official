import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import '../styles/experiment.css'
import AboutPage from './AboutPage.jsx'
import CaseStub from './CaseStub.jsx'
import { LivingPortrait } from './LivingPortrait.jsx'
import { HOME_HERO } from '../data/homepage.js'
import { useLang } from '../i18n'

/** The bare piece behind each experiment page, without the site nav. ExperimentPage shows it in an iframe. */
export default function ExperimentLive() {
  const { slug } = useParams()
  const { lang } = useLang()

  useEffect(() => {
    document.documentElement.classList.add('experiment-live-doc')
    return () => document.documentElement.classList.remove('experiment-live-doc')
  }, [])

  if (slug === 'living-portrait') return <LivingPortrait name={HOME_HERO[lang].name} label="Living Portrait" />
  // shortcut: reuses the About page as is; give the fall its own component when About is redesigned.
  if (slug === 'falling-figure') return <AboutPage />
  return <CaseStub />
}
