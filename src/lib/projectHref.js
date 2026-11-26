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

const filled = (o = {}) => Object.fromEntries(Object.entries(o).filter(([, v]) => v))

/**
 * The work section in one language. A project's English text is its own `en`, written in the edit panel,
 * else the bundled translation, else the Chinese.
 * @param {Record<string, object>} bundledEn  English fields of the first cases, by id
 */
export function localizeWork(work, lang, bundledEn = {}) {
  if (lang !== 'en') return work
  return {
    ...work,
    items: work.items.map((item) => {
      const own = filled(item.en)
      // An English title of its own replaces both halves of the bundled one
      return { ...item, ...bundledEn[item.id], ...own, ...(own.title ? { titleEmWord: '' } : {}) }
    }),
  }
}

/** What readers see: drafts stay in the editor. */
export const publishedWork = (work) => ({ ...work, items: work.items.filter((item) => !item.draft) })

const paragraph = (text) => ({ doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] } })

/**
 * A copy of the work section with the projects that began as code. One the list lacks is added, unless
 * `removed` says Wade deleted it. One the list has but with no page gets its starting page. Running it
 * again changes nothing, so it is safe on every load.
 * @param {{ id: string, page: { zh: string, en: string } }[]} codeProjects  `page` goes to work.content, not to the item
 */
export function withCodeProjects(work, codeProjects) {
  const next = structuredClone(work)
  for (const { page, ...item } of codeProjects) {
    if (next.removed?.includes(item.id)) continue
    if (!next.items.some((x) => x.id === item.id)) next.items.push(structuredClone(item))
    if (projectBody(next, item.id, 'zh')) continue
    next.content = {
      zh: { ...next.content?.zh, [item.id]: paragraph(page.zh) },
      en: { ...next.content?.en, [item.id]: paragraph(page.en) },
    }
  }
  return next
}
