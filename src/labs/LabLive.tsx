import { useParams } from 'react-router'
import './lab.css'
import CaseStub from '../components/CaseStub.tsx'
import { FallingFigure } from './falling-figure/FallingFigure.tsx'
import { LivingPortrait } from './living-portrait/LivingPortrait.tsx'
import { ShatterFooterStage } from './shatter-footer/ShatterFooter.tsx'
import { HOME_HERO } from '../data/homepage.ts'
import { useLang } from '../i18n'
import { LAB_BY_ID } from './index.ts'
import { DefaultHead } from '../components/DefaultHead.tsx'

/** The bare piece behind each lab page, without the site nav. LabPage shows it in an iframe. */
export default function LabLive() {
  const { slug } = useParams()
  const { lang } = useLang()

  // Falling Figure and the stub render their own title.
  const title = slug && slug !== 'falling-figure' ? LAB_BY_ID[slug]?.[lang].title : undefined
  return (
    <>
      {title ? <DefaultHead title={`${title} · TEKUEI`} /> : null}
      {slug === 'living-portrait' ? (
        <LivingPortrait name={HOME_HERO[lang].name} label="Living Portrait" />
      ) : slug === 'falling-figure' ? (
        <FallingFigure />
      ) : slug === 'shatter-footer' ? (
        <ShatterFooterStage />
      ) : (
        <CaseStub />
      )}
    </>
  )
}
