/**
 * A plain list of rules or notes. Items that start with 「待修」 are known problems and stand out.
 * @param {{ items: string[] }} props
 */
export function RuleList({ items }) {
  return (
    <ul className="fd-rules">
      {items.map((t) => (
        <li key={t} data-todo={t.startsWith('待修') || undefined}>
          {t}
        </li>
      ))}
    </ul>
  )
}
