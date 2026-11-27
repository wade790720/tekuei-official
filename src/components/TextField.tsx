import '../styles/textField.css'

/**
 * A one-line field that reads as plain text: no border, no focus ring, only the caret.
 * @param {{ value?: string, onChange: (value: string) => void } & Record<string, any>} props
 */
export function TextField({ value, onChange, className = '', ...rest }) {
  return (
    <input
      className={className ? `text-field ${className}` : 'text-field'}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  )
}
