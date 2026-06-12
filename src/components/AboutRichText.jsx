/** @param {{ parts: { t: string, accent?: boolean }[] }} props */
export function AboutParts({ parts }) {
  return parts.map((p, i) =>
    p.accent ? (
      <em key={i} className="about-accent">
        {p.t}
      </em>
    ) : (
      <span key={i}>{p.t}</span>
    ),
  )
}

/** @param {string | { parts: { t: string, accent?: boolean }[] }} line */
export function AboutLine({ line }) {
  if (typeof line === 'string') return line
  return <AboutParts parts={line.parts} />
}
