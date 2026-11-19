import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ADMIN_CODE_LENGTH, CMS_LABELS as T } from '../../data/admin.js'
import { SecretInput } from '../SecretInput.jsx'
import { CheckIcon } from '../SidePanel.jsx'
import '../../styles/cms.css'

const UNLOCK_MS = 650 // how long "已解鎖" stays before the gate closes

/**
 * Full-screen code gate for edit mode: dark, blurred backdrop around a SecretInput.
 * Verifies as soon as the last digit is in.
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

  // Focus on open and again after a wrong code (the field is swapped for a status pill while verifying).
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

  function change(next) {
    setCode(next)
    if (state === 'error') setState('idle')
  }

  async function verify(next) {
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
              {state === 'verifying' ? <span className="cms-spin" aria-hidden /> : <CheckIcon />}
              {status}
            </div>
          ) : (
            <SecretInput
              ref={input}
              length={ADMIN_CODE_LENGTH}
              value={code}
              onChange={change}
              onComplete={verify}
              invalid={state === 'error'}
              label={T.gateInput}
              describedBy="cms-gate-status"
            />
          )}
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
