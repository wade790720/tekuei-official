export function AdminEditToolbar({
  saving,
  error,
  onSave,
  onCancel,
  onLogout,
  onDownload,
}) {
  return (
    <div className="admin-toolbar">
      <div className="admin-toolbar__status">
        <span className="admin-toolbar__badge">編輯模式</span>
        {error && (
          <span className="admin-toolbar__error" role="alert">
            {error}
          </span>
        )}
      </div>
      <div className="admin-toolbar__actions">
        <button type="button" className="admin-btn admin-btn--ghost" onClick={onDownload}>
          下載 JSON
        </button>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={onLogout}>
          登出
        </button>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel}>
          取消
        </button>
        <button type="button" className="admin-btn" onClick={onSave} disabled={saving}>
          {saving ? '儲存中…' : '儲存'}
        </button>
      </div>
    </div>
  )
}
