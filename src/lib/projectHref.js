// Case pages moved from /cases/<slug> to /projects/<slug>. R2 and data.json still store the old links.
export const projectHref = (href) => (typeof href === 'string' ? href.replace(/^\/cases\//, '/projects/') : href)

export const projectTitle = (item) => [item.titleEmWord, item.title].filter(Boolean).join(' ')

/** A project's page body in one language, or null: the first three cases have pages written in code instead. */
export const projectBody = (work, id, lang) => work?.content?.[lang]?.[id] ?? null

/**
 * Where a project's card goes: its own page when it has one, written in code or in the editor.
 * Only a project with no page goes straight to its outside link.
 * @param {object} [work]  the work section, for the pages written in the editor
 */
export const projectLink = (item, work) =>
  item.link && !item.caseHref && !projectBody(work, item.id, 'zh') ? item.link : projectHref(item.caseHref ?? `/projects/${item.id}`)
