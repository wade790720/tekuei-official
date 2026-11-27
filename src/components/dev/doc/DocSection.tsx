import type { ReactNode } from 'react'

/**
 * One section of a library page: a heading the "本頁" nav links to, an optional lead, then the content.
 * level 3 is a sub-section (an example, an API part, a step).
 */
interface DocSectionProps {
  id: string
  title: string
  lead?: ReactNode
  level?: 2 | 3
  children?: ReactNode
}

export function DocSection({ id, title, lead, level = 2, children }: DocSectionProps) {
  const H = level === 3 ? 'h3' : 'h2'
  return (
    <section className={`doc-section doc-section--${level}`} aria-labelledby={id}>
      <H className="doc-section__title" id={id}>
        {title}
      </H>
      {lead ? <p className="doc-section__lead">{lead}</p> : null}
      {children}
    </section>
  )
}
