import { useLayoutEffect, useRef } from 'react'
import type { ComponentProps } from 'react'
import '../styles/textField.css'

export interface TextAreaProps extends Omit<ComponentProps<'textarea'>, 'value' | 'onChange' | 'ref'> {
  value?: string
  onChange: (value: string) => void
}

/** TextField for several lines. It grows with its text, so it never scrolls inside. */
export function TextArea({ value, onChange, className = '', ...rest }: TextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])
  return (
    <textarea
      ref={ref}
      rows={1}
      className={['text-field', 'text-area', className].filter(Boolean).join(' ')}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  )
}
