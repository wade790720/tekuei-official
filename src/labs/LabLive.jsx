import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './lab.css'
import CaseStub from '../components/CaseStub.jsx'
import { FallingFigure } from './falling-figure/FallingFigure.jsx'
import { LivingPortrait } from './living-portrait/LivingPortrait.jsx'
import { ShatterFooterStage } from './shatter-footer/ShatterFooter.jsx'
import { HOME_HERO } from '../data/homepage.ts'
import { useLang } from '../i18n'

/** The bare piece behind each lab page, without the site nav. LabPage shows it in an iframe. */
export default function LabLive() {
  const { slug } = useParams()
  const { lang } = useLang()

  useEffect(() => {
    document.documentElement.classList.add('lab-live-doc')
    return () => document.documentElement.classList.remove('lab-live-doc')
  }, [])

  if (slug === 'living-portrait') return <LivingPortrait name={HOME_HERO[lang].name} label="Living Portrait" />
  if (slug === 'falling-figure') return <FallingFigure />
  if (slug === 'shatter-footer') return <ShatterFooterStage />
  return <CaseStub />
}
