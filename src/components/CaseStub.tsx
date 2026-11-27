import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { WORK_ITEMS } from '../data/work.ts'
import '../styles/work.css'

export default function CaseStub() {
  const { slug } = useParams()

  const item = useMemo(
    () => WORK_ITEMS.find((w) => w.caseHref === `/projects/${slug}`),
    [slug],
  )

  const title = item
    ? item.titleEmWord
      ? `${item.titleEmWord} ${item.title}`
      : item.title
    : (slug ?? '').replace(/-/g, ' ')

  return (
    <div className="work-page">
      <title>{item ? `TEKUEI · ${title}` : 'TEKUEI · Case'}</title>
      <main className="case-stub">
        <h1>{item ? `${title}` : `Case · ${slug}`}</h1>
        <p>案例詳情頁面尚未接上，之後由獨立專題頁承接此路由。</p>
        <Link className="case-stub__back" to="/projects">
          ← 返回 Projects
        </Link>
      </main>
    </div>
  )
}
