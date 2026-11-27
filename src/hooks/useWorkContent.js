import { useAdmin } from '../context/admin.js'
import { useWork } from '../context/work.js'
import { localizeWork, publishedWork } from '../data/work.ts'
import { useLang } from '../i18n'

/** The work section as the page shows it: in the reader's language, and without drafts unless Wade is editing. */
export function useWorkContent() {
  const { lang } = useLang()
  const { editing } = useAdmin()
  const cms = useWork()
  return { ...cms, content: localizeWork(editing ? cms.content : publishedWork(cms.content), lang) }
}
