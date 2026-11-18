import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ADMIN_CODE_LENGTH, CMS_LABELS as T } from '../../data/admin.js'
import '../../styles/cms.css'

const UNLOCK_MS = 650 // how long "已解鎖" stays before the gate closes

/**
 * Full-screen code gate for edit mode: dark, blurred backdrop and one slot per digit.
 * One real <input> sits over the slots, so typing, paste and the phone's code autofill all work.
 * @param {{ open: boolean, onClose: () => void, onVerify: (code: string) => Promise<boolean>, onUnlocked: () => void }} props
 */
export function OtpGate({ open, onClose, onVerify, onUnlocked }) {
  const input = useRef(null)
  const [code, setCode] = useState('')
  const [state, setState] = useState('idle') // idle | verifying | error | unlocked
  const [prevOpen, setPrevOpen] = useState(open)

  // Every opening starts clean.
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setCode('')
      setState('idle')
    }
  }

  // Focus on open and again after a wrong code (the input is disabled while verifying).
  useEffect(() => {
    if (open && (state === 'idle' || state === 'error')) input.current?.focus()
  }, [open, state])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  async function change(e) {
    if (state === 'verifying' || state === 'unlocked') return
    const next = e.target.value.replace(/\D/g, '').slice(0, ADMIN_CODE_LENGTH)
    setCode(next)
    if (state === 'error') setState('idle')
    if (next.length < ADMIN_CODE_LENGTH) return
    setState('verifying')
    const ok = await onVerify(next)
    if (ok) {
      setState('unlocked')
      setTimeout(onUnlocked, UNLOCK_MS)
    } else {
      setState('error')
      setCode('')
    }
  }

  const status = { verifying: T.verifying, unlocked: T.verified, error: T.wrong }[state] ?? ''
  const busy = state === 'verifying' || state === 'unlocked'

  return createPortal(
    <div className="cms-gate" data-state={state}>
      <button type="button" className="cms-gate__backdrop" onClick={onClose} aria-label={T.gateHint} tabIndex={-1} />
      <div className="cms-gate__panel" role="dialog" aria-modal="true" aria-labelledby="cms-gate-title">
        <div className="cms-gate__pre">{T.gatePre}</div>
        <h2 className="cms-gate__title" id="cms-gate-title">
          {T.gateTitle}
        </h2>

        <div className="cms-gate__field">
          {busy ? (
            <div className="cms-gate__pill">
              {state === 'verifying' ? <span className="cms-gate__spin" aria-hidden /> : <CheckIcon />}
              {status}
            </div>
          ) : (
            <div className="cms-gate__slots" aria-hidden>
              {Array.from({ length: ADMIN_CODE_LENGTH }, (_, i) => (
                <span
                  key={i}
                  className="cms-gate__slot"
                  data-filled={i < code.length || undefined}
                  data-current={i === code.length || undefined}
                />
              ))}
            </div>
          )}
          <input
            ref={input}
            className="cms-gate__input"
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={ADMIN_CODE_LENGTH}
            value={code}
            onChange={change}
            disabled={busy}
            aria-label={T.gateInput}
            aria-describedby="cms-gate-status"
          />
        </div>

        <p className="cms-gate__status" id="cms-gate-status" role="status">
          {state === 'error' ? status : ''}
        </p>
        <p className="cms-gate__hint">{T.gateHint}</p>
      </div>
    </div>,
    document.body,
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 8.5l3.2 3L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
