import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { useAdmin } from '../context/admin.ts'
import { CASE_BY_SLUG } from '../data/cases/index.ts'
import CaseStudyPage from './CaseStudyPage.jsx'
import ProjectPage from './ProjectPage.jsx'

const ProjectEditPanel = lazy(() => import('./work/WorkEditPanel.jsx').then((m) => ({ default: m.ProjectEditPanel })))

/** /projects/:slug. The first three cases have pages written in code; every other project's page is written in the editor. */
export default function CaseRouter() {
  const { slug } = useParams()
  const { editing } = useAdmin()

  if (!CASE_BY_SLUG[slug]) return <ProjectPage />

  return (
    <>
      <CaseStudyPage />
      {/* The page is code, but its card on the Projects list is edited here */}
      {editing ? (
        <Suspense fallback={null}>
          <ProjectEditPanel id={slug} coded />
        </Suspense>
      ) : null}
    </>
  )
}
