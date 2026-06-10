import { useParams } from 'react-router-dom'
import { CASE_BY_SLUG } from '../data/cases/index.js'
import CaseStudyPage from './CaseStudyPage.jsx'
import CaseStub from './CaseStub.jsx'

export default function CaseRouter() {
  const { slug } = useParams()
  const data = CASE_BY_SLUG[slug]

  if (data) {
    return <CaseStudyPage data={data} />
  }

  return <CaseStub />
}
