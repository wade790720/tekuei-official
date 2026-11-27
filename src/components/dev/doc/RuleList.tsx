/**
 * A plain list of rules or notes. Items that start with 「待修」 are known problems and stand out.
 */
export function RuleList({ items }: { items: string[] }) {
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
