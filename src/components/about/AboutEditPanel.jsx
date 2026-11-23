import { SidePanel } from '../SidePanel.jsx'
import { TranslateSection } from '../admin/TranslateSection.jsx'
import { useCmsEditing } from '../../hooks/useCmsEditing.js'
import { useLang } from '../../i18n'
import { getDoc } from '../../lib/richText.js'

/** The About page has no fields: everything is the body, edited on the page. The panel holds save, preview and logout. */
export function AboutEditPanel({ cms }) {
  const { lang } = useLang()
  const { admin, ready, panelProps } = useCmsEditing(cms)
  if (!ready) return null
  return (
    <SidePanel title="編輯 About" subtitle={`/about · ${lang === 'zh' ? '中文' : 'English'}`} preview {...panelProps}>
      <p className="cms-row__hint">內文直接在頁面上編輯。照片、輪播、影片用每一行左邊的「+」插入，拖曳「⠿」調整順序。</p>
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
    </SidePanel>
  )
}
