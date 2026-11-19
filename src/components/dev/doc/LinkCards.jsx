import { Link } from 'react-router-dom'

/**
 * A grid of cards that each lead to another page ("延伸閱讀").
 * @param {{ items: { to: string, title: string, text: string }[] }} props
 */
export function LinkCards({ items }) {
  return (
    <div className="doc-links">
      {items.map((it) => (
        <Link key={it.to} to={it.to} className="doc-links__card">
          <span className="doc-links__title">{it.title}</span>
          <span className="doc-links__text">{it.text}</span>
        </Link>
      ))}
    </div>
  )
}
