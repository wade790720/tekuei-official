import { useEffect, useState } from 'react'
import {
  CHECKIN_LIFF_ID,
  CHECKIN_META,
  CHECKIN_WORKER_URL,
} from '../data/checkin.js'
import '../styles/tekueiCheckin.css'

const LIFF_SDK = 'https://static.line-scdn.net/liff/edge/2/sdk.js'

function validatePhone(phone) {
  return /^09\d{8}$/.test(phone)
}

function loadLiffSdk() {
  if (window.liff) return Promise.resolve(window.liff)
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${LIFF_SDK}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(window.liff))
      existing.addEventListener('error', reject)
      return
    }
    const script = document.createElement('script')
    script.src = LIFF_SDK
    script.async = true
    script.onload = () => resolve(window.liff)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export default function CheckinPage() {
  const [phase, setPhase] = useState('loading')
  const [phone, setPhone] = useState('')
  const [errorText, setErrorText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userProfile, setUserProfile] = useState(null)

  const visible = phase !== 'loading'

  useEffect(() => {
    document.title = CHECKIN_META.title
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const liff = await loadLiffSdk()
        await liff.init({ liffId: CHECKIN_LIFF_ID })

        if (!liff.isLoggedIn()) {
          liff.login()
          return
        }

        const profile = await liff.getProfile()
        if (cancelled) return
        setUserProfile(profile)
        setPhase('form')
      } catch (err) {
        console.error(err)
        if (!cancelled) setPhase('error')
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const rawPhone = phone.replace(/-/g, '').trim()

    if (!validatePhone(rawPhone)) {
      setErrorText('請輸入正確的手機號碼（09 開頭，10 碼）')
      return
    }

    setErrorText('')
    setSubmitting(true)

    try {
      const res = await fetch(CHECKIN_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.userId,
          displayName: userProfile.displayName,
          phone: '+886' + rawPhone.slice(1),
        }),
      })

      if (!res.ok) throw new Error('Server error')
      setPhase('success')
    } catch (err) {
      console.error(err)
      setErrorText('提交失敗，請稍後再試。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="tekuei-checkin-page">
      <div
        className={['tekuei-checkin-wrap', visible ? 'is-visible' : ''].filter(Boolean).join(' ')}
      >
        <header className="tekuei-checkin-brand">
          <div className="tekuei-checkin-brand-name">TEKUEI</div>
          <div className="tekuei-checkin-brand-divider" aria-hidden />
        </header>

        <div className="tekuei-checkin-card">
          {phase === 'loading' && (
            <div className="tekuei-checkin-loading">初始化中⋯</div>
          )}

          {phase === 'form' && (
            <form onSubmit={handleSubmit}>
              <div className="tekuei-checkin-eyebrow">Check-in</div>
              <h1 className="tekuei-checkin-title">完成報到手續</h1>
              <p className="tekuei-checkin-subtitle">
                輸入手機號碼，讓我們在課前透過簡訊與 LINE 通知您課程資訊。
              </p>

              <label className="tekuei-checkin-label" htmlFor="checkin-phone">
                手機號碼
              </label>
              <div className="tekuei-checkin-phone-row">
                <div className="tekuei-checkin-country">
                  <span className="tekuei-checkin-country-flag" aria-hidden>
                    🇹🇼
                  </span>
                  <span>+886</span>
                </div>
                <input
                  id="checkin-phone"
                  type="tel"
                  className="tekuei-checkin-input"
                  placeholder="請輸入您的手機號碼"
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={phone}
                  onChange={(ev) => setPhone(ev.target.value)}
                  autoComplete="tel"
                />
              </div>

              {errorText && (
                <div className="tekuei-checkin-error" role="alert">
                  {errorText}
                </div>
              )}

              <p className="tekuei-checkin-hint">
                僅用於課程通知，不會用於其他用途。
              </p>

              <button
                type="submit"
                className="tekuei-checkin-submit"
                disabled={submitting}
              >
                {submitting ? 'Sending ...' : '提交資料'}
              </button>
            </form>
          )}

          {phase === 'success' && (
            <div className="tekuei-checkin-state">
              <div className="tekuei-checkin-state-mark" aria-hidden>
                ✦
              </div>
              <h2>報到完成</h2>
              <div className="tekuei-checkin-state-line" aria-hidden />
              <p>
                我們已收到您的資料
                <br />
                課程前會透過 LINE 與簡訊通知您
                <br />
                期待和您在課程中相見
              </p>
            </div>
          )}

          {phase === 'error' && (
            <div className="tekuei-checkin-state">
              <div
                className="tekuei-checkin-state-mark tekuei-checkin-state-mark--muted"
                aria-hidden
              >
                — —
              </div>
              <h2>無法開啟報到頁面</h2>
              <div className="tekuei-checkin-state-line" aria-hidden />
              <p>
                請關閉此視窗後
                <br />
                從 LINE 訊息重新點選連結
                <br />
                <br />
                若問題持續發生
                <br />
                請聯絡客服協助處理
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
