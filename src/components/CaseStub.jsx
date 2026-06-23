import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { WORK_ITEMS } from '../data/work.js'
import '../styles/work.css'

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
    <div className="work-page">
      <main className="case-stub">
        <h1>{item ? `${title}` : `Case · ${slug}`}</h1>
        <p>案例詳情頁面尚未接上；將由獨立專題頁承接此路由。</p>
        <Link className="case-stub__back" to="/work">
          ← 返回 Work
        </Link>
      </main>
    </div>
  )
}
