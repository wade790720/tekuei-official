import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CustomCursor } from './CustomCursor.jsx'
import { TekueiSiteNav } from './TekueiSiteNav.jsx'
import { WORK_ITEMS } from '../data/works.js'
import '../styles/tekueiWork.css'

export default function CaseStub() {
  const { slug } = useParams()

  const item = useMemo(
    () => WORK_ITEMS.find((w) => w.caseHref === `/cases/${slug}`),
    [slug],
  )

  const title = item
    ? item.titleEmWord
      ? `${item.titleEmWord} ${item.title}`
      : item.title
    : (slug ?? '').replace(/-/g, ' ')

  useEffect(() => {
    document.title = item ? `TEKUEI · ${title}` : 'TEKUEI · Case'
  }, [item, title])

  return (
    <div className="tekuei-work-page">
      <CustomCursor interactiveSelector="a" />

      <TekueiSiteNav highlightWorkSection />

      <main className="tekuei-case-stub">
        <h1>{item ? `${title}` : `Case · ${slug}`}</h1>
        <p>案例詳情頁面尚未接上；將由獨立專題頁承接此路由。</p>
        <Link className="tekuei-case-stub__back" to="/work">
          ← 返回 Work
        </Link>
      </main>
    </div>
  )
}
