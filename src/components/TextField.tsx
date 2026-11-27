import type { ComponentProps } from 'react'
import '../styles/textField.css'

export interface TextFieldProps extends Omit<ComponentProps<'input'>, 'value' | 'onChange'> {
  value?: string
  onChange: (value: string) => void
}

/** A one-line field that reads as plain text: no border, no focus ring, only the caret. */
export function TextField({ value, onChange, className = '', ...rest }: TextFieldProps) {
  return (
    <input
      className={className ? `text-field ${className}` : 'text-field'}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  )
}
