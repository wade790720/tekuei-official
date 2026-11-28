import { useAdmin } from '../context/admin.ts'
import { useWork } from '../context/work.ts'
import { localizeWork } from '../data/work.ts'
import { useLang } from '../i18n'
import type { WorkData } from '../lib/siteData.ts'

/**
 * The work section as the page shows it, in the reader's language: the page's loader data (no drafts),
 * or in edit mode the draft.
 * @param reader  the page's loader data
 */
export function useWorkContent(reader: WorkData) {
  const { lang } = useLang()
  const { editing } = useAdmin()
  const cms = useWork()
  return { ...cms, content: localizeWork(editing && cms.isEditing ? cms.content : reader, lang) }
}
