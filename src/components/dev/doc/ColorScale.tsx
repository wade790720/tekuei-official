// What each step range is for, shared by every 12-step scale.
const ROLES: [number, number, string][] = [
  [1, 2, '背景'],
  [3, 5, '互動元件'],
  [6, 8, '邊框'],
  [9, 10, '實色'],
  [11, 12, '文字'],
]

const STEPS = Array.from({ length: 12 }, (_, i) => i + 1)

/**
 * A 12-step color scale: the solid row, the alpha row over a checkerboard, step numbers and the job of each range.
 */
export function ColorScale({ name }: { name: 'gray' | 'accent' }) {
  return (
    <div className="doc-scale-color" role="img" aria-label={`${name} 色階，1 到 12 階`}>
      <div className="doc-scale-color__row">
        {STEPS.map((n) => (
          <span key={n} className="doc-scale-color__cell" style={{ background: `var(--${name}-${n})` }} title={`--${name}-${n}`} />
        ))}
      </div>
      <div className="doc-scale-color__row doc-scale-color__row--alpha">
        {STEPS.map((n) => (
          <span key={n} className="doc-scale-color__cell" title={`--${name}-a${n}`}>
            <span style={{ background: `var(--${name}-a${n})` }} />
          </span>
        ))}
      </div>
      <div className="doc-scale-color__row doc-scale-color__nums" aria-hidden>
        {STEPS.map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
      <div className="doc-scale-color__roles" aria-hidden>
        {ROLES.map(([from, to, label]) => (
          <span key={label} style={{ gridColumn: `${from} / ${to + 1}` }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
