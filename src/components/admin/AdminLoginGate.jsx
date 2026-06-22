import { useState } from 'react'

export function AdminLoginGate({ open, error, loggingIn, onClose, onLogin }) {
  const [password, setPassword] = useState('')

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    const ok = await onLogin(password)
    if (ok) setPassword('')
  }

  return (
    <div className="admin-gate" role="dialog" aria-modal="true" aria-labelledby="admin-gate-title">
      <button type="button" className="admin-gate__backdrop" aria-label="關閉" onClick={onClose} />
      <form className="admin-gate__panel" onSubmit={handleSubmit}>
        <h2 id="admin-gate-title" className="admin-gate__title">
          後台登入
        </h2>
        <p className="admin-gate__hint">Ctrl + Space 開啟 · 僅限管理員</p>
        <label className="admin-field__label" htmlFor="admin-password">
          密碼
        </label>
        <input
          id="admin-password"
          type="password"
          className="admin-field__input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          autoFocus
        />
        {error && (
          <p className="admin-gate__error" role="alert">
            {error}
          </p>
        )}
        <div className="admin-gate__actions">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
            取消
          </button>
          <button type="submit" className="admin-btn" disabled={loggingIn || !password}>
            {loggingIn ? '驗證中…' : '登入'}
          </button>
        </div>
      </form>
    </div>
  )
}
