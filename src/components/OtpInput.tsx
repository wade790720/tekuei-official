import type { ChangeEvent, Ref } from 'react'
import '../styles/otpInput.css'

export interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  /** called once the last box is filled */
  onComplete?: (value: string) => void
  length?: number
  /** digits only (default) */
  numeric?: boolean
  /** boxes shake once and turn red */
  invalid?: boolean
  disabled?: boolean
  /** accessible name */
  label: string
  describedBy?: string
  ref?: Ref<HTMLInputElement>
}

/**
 * A secret code field: one box per character, filled boxes show a dot, never the character.
 * Same idea as shadcn InputOTP, Mantine PinInput and Ant Design Input.OTP.
 * One real <input> covers the boxes, so typing, paste and the phone's one-time-code autofill all work.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  numeric = true,
  invalid = false,
  disabled = false,
  label,
  describedBy,
  ref,
}: OtpInputProps) {
  function change(e: ChangeEvent<HTMLInputElement>) {
    const raw = numeric ? e.target.value.replace(/\D/g, '') : e.target.value
    const next = raw.slice(0, length)
    onChange(next)
    if (next.length === length) onComplete?.(next)
  }

  return (
    <div className="otp-input" data-invalid={invalid || undefined}>
      <div className="otp-input__slots" aria-hidden>
        {Array.from({ length }, (_, i) => (
          <span
            key={i}
            className="otp-input__slot"
            data-filled={i < value.length || undefined}
            data-current={i === value.length || undefined}
          />
        ))}
      </div>
      <input
        ref={ref}
        className="otp-input__field"
        type="password"
        inputMode={numeric ? 'numeric' : 'text'}
        autoComplete="one-time-code"
        pattern={numeric ? '[0-9]*' : undefined}
        maxLength={length}
        value={value}
        onChange={change}
        disabled={disabled}
        aria-label={label}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
      />
    </div>
  )
}
