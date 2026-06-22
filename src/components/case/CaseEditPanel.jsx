import { useState } from 'react'
import { CASE_IMAGE_SLOTS } from '../../data/workImageSlots.js'
import { uploadSiteImage } from '../../lib/adminApi.js'
import { AdminImageField } from '../admin/AdminImageField.jsx'

export function CaseEditPanel({ draft, updateDraft, getToken }) {
  const [uploading, setUploading] = useState(null)

  if (!draft) return null

  async function handleUpload(slot, file, applyUrl) {
    const token = getToken()
    if (!token) throw new Error('請先登入')
    setUploading(slot)
    try {
      const { url } = await uploadSiteImage(slot, file, token)
      updateDraft((c) => {
        applyUrl(c, `${url}?t=${Date.now()}`)
      })
    } finally {
      setUploading(null)
    }
  }

  const slug = draft.slug

  return (
    <aside className="admin-edit-panel" aria-label="Case 編輯面板">
      <AdminImageField
        slotConfig={CASE_IMAGE_SLOTS.hero(slug)}
        currentUrl={draft.hero.image?.url || ''}
        onUpload={(file) =>
          handleUpload(`case-${slug}-hero`, file, (c, url) => {
            if (!c.hero.image) c.hero.image = { url: '' }
            c.hero.image.url = url
          })}
        uploading={uploading === `case-${slug}-hero`}
      />
      <AdminImageField
        slotConfig={CASE_IMAGE_SLOTS.mediaFull(slug)}
        currentUrl={draft.media.fullWidthImage?.url || ''}
        onUpload={(file) =>
          handleUpload(`case-${slug}-media-full`, file, (c, url) => {
            if (!c.media.fullWidthImage) c.media.fullWidthImage = { url: '' }
            c.media.fullWidthImage.url = url
          })}
        uploading={uploading === `case-${slug}-media-full`}
      />
      <AdminImageField
        slotConfig={CASE_IMAGE_SLOTS.mediaInline(slug)}
        currentUrl={draft.media.inlineImage?.url || ''}
        onUpload={(file) =>
          handleUpload(`case-${slug}-media-inline`, file, (c, url) => {
            if (!c.media.inlineImage) c.media.inlineImage = { url: '' }
            c.media.inlineImage.url = url
          })}
        uploading={uploading === `case-${slug}-media-inline`}
      />
    </aside>
  )
}
