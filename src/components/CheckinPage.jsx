import { useEffect, useMemo, useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import {
  CHECKIN_DEV_PROFILE,
  CHECKIN_LIFF_ID,
  CHECKIN_META,
  CHECKIN_WORKER_URL,
  DEFAULT_PHONE_COUNTRY,
  PREFERRED_PHONE_COUNTRIES,
  isCheckinDevBypass,
  isCheckinLiveSubmit,
} from '../data/checkin.js'
import { digitsToE164, validateCheckinPhone } from '../lib/phoneE164.js'
import { useLang } from '../i18n'
import '../styles/checkin.css'

const LIFF_SDK = 'https://static.line-scdn.net/liff/edge/2/sdk.js'
const LOG = '[checkin]'

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
    searchPlaceholder: '搜尋國碼或國家（例如 88、Taiwan）',
    searchNotFound: '找不到符合的國家',
    hint: '僅用於課程通知，不會用於其他用途。',
    preview: '將送出',
    submitIdle: '提交資料',
    submitBusy: 'Sending ...',
    invalidPhone: '請輸入正確的手機號碼',
    emptyPhone: '請輸入手機號碼',
    submitFailed: '提交失敗，請稍後再試。',
    successTitle: '報到完成',
    successBody: ['我們已收到您的資料', '課程前會透過 LINE 與簡訊通知您', '期待和您在課程中相見'],
    errorTitle: '無法開啟報到頁面',
    errorBody: ['請關閉此視窗後', '從 LINE 訊息重新點選連結', '', '若問題持續發生', '請聯絡客服協助處理'],
    devBadge: '本機開發模式（略過 LIFF）',
    dryRunNote: 'Dry-run：未打 Worker，請看 Console',
  },
  en: {
    loading: 'Initializing...',
    eyebrow: 'Check-in',
    formTitle: 'Complete Your Check-In',
    formSubtitle: 'Enter your phone number so we can notify you before class via SMS and LINE.',
    label: 'Phone Number',
    placeholder: 'Enter your phone number',
    searchPlaceholder: 'Search code or country (e.g. 88, Taiwan)',
    searchNotFound: 'No countries found',
    hint: 'Used only for class notifications.',
    preview: 'Will send',
    submitIdle: 'Submit',
    submitBusy: 'Sending ...',
    invalidPhone: 'Please enter a valid mobile number.',
    emptyPhone: 'Please enter your phone number.',
    submitFailed: 'Submission failed. Please try again.',
    successTitle: 'Check-In Complete',
    successBody: ['We have received your information.', 'You will be notified before class via LINE and SMS.', 'Looking forward to seeing you!'],
    errorTitle: 'Unable to Open Check-In',
    errorBody: ['Please close this window', 'and tap the link from the LINE message again.', '', 'If the issue persists,', 'please contact support.'],
    devBadge: 'Local dev mode (LIFF bypassed)',
    dryRunNote: 'Dry-run: Worker not called — check Console',
  },
}

export default function CheckinPage() {
  const { lang } = useLang()
  const ui = UI[lang]
  const [phase, setPhase] = useState('loading')
  const [phone, setPhone] = useState('')
  const [countryMeta, setCountryMeta] = useState(null)
  const [errorText, setErrorText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [devMode, setDevMode] = useState(false)
  const [lastPayload, setLastPayload] = useState(null)

  const visible = phase !== 'loading'
  const e164Preview = useMemo(
    () => digitsToE164(phone, countryMeta),
    [phone, countryMeta],
  )

  useEffect(() => {
    document.title = CHECKIN_META[lang].title
  }, [lang])

  useEffect(() => {
    let cancelled = false

    async function init() {
      const bypass = isCheckinDevBypass()
      if (bypass) {
        console.info(LOG, 'mode=dev-bypass', {
          tip: 'Open /checkin · dry-run by default · add ?live=1 to POST Worker · ?liff=1 to force LIFF',
        })
        if (cancelled) return
        setDevMode(true)
        setUserProfile(CHECKIN_DEV_PROFILE)
        setPhase('form')
        return
      }

      try {
        console.info(LOG, 'mode=liff')
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
        console.error(LOG, 'liff init failed', err)
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
    const result = validateCheckinPhone(phone, countryMeta)

    if (!result.ok) {
      console.warn(LOG, 'invalid phone', { phone, ...result, countryMeta })
      setErrorText(result.reason === 'empty' ? ui.emptyPhone : ui.invalidPhone)
      return
    }

    const payload = {
      userId: userProfile.userId,
      displayName: userProfile.displayName,
      phone: result.e164,
    }

    console.info(LOG, 'submit payload', payload)
    console.info(LOG, 'phone format check', {
      expectedExample: '+886912869565',
      actual: payload.phone,
      country: countryMeta,
      valid: true,
    })

    setErrorText('')
    setSubmitting(true)
    setLastPayload(payload)

    try {
      const live = isCheckinLiveSubmit()
      if (devMode && !live) {
        console.info(LOG, 'dry-run (no Worker). Add ?live=1 or VITE_CHECKIN_LIVE=true to POST.')
        setPhase('success')
        return
      }

      console.info(LOG, 'POST', CHECKIN_WORKER_URL)
      const res = await fetch(CHECKIN_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      console.info(LOG, 'response', res.status, res.statusText)
      if (!res.ok) throw new Error(`Server error ${res.status}`)

      // 正式 LIFF：成功後直接關窗，不顯示完成頁
      if (!devMode && window.liff?.closeWindow) {
        console.info(LOG, 'closing LIFF window')
        window.liff.closeWindow()
        return
      }

      // 本機無 LIFF 視窗可關，仍顯示完成狀態方便驗證
      setPhase('success')
    } catch (err) {
      console.error(LOG, 'submit failed', err)
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
          {devMode && phase === 'form' ? (
            <div className="checkin-dev-badge" role="status">
              {ui.devBadge}
            </div>
          ) : null}

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

              <div
                className={[
                  'checkin-phone-field',
                  errorText ? 'is-invalid' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <PhoneInput
                  country={DEFAULT_PHONE_COUNTRY}
                  preferredCountries={PREFERRED_PHONE_COUNTRIES}
                  value={phone}
                  onChange={(value, data) => {
                    const digitsOnly = String(value || '').replace(/\D/g, '')
                    setPhone(digitsOnly)
                    setCountryMeta(data)
                    const result = validateCheckinPhone(digitsOnly, data)
                    if (result.ok) setErrorText('')
                    console.debug(LOG, 'phone change', {
                      value: digitsOnly,
                      e164: result.e164,
                      ok: result.ok,
                      reason: result.reason,
                      country: data?.countryCode,
                      dialCode: data?.dialCode,
                      name: data?.name,
                    })
                  }}
                  enableSearch
                  disableSearchIcon={false}
                  searchPlaceholder={ui.searchPlaceholder}
                  searchNotFound={ui.searchNotFound}
                  countryCodeEditable={false}
                  autoFormat={false}
                  disableCountryGuess
                  enableLongNumbers
                  inputProps={{
                    id: 'checkin-phone',
                    name: 'phone',
                    required: true,
                    autoComplete: 'tel',
                    inputMode: 'numeric',
                    onBlur: () => {
                      const result = validateCheckinPhone(phone, countryMeta)
                      if (!result.ok) {
                        setErrorText(
                          result.reason === 'empty' ? ui.emptyPhone : ui.invalidPhone,
                        )
                      }
                    },
                  }}
                  placeholder={ui.placeholder}
                  containerClass="checkin-phone-container"
                  buttonClass="checkin-phone-button"
                  inputClass="checkin-phone-input"
                  dropdownClass="checkin-phone-dropdown"
                  searchClass="checkin-phone-search"
                />
              </div>

              {devMode && e164Preview ? (
                <p className="checkin-preview" data-testid="checkin-e164-preview">
                  {ui.preview}：<code>{e164Preview}</code>
                </p>
              ) : null}

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
              {devMode && lastPayload ? (
                <p className="checkin-dev-payload" data-testid="checkin-last-payload">
                  {ui.dryRunNote}
                  <br />
                  <code>{JSON.stringify(lastPayload)}</code>
                </p>
              ) : null}
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
