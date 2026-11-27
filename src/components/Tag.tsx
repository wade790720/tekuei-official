import type { ReactNode } from 'react'
import '../styles/tag.css'

/**
 * Without onClick a tag is plain text, as on a list row; variant outline is a framed pill, as on the Work cards.
 * With onClick it is a toggle pill for a filter bar: aria-pressed shows the choice, count shows how many posts.
 */
export type TagProps = { children: ReactNode } & (
  | { onClick?: undefined; variant?: 'plain' | 'outline'; count?: never; selected?: never }
  | { onClick: () => void; count?: number; selected?: boolean; variant?: never }
)

/** A post tag in label type (uppercase, monospace). */
export function Tag({ children, count, selected = false, onClick, variant = 'plain' }: TagProps) {
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

export interface TagListProps {
  tags: readonly string[]
  variant?: 'plain' | 'outline'
}

/** Several tags in a row, for list rows, cards and post headers. */
export function TagList({ tags, variant }: TagListProps) {
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
