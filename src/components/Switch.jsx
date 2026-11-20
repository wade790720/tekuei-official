import '../styles/switch.css'

/**
 * An on / off switch. It has no visible label of its own: put text next to it, and give it `label`.
 * @param {{ checked: boolean, onChange: (checked: boolean) => void, label: string }} props
 */
export function Switch({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={Boolean(checked)} aria-label={label} className="switch" onClick={() => onChange(!checked)}>
      <span className="switch__knob" aria-hidden />
    </button>
  )
}
