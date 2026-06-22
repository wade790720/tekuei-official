import { AdminField } from './AdminField.jsx'

const RICH_HINT = '使用 *文字* 標記點睛字，例如：TEKUEI 是一套*人格品牌系統*'

export function AdminRichField({ label, value, onChange, multiline = true, hint = RICH_HINT }) {
  return (
    <AdminField
      label={label}
      value={value}
      onChange={onChange}
      multiline={multiline}
      hint={hint}
    />
  )
}
