import { useParams } from 'react-router'
import './lab.css'
import CaseStub from '../components/CaseStub.tsx'
import { FallingFigure } from './falling-figure/FallingFigure.tsx'
import { LivingPortrait } from './living-portrait/LivingPortrait.tsx'
import { ShatterFooterStage } from './shatter-footer/ShatterFooter.tsx'
import { HOME_HERO } from '../data/homepage.ts'
import { useLang } from '../i18n'
import { LAB_BY_ID } from './index.ts'
import { PageHead } from '../components/PageHead.tsx'

/** The bare piece behind each lab page, without the site nav. LabPage shows it in an iframe. */
export default function LabLive() {
  const { slug } = useParams()
  const { lang } = useLang()

  const lab = slug && Object.hasOwn(LAB_BY_ID, slug) ? LAB_BY_ID[slug]?.[lang] : undefined
  return (
    <>
      {lab ? <PageHead title={`${lab.title} · TEKUEI`} description={lab.summary} path={`/labs/${slug}/live`} oneUrl noindex /> : null}
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
