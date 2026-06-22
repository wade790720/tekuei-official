import { useRef, useState } from 'react'
import { ABOUT_IMAGE_MAX_BYTES } from '../../data/aboutImageSlots.js'

export function AdminImageField({ slotConfig, currentUrl, onUpload, uploading }) {
  const inputRef = useRef(null)
  const [localError, setLocalError] = useState('')

  const accept = slotConfig.accept || 'image/jpeg,image/png,image/webp'
  const acceptList = accept.split(',').map((s) => s.trim())

  async function handleFile(file) {
    setLocalError('')
    if (!file) return
    if (file.size > ABOUT_IMAGE_MAX_BYTES) {
      setLocalError(`檔案超過 ${slotConfig.maxSizeMB}MB 限制`)
      return
    }
    if (!acceptList.includes(file.type)) {
      setLocalError(acceptList.length === 1 && acceptList[0] === 'image/png'
        ? '僅支援 PNG'
        : '僅支援 JPG、PNG、WEBP')
      return
    }
    try {
      await onUpload(file)
    } catch (err) {
      setLocalError(err.message || '上傳失敗')
    }
  }

  return (
    <div className="admin-image-field">
      <div className="admin-field__label">{slotConfig.label}</div>
      <p className="admin-field__hint">{slotConfig.hint}</p>
      {currentUrl ? (
        <img
          className="admin-image-field__preview"
          src={currentUrl}
          alt={slotConfig.label}
        />
      ) : (
        <div className="admin-image-field__placeholder">尚未上傳圖片</div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="admin-image-field__input"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        className="admin-btn admin-btn--ghost"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? '上傳中…' : currentUrl ? '更換圖片' : '上傳圖片'}
      </button>
      {localError && (
        <p className="admin-gate__error" role="alert">
          {localError}
        </p>
      )}
    </div>
  )
}
