import '../styles/tag.css'

/**
 * A post tag in label type (uppercase, monospace). Without onClick it is plain text, as on a list row.
 * With onClick it is a toggle pill for a filter bar: aria-pressed shows the choice, count shows how many posts.
 * @param {{
 *   children: import('react').ReactNode,
 *   count?: number,
 *   selected?: boolean,
 *   onClick?: () => void,
 *   variant?: 'plain' | 'outline',
 * }} props
 *   variant applies to the plain tag only: outline is a framed pill, as on the Work cards.
 */
export function Tag({ children, count, selected = false, onClick, variant = 'plain' }) {
  if (!onClick) return <span className={variant === 'outline' ? 'tag tag--outline' : 'tag'}>{children}</span>
  return (
    // Silent: a filter gets clicked many times in a row
    <button type="button" className="tag tag--button" aria-pressed={selected} onClick={onClick} data-sound="off">
      <span>{children}</span>
      {count != null ? <span className="tag__count">{count}</span> : null}
    </button>
  )
}

// A filter bar is a row of Tag buttons inside a .tag-group (role="group" with an aria-label).

/** Several tags in a row, for list rows, cards and post headers. */
export function TagList({ tags, variant }) {
  if (!tags.length) return null
  return (
    <span className="tag-list">
      {tags.map((t) => (
        <Tag key={t} variant={variant}>
          {t}
        </Tag>
      ))}
    </span>
  )
}
