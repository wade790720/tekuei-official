import { useState } from 'react'
import { ABOUT_IMAGE_SLOTS } from '../../data/aboutImageSlots.js'
import { uploadSiteImage } from '../../lib/adminApi.js'
import { AdminField } from '../admin/AdminField.jsx'
import { AdminImageField } from '../admin/AdminImageField.jsx'

export function AboutEditPanel({ draft, updateDraft, getToken }) {
  const [uploadingPortrait, setUploadingPortrait] = useState(false)
  const [uploadingSignature, setUploadingSignature] = useState(false)

  if (!draft) return null

  async function handlePortraitUpload(file) {
    const token = getToken()
    if (!token) throw new Error('請先登入')
    setUploadingPortrait(true)
    try {
      const { url } = await uploadSiteImage('founder', file, token)
      updateDraft((c) => {
        c.founder.image.url = `${url}?t=${Date.now()}`
      })
    } finally {
      setUploadingPortrait(false)
    }
  }

  async function handleSignatureUpload(file) {
    const token = getToken()
    if (!token) throw new Error('請先登入')
    setUploadingSignature(true)
    try {
      const { url } = await uploadSiteImage('founder-signature', file, token)
      updateDraft((c) => {
        if (!c.founder.signature) {
          c.founder.signature = { slot: 'founder-signature', url: '' }
        }
        c.founder.signature.url = `${url}?t=${Date.now()}`
      })
    } finally {
      setUploadingSignature(false)
    }
  }

  return (
    <aside className="admin-edit-panel" aria-label="About 編輯面板">
      <AdminImageField
        slotConfig={ABOUT_IMAGE_SLOTS.founder}
        currentUrl={draft.founder.image?.url || ''}
        onUpload={handlePortraitUpload}
        uploading={uploadingPortrait}
      />
      <AdminImageField
        slotConfig={ABOUT_IMAGE_SLOTS.founderSignature}
        currentUrl={draft.founder.signature?.url || ''}
        onUpload={handleSignatureUpload}
        uploading={uploadingSignature}
      />
      <AdminField
        label="CTA 聯絡 Email（mailto）"
        value={draft.cta.email}
        onChange={(v) => updateDraft((c) => { c.cta.email = v })}
        hint="底部「與我們聯繫」按鈕連結"
      />
    </aside>
  )
}
