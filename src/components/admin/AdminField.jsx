export function AdminField({ label, value, onChange, multiline = false, hint }) {
  const Input = multiline ? 'textarea' : 'input'
  return (
    <label className="admin-field">
      <span className="admin-field__label">{label}</span>
      {hint && <span className="admin-field__hint">{hint}</span>}
      <Input
        className={multiline ? 'admin-field__textarea' : 'admin-field__input'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={multiline ? 4 : undefined}
      />
    </label>
  )
}
