import { lazy, Suspense } from 'react'
import { useAdmin } from '../../context/admin.ts'
import { useJournal } from '../../context/journal.ts'
import { useLang } from '../../i18n'
import { uploadSiteImage } from '../../lib/adminApi.ts'
import { getDoc } from '../../lib/richText.ts'
import { RichText } from '../RichText.tsx'

// Tiptap is large; load it only when Wade opens a post in edit mode, not for every visitor.
const Editor = lazy(() => import('../Editor.tsx').then((m) => ({ default: m.Editor })))

/**
 * The post body. In edit mode it is the editor, in place on the page, so what Wade types is what readers see.
 * Otherwise, and while Tiptap loads, it is `children` (the RichText of the saved post).
 */
export function JournalPostBody({ slug, children }) {
  const { lang } = useLang()
  const admin = useAdmin()
  const cms = useJournal()
  const body = admin.editing && cms.isEditing ? cms.draft.content[lang]?.[slug] : null
  if (!body) return children

  // The editor saves its own document; the old block list goes away on the first edit.
  const setDoc = (doc) =>
    cms.updateDraft((d) => {
      d.content[lang][slug] = { doc }
    })
  const upload = async (file) => (await uploadSiteImage(file, admin.getToken())).url

  return (
    <Suspense fallback={children}>
      {/* The editor stays mounted while previewing, so the cursor and undo history survive. */}
      <Editor key={`${slug}-${lang}-${admin.editorKey}`} doc={getDoc(body)} onChange={setDoc} upload={upload} previewing={admin.previewing} />
      {admin.previewing ? <RichText doc={getDoc(body)} /> : null}
    </Suspense>
  )
}
