import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { WORK_ITEMS } from '../data/work.ts'
import { useLocalePath } from '../i18n'
import '../styles/work.css'
import { DefaultHead } from './DefaultHead.tsx'

export default function CaseStub() {
  const { slug } = useParams()
  const localePath = useLocalePath()

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
      <DefaultHead title={item ? `TEKUEI · ${title}` : 'TEKUEI · Case'} />
      <main className="case-stub">
        <h1>{item ? `${title}` : `Case · ${slug}`}</h1>
        <p>案例詳情頁面尚未接上，之後由獨立專題頁承接此路由。</p>
        <Link className="case-stub__back" to={localePath('/projects')}>
          ← 返回 Projects
        </Link>
      </main>
    </div>
  )
}
