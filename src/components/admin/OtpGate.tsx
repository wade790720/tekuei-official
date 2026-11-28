import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ADMIN_CODE_LENGTH, CMS_LABELS as T } from '../../data/admin.ts'
import { OtpInput } from '../OtpInput.tsx'
import { CheckIcon } from '../SidePanel.tsx'
import '../../styles/cms.css'

const UNLOCK_MS = 650

/**
 * Full-screen code gate for edit mode: dark, blurred backdrop around a OtpInput.
 * Verifies as soon as the last digit is in.
 */
export interface OtpGateProps {
  open: boolean
  onClose: () => void
  /** Resolves true when the code is right; a string is the error to show instead of "wrong code". */
  onVerify: (code: string) => Promise<true | string | false>
  onUnlocked: () => void
}

type GateState = 'idle' | 'verifying' | 'error' | 'unlocked'

export function OtpGate({ open, onClose, onVerify, onUnlocked }: OtpGateProps) {
  const input = useRef<HTMLInputElement>(null)
  const [code, setCode] = useState('')
  const [state, setState] = useState<GateState>('idle')
  const [errorText, setErrorText] = useState(T.wrong)
  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setCode('')
      setState('idle')
    }
  }

  useEffect(() => {
    if (open && (state === 'idle' || state === 'error')) input.current?.focus()
  }, [open, state])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function change(next: string) {
    setCode(next)
    if (state === 'error') setState('idle')
  }

  async function verify(next: string) {
    setState('verifying')
    const ok = await onVerify(next)
    if (ok === true) {
      setState('unlocked')
      setTimeout(onUnlocked, UNLOCK_MS)
    } else {
      setErrorText(typeof ok === 'string' ? ok : T.wrong)
      setState('error')
      setCode('')
    }
  }

  const status = { idle: '', verifying: T.verifying, unlocked: T.verified, error: errorText }[state]
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
              <span className="icon-swap">
                <span data-off={state !== 'verifying' || undefined}>
                  <span className="cms-spin" aria-hidden />
                </span>
                <span data-off={state === 'verifying' || undefined}>
                  <CheckIcon />
                </span>
              </span>
              {status}
            </div>
          ) : (
            <OtpInput
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
