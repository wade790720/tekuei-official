import { useState } from 'react'
import { Example } from './Example.jsx'

/** CSS for one step, as a developer would write it. Label and Mono also change the font. */
function stepCss({ token, family, tracking }) {
  return [
    family && `font-family: var(${family});`,
    `font-size: var(${token});`,
    `line-height: var(${token}-lh);`,
    tracking && `letter-spacing: var(${token}-ls);`,
  ]
    .filter(Boolean)
    .join('\n')
}

const stepStyle = ({ token, family, tracking, upper }) => ({
  fontFamily: family ? `var(${family})` : undefined,
  fontSize: `var(${token})`,
  lineHeight: `var(${token}-lh)`,
  letterSpacing: tracking ? `var(${token}-ls)` : undefined,
  textTransform: upper ? 'uppercase' : undefined,
})

/**
 * The type scale as a row of "Aa" at every size (Radix Themes style). Picking a step shows a sample
 * at that size with its CSS underneath.
 * @param {{ steps: { name: string, token: string, sample: string, family?: string, tracking?: boolean, upper?: boolean }[], initial?: string }} props
 */
export function TypeScalePicker({ steps, initial }) {
  const [current, setCurrent] = useState(initial ?? steps[0].name)
  const step = steps.find((s) => s.name === current) ?? steps[0]
  return (
    <>
      <div className="doc-scale" role="group" aria-label="字級">
        {steps.map((s) => (
          <button
            key={s.name}
            type="button"
            className="doc-scale__step"
            aria-pressed={s.name === current}
            onClick={() => setCurrent(s.name)}
            onMouseEnter={() => setCurrent(s.name)}
          >
            <span className="doc-scale__aa" style={stepStyle(s)} aria-hidden>
              Aa
            </span>
            <span className="doc-scale__name">{s.name}</span>
          </button>
        ))}
      </div>
      <Example code={stepCss(step)} lang="css">
        <p className="doc-scale__sample" style={stepStyle(step)}>
          {step.sample}
        </p>
      </Example>
    </>
  )
}
