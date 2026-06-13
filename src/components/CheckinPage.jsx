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
  const [loadMessage, setLoadMessage] = useState('初始化中⋯')
  const [phone, setPhone] = useState('')
  const [showError, setShowError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [userProfile, setUserProfile] = useState(null)

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
        if (!cancelled) {
          setLoadMessage('初始化失敗，請關閉後重試。')
        }
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
      setShowError(true)
      return
    }

    setShowError(false)
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
      alert('提交失敗，請稍後再試。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="tekuei-checkin-page">
      <div className="tekuei-checkin-card">
        {phase === 'loading' && (
          <div className="tekuei-checkin-loading">{loadMessage}</div>
        )}

        {phase === 'form' && (
          <form onSubmit={handleSubmit}>
            <div className="tekuei-checkin-logo">TEKUEI</div>
            <h1 className="tekuei-checkin-title">完成報到手續</h1>
            <p className="tekuei-checkin-subtitle">
              輸入手機號碼，讓我們在課前透過簡訊與 LINE 通知您課程資訊。
            </p>

            <div className="tekuei-checkin-label">手機號碼</div>
            <div className="tekuei-checkin-phone-row">
              <div className="tekuei-checkin-country">
                <span className="tekuei-checkin-country-flag" aria-hidden>
                  🇹🇼
                </span>
                <span>+886</span>
              </div>
              <input
                type="tel"
                className="tekuei-checkin-input"
                placeholder="09xx-xxx-xxx"
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                value={phone}
                onChange={(ev) => setPhone(ev.target.value)}
                autoComplete="tel"
              />
            </div>

            {showError && (
              <div className="tekuei-checkin-error" role="alert">
                請輸入正確的手機號碼（09 開頭，10 碼）
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
              {submitting ? '提交中⋯' : '提交資料'}
            </button>
          </form>
        )}

        {phase === 'success' && (
          <div className="tekuei-checkin-success">
            <div className="tekuei-checkin-success-icon" aria-hidden>
              ✅
            </div>
            <h2>報到完成！</h2>
            <p>
              我們已收到您的資料
              <br />
              課程前會透過 LINE 與簡訊通知您
              <br />
              期待和您在課程中見面！
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
