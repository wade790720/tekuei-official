import '../../styles/project-hero.css'

/**
 * The opening screen of a project page: a picture edge to edge, darkening toward the bottom, where the
 * number, the title and a row of facts sit. ProjectPage and CaseStudyPage both open with it.
 * @param {{ cover?: string, background?: string, num: string, title: string, facts: [label: string, lines: string[], href?: string][] }} props
 *   `background` is a CSS background for a page with no picture.
 */
export function ProjectHero({ cover, background, num, title, facts }) {
  return (
    <header className="project-hero">
      <div className="project-hero__cover fade-in" style={!cover && background ? { background } : undefined} aria-hidden>
        {cover ? <img src={cover} alt="" /> : null}
      </div>
      <div className="project-hero__num fade-in" style={{ '--i': 1 }}>
        {num}
      </div>
      <h1 className="project-hero__title fade-in" style={{ '--i': 2 }}>{title}</h1>
      <dl className="project-hero__facts fade-in" style={{ '--i': 3 }}>
        {facts.map(([label, lines, href]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              {href ? (
                <a href={href} target="_blank" rel="noreferrer">
                  {lines[0]} ↗
                </a>
              ) : (
                lines.map((line) => <span key={line}>{line}</span>)
              )}
            </dd>
          </div>
        ))}
      </dl>
    </header>
  )
}
