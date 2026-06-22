import { useState } from 'react'
import { WORK_IMAGE_SLOTS } from '../../data/workImageSlots.js'
import { uploadSiteImage } from '../../lib/adminApi.js'
import { AdminImageField } from '../admin/AdminImageField.jsx'

function Section({ title, children }) {
  return (
    <section className="admin-section">
      <div className="admin-section__heading">{title}</div>
      <div className="admin-section__body">{children}</div>
    </section>
  )
}

export function WorkEditPanel({ draft, updateDraft, getToken }) {
  const [uploadingId, setUploadingId] = useState(null)

  if (!draft) return null

  async function handleThumbUpload(itemId, file) {
    const token = getToken()
    if (!token) throw new Error('請先登入')
    setUploadingId(itemId)
    try {
      const { url } = await uploadSiteImage(`work-thumb-${itemId}`, file, token)
      updateDraft((c) => {
        const item = c.items.find((w) => w.id === itemId)
        if (!item) return
        if (!item.thumbImage) item.thumbImage = { url: '' }
        item.thumbImage.url = `${url}?t=${Date.now()}`
      })
    } finally {
      setUploadingId(null)
    }
  }

  return (
    <aside className="admin-edit-panel" aria-label="Work 編輯面板">
      {draft.items.map((item) => (
        <Section key={item.id} title={`${item.num} · ${item.client}`}>
          <AdminImageField
            slotConfig={WORK_IMAGE_SLOTS.thumb(item)}
            currentUrl={item.thumbImage?.url || ''}
            onUpload={(file) => handleThumbUpload(item.id, file)}
            uploading={uploadingId === item.id}
          />
        </Section>
      ))}
    </aside>
  )
}
