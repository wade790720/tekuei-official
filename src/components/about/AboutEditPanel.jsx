import { SidePanel } from '../SidePanel.jsx'
import { TranslateSection } from '../admin/TranslateSection.jsx'
import { useCmsEditing } from '../../hooks/useCmsEditing.js'
import { getDoc } from '../../lib/richText.js'

/** The About page has no fields: everything is the body, edited on the page, so it gets the toolbar instead of the drawer. */
export function AboutEditPanel({ cms }) {
  const { admin, ready, panelProps } = useCmsEditing(cms)
  if (!ready) return null
  return (
    <SidePanel variant="bar" title="編輯 About" preview {...panelProps}>
      <TranslateSection
        compact
        zhDoc={getDoc(cms.draft.zh)}
        enDoc={getDoc(cms.draft.en)}
        onDone={({ doc }) => {
          cms.updateDraft((d) => {
            d.en = { doc }
          })
          admin.reloadEditor()
        }}
      />
    </SidePanel>
  )
}
