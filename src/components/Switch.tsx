import '../styles/switch.css'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

/** An on / off switch. It has no visible label of its own: put text next to it, and give it `label`. */
export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="switch" onClick={() => onChange(!checked)}>
      <span className="switch__knob" aria-hidden />
    </button>
  )
}
