// In-editor views for the custom journal nodes (see extensions.js).
// Text inside quotes and code is edited in place; card settings use small fields on the card.
import { useState } from 'react'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { CmsSwitch } from '../../admin/CmsPanel.jsx'

const MAX_IMAGE_BYTES = 1024 * 1024 // functions/api/upload.js rejects larger files
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function Field({ label, value, onChange, placeholder }) {
  return (
    <input
      className="cms-ed-field"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label}
    />
  )
}

export function QuoteView({ node, updateAttributes }) {
  return (
    <NodeViewWrapper as="blockquote" className="cms-ed-quote">
      <NodeViewContent className="cms-ed-quote__text" />
      <div contentEditable={false} className="cms-ed-quote__cite">
        <Field
          label="引言出處"
          value={node.attrs.cite}
          onChange={(cite) => updateAttributes({ cite })}
          placeholder="— 出處（選填）"
        />
      </div>
    </NodeViewWrapper>
  )
}

export function CodeBlockView({ node, updateAttributes }) {
  return (
    <NodeViewWrapper className="cms-ed-code">
      <div contentEditable={false} className="cms-ed-code__bar">
        <Field label="程式語言" value={node.attrs.language} onChange={(language) => updateAttributes({ language })} placeholder="ts" />
        <Field label="檔名" value={node.attrs.filename} onChange={(filename) => updateAttributes({ filename })} placeholder="檔名（選填）" />
      </div>
      <pre spellCheck={false}>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}

function CardShell({ title, selected, deleteNode, children }) {
  return (
    <NodeViewWrapper className="cms-ed-card" data-selected={selected || undefined}>
      <div contentEditable={false}>
        <div className="cms-ed-card__head" data-drag-handle>
          <span className="cms-ed-card__title">{title}</span>
          <button type="button" className="cms-icon cms-icon--danger" onClick={deleteNode} aria-label={`刪除${title}`}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </NodeViewWrapper>
  )
}

export function ImageCardView({ node, updateAttributes, deleteNode, selected, extension }) {
  const a = node.attrs
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function upload(file) {
    setErr('')
    if (!file) return
    if (!IMAGE_TYPES.includes(file.type)) return setErr('只支援 JPG、PNG、WEBP')
    if (file.size > MAX_IMAGE_BYTES) return setErr('檔案超過 1MB')
    setBusy(true)
    try {
      updateAttributes({ src: await extension.options.upload(file) })
    } catch (e) {
      setErr(e.message || '上傳失敗')
    } finally {
      setBusy(false)
    }
  }

  return (
    <CardShell title="圖片" selected={selected} deleteNode={deleteNode}>
      {a.src ? <img className="cms-ed-card__preview" src={a.src} alt="" /> : null}
      <div className="cms-ed-card__row">
        <Field label="圖片網址" value={a.src} onChange={(src) => updateAttributes({ src })} placeholder="圖片網址，或按右邊上傳" />
        <label className="cms-btn cms-btn--ghost cms-upload">
          {busy ? '上傳中' : '上傳'}
          <input type="file" accept={IMAGE_TYPES.join(',')} hidden onChange={(e) => upload(e.target.files?.[0])} />
        </label>
      </div>
      {err ? <div className="cms-row__error">{err}</div> : null}
      <Field label="替代文字" value={a.alt} onChange={(alt) => updateAttributes({ alt })} placeholder="替代文字（必填，說明圖片內容）" />
      <Field label="圖說" value={a.caption} onChange={(caption) => updateAttributes({ caption })} placeholder="圖說（選填）" />
      <label className="cms-check">
        <CmsSwitch checked={a.frame} onChange={(frame) => updateAttributes({ frame })} label="小圖置中" />
        小圖置中（手機截圖用）
      </label>
    </CardShell>
  )
}

export function VideoCardView({ node, updateAttributes, deleteNode, selected }) {
  const a = node.attrs
  return (
    <CardShell title="影片" selected={selected} deleteNode={deleteNode}>
      <Field label="影片網址" value={a.src} onChange={(src) => updateAttributes({ src })} placeholder="影片網址（mp4）" />
      <Field label="封面圖網址" value={a.poster} onChange={(poster) => updateAttributes({ poster })} placeholder="封面圖網址（選填）" />
      <Field label="影片說明" value={a.caption} onChange={(caption) => updateAttributes({ caption })} placeholder="說明（選填）" />
      <label className="cms-check">
        <CmsSwitch checked={a.loop} onChange={(loop) => updateAttributes({ loop })} label="重複播放" />
        重複播放
      </label>
    </CardShell>
  )
}
