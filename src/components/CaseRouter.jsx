import { useParams } from 'react-router-dom'
import { CASE_BY_SLUG } from '../data/cases/index.js'
import CaseStudyPage from './CaseStudyPage.jsx'
import CaseStub from './CaseStub.jsx'
import ExperimentPage from './ExperimentPage.jsx'
import { EXPERIMENT_BY_ID } from '../data/experiments.js'

export default function CaseRouter() {
  const { slug } = useParams()

  if (EXPERIMENT_BY_ID[slug]) return <ExperimentPage id={slug} />

  if (!CASE_BY_SLUG[slug]) {
    return <CaseStub />
  }

  return <CaseStudyPage />
}
