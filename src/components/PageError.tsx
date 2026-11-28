import { DefaultHead } from './DefaultHead.tsx'
import { PAGE_ERROR } from '../data/nav.ts'
import { useLang } from '../i18n'

/** A page that failed to draw, or R2 that could not be read (503). */
export function PageError() {
  const { lang } = useLang()
  const t = PAGE_ERROR[lang]
  return (
    <main className="page-error" role="alert">
      <DefaultHead />
      <h1>{t.title}</h1>
      <p>{t.hint}</p>
    </main>
  )
}
