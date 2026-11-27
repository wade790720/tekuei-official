/**
 * A row of boxes, one per token, each drawn with that token (spacing as size, radius as corner).
 */
interface TokenScaleProps {
  tokens: string[]
  kind: 'space' | 'radius'
  label?: (token: string) => string
}

export function TokenScale({ tokens, kind, label = (t) => t.replace(/^--(space|radius)-/, '') }: TokenScaleProps) {
  return (
    <div className={`doc-token-scale doc-token-scale--${kind}`} role="img" aria-label={tokens.join('、')}>
      {tokens.map((t) => (
        <span key={t} className="doc-token-scale__step">
          <span
            className="doc-token-scale__box"
            style={kind === 'space' ? { width: `var(${t})`, height: `var(${t})` } : { borderRadius: `var(${t})` }}
          />
          <span className="doc-token-scale__label">{label(t)}</span>
        </span>
      ))}
    </div>
  )
}
