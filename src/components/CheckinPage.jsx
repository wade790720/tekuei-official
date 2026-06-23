import { useEffect, useState } from 'react'
import {
  CHECKIN_LIFF_ID,
  CHECKIN_META,
  CHECKIN_WORKER_URL,
} from '../data/checkin.js'
import { useLang } from '../i18n'
import '../styles/checkin.css'

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

const UI = {
  zh: {
    loading: '初始化中⋯',
    eyebrow: 'Check-in',
    formTitle: '完成報到手續',
    formSubtitle: '輸入手機號碼，讓我們在課前透過簡訊與 LINE 通知您課程資訊。',
    label: '手機號碼',
    placeholder: '請輸入您的手機號碼',
    hint: '僅用於課程通知，不會用於其他用途。',
    submitIdle: '提交資料',
    submitBusy: 'Sending ...',
    invalidPhone: '請輸入正確的手機號碼（09 開頭，10 碼）',
    submitFailed: '提交失敗，請稍後再試。',
    successTitle: '報到完成',
    successBody: ['我們已收到您的資料', '課程前會透過 LINE 與簡訊通知您', '期待和您在課程中相見'],
    errorTitle: '無法開啟報到頁面',
    errorBody: ['請關閉此視窗後', '從 LINE 訊息重新點選連結', '', '若問題持續發生', '請聯絡客服協助處理'],
  },
  en: {
    loading: 'Initializing...',
    eyebrow: 'Check-in',
    formTitle: 'Complete Your Check-In',
    formSubtitle: 'Enter your phone number so we can notify you before class via SMS and LINE.',
    label: 'Phone Number',
    placeholder: 'Enter your phone number',
    hint: 'Used only for class notifications.',
    submitIdle: 'Submit',
    submitBusy: 'Sending ...',
    invalidPhone: 'Please enter a valid number (must start with 09, 10 digits).',
    submitFailed: 'Submission failed. Please try again.',
    successTitle: 'Check-In Complete',
    successBody: ['We have received your information.', 'You will be notified before class via LINE and SMS.', 'Looking forward to seeing you!'],
    errorTitle: 'Unable to Open Check-In',
    errorBody: ['Please close this window', 'and tap the link from the LINE message again.', '', 'If the issue persists,', 'please contact support.'],
  },
}

export default function CheckinPage() {
  const { lang } = useLang()
  const ui = UI[lang]
  const [phase, setPhase] = useState('loading')
  const [phone, setPhone] = useState('')
  const [errorText, setErrorText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userProfile, setUserProfile] = useState(null)

  const visible = phase !== 'loading'

  useEffect(() => {
    document.title = CHECKIN_META[lang].title
  }, [lang])

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
      setErrorText(ui.invalidPhone)
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
      setErrorText(ui.submitFailed)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="checkin-page">
      <div
        className={['checkin-wrap', visible ? 'is-visible' : ''].filter(Boolean).join(' ')}
      >
        <header className="checkin-brand">
          <div className="checkin-brand-name">TEKUEI</div>
          <div className="checkin-brand-divider" aria-hidden />
        </header>

        <div className="checkin-card">
          {phase === 'loading' && (
            <div className="checkin-loading">{ui.loading}</div>
          )}

          {phase === 'form' && (
            <form onSubmit={handleSubmit}>
              <div className="checkin-eyebrow">{ui.eyebrow}</div>
              <h1 className="checkin-title">{ui.formTitle}</h1>
              <p className="checkin-subtitle">{ui.formSubtitle}</p>

              <label className="checkin-label" htmlFor="checkin-phone">
                {ui.label}
              </label>
              <div className="checkin-phone-row">
                <div className="checkin-country">
                  <span className="checkin-country-flag" aria-hidden>
                    🇹🇼
                  </span>
                  <span>+886</span>
                </div>
                <input
                  id="checkin-phone"
                  type="tel"
                  className="checkin-input"
                  placeholder={ui.placeholder}
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={phone}
                  onChange={(ev) => setPhone(ev.target.value)}
                  autoComplete="tel"
                />
              </div>

              {errorText && (
                <div className="checkin-error" role="alert">
                  {errorText}
                </div>
              )}

              <p className="checkin-hint">{ui.hint}</p>

              <button
                type="submit"
                className="checkin-submit"
                disabled={submitting}
              >
                {submitting ? ui.submitBusy : ui.submitIdle}
              </button>
            </form>
          )}

          {phase === 'success' && (
            <div className="checkin-state">
              <div className="checkin-state-mark" aria-hidden>
                ✦
              </div>
              <h2>{ui.successTitle}</h2>
              <div className="checkin-state-line" aria-hidden />
              <p>
                {ui.successBody.map((line, i) => (
                  <span key={line}>
                    {i > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </p>
            </div>
          )}

          {phase === 'error' && (
            <div className="checkin-state">
              <div
                className="checkin-state-mark checkin-state-mark--muted"
                aria-hidden
              >
                — —
              </div>
              <h2>{ui.errorTitle}</h2>
              <div className="checkin-state-line" aria-hidden />
              <p>
                {ui.errorBody.map((line, i) =>
                  line === '' ? <br key={`br-${i}`} /> : (
                    <span key={line}>
                      {i > 0 && ui.errorBody[i - 1] !== '' ? <br /> : null}
                      {line}
                    </span>
                  )
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
