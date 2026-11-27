import { SidePanel } from '../SidePanel.tsx'
import { TranslateSection } from '../admin/TranslateSection.tsx'
import { useCmsEditing } from '../../hooks/useCmsEditing.ts'
import { getDoc } from '../../lib/richText.ts'
import type { CmsSection } from '../../hooks/useCmsSection.ts'
import type { AboutPageData } from '../../lib/siteData.ts'

/** The About page has no fields: everything is the body, edited on the page, so it gets the toolbar instead of the drawer. */
export function AboutEditPanel({ cms }: { cms: CmsSection<AboutPageData> }) {
  const { admin, ready, panelProps } = useCmsEditing(cms)
  if (!ready || !cms.draft) return null
  return (
    <SidePanel
      variant="bar"
      title="編輯 About"
      preview
      {...panelProps}
      actions={
        <TranslateSection
          zhDoc={getDoc(cms.draft.zh)}
          enDoc={getDoc(cms.draft.en)}
          onDone={({ doc }) => {
            cms.updateDraft((d) => {
              d.en = { doc }
            })
            admin.reloadEditor()
          }}
        />
      }
    />
  )
}
