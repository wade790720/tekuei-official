import '../styles/otpInput.css'

/**
 * A secret code field: one box per character, filled boxes show a dot, never the character.
 * Same idea as shadcn InputOTP, Mantine PinInput and Ant Design Input.OTP.
 * One real <input> covers the boxes, so typing, paste and the phone's one-time-code autofill all work.
 * @param {{
 *   value: string,
 *   onChange: (value: string) => void,
 *   onComplete?: (value: string) => void,  // called once the last box is filled
 *   length?: number,
 *   numeric?: boolean,                     // digits only (default)
 *   invalid?: boolean,                     // boxes shake once and turn red
 *   disabled?: boolean,
 *   label: string,                         // accessible name
 *   describedBy?: string,
 *   ref?: import('react').Ref<HTMLInputElement>,
 * }} props
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
}) {
  function change(e) {
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
