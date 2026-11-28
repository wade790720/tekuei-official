import { lazy, Suspense } from 'react'
import { useParams } from 'react-router'
import { useAdmin } from '../context/admin.ts'
import { CASE_BY_SLUG } from '../data/cases/index.ts'
import CaseStudyPage from './CaseStudyPage.tsx'
import ProjectPage from './ProjectPage.tsx'
import type { ProjectPageData } from '../lib/pageData.ts'

const ProjectEditPanel = lazy(() => import('./work/WorkEditPanel.tsx').then((m) => ({ default: m.ProjectEditPanel })))

/** /projects/:slug. The first three cases have pages written in code; every other project's page is written in the editor. */
export default function CaseRouter({ page }: { page: ProjectPageData }) {
  const { slug = '' } = useParams<{ slug: string }>()
  const { editing } = useAdmin()

  if (!Object.hasOwn(CASE_BY_SLUG, slug)) return <ProjectPage work={page.work} />

  return (
    <>
      <CaseStudyPage work={page.work} assets={page.assets} />
      {editing ? (
        <Suspense fallback={null}>
          <ProjectEditPanel id={slug} coded />
        </Suspense>
      ) : null}
    </>
  )
}
