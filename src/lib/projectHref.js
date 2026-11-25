// Case pages moved from /cases/<slug> to /projects/<slug>. R2 and data.json still store the old links.
export const projectHref = (href) => (typeof href === 'string' ? href.replace(/^\/cases\//, '/projects/') : href)
