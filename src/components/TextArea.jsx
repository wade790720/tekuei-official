import { useLayoutEffect, useRef } from 'react'
import '../styles/textField.css'

/**
 * TextField for several lines. It grows with its text, so it never scrolls inside.
 * @param {{ value?: string, onChange: (value: string) => void } & Record<string, any>} props
 */
export function TextArea({ value, onChange, className = '', ...rest }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
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
