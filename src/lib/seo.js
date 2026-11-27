// Server-side SEO for a client-rendered site. Pages Functions use these to put each page's
// real text, meta tags and JSON-LD into the HTML, so crawlers and AI readers see content without JS.
// Chinese only: the URL does not carry a language yet, and zh is the default.

import { getDoc, docText, safeHref, youtubeId } from './richText.js'
import { getDefaultJournal, postTags, publishedJournal } from '../data/journal.js'
import { ABOUT_CLIENTS, ABOUT_META, getDefaultAbout } from '../data/about.js'
import { LAB_BY_ID, labLinks } from '../labs/index.js'
import { projectBody, projectHref, projectLink, projectTitle } from './projectHref.js'
import { parseSiteData } from './siteData.ts'

export const SITE_URL = 'https://tekuei.com'
export const SITE_NAME = 'TEKUEI 德溎'

export const PERSON = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: 'Wade',
  alternateName: 'TEKUEI 德溎',
  url: `${SITE_URL}/about`,
  jobTitle: '軟體工程師、策展人',
  description: '10 年軟體工程師經歷，策劃過 10 餘檔展覽，同時是 MONOLAB 共同創辦人。目前專注記錄日常想法，以及行銷、軟體工程、AI 相關的內容創作。',
  knowsAbout: ['軟體工程', '美學', '設計', '行銷', 'AI'],
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c])

// "<\/script>" inside JSON-LD would end the script tag early.
export const jsonLd = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`

/** R2 data.json, or null when the bucket is empty or the JSON is bad. A malformed section is left out. */
export async function readSiteData(bucket) {
  try {
    const obj = await bucket?.get('data.json')
    return obj ? parseSiteData(await obj.json()).data : null
  } catch {
    return null
  }
}

/** The journal as the site shows it: R2's copy when it exists, else the bundled default. Drafts never leave here. */
export function siteJournal(r2Data) {
  const j = r2Data?.journal
  return publishedJournal(j?.posts?.zh ? j : getDefaultJournal())
}

export const isoDate = (d) => String(d ?? '').replace(/\./g, '-')

// Social sites fetch the preview image themselves, so it needs a full URL. An inline data: picture is not one.
const imageUrl = (src) => (/^(https?:|\/)/.test(src ?? '') ? new URL(src, SITE_URL).href : undefined)

/** The first picture in a doc: an image card, a picture set's first slide, or a video's poster. */
function firstImage(node) {
  const a = node.attrs ?? {}
  const own = { imageCard: a.src, slidesCard: a.slides?.[0]?.src, videoCard: a.poster }[node.type]
  if (imageUrl(own)) return imageUrl(own)
  for (const kid of node.content ?? []) {
    const found = firstImage(kid)
    if (found) return found
  }
  return undefined
}

function inlineHtml(nodes = []) {
  return nodes
    .map((n) => {
      if (n.type === 'hardBreak') return '<br>'
      if (n.type !== 'text') return inlineHtml(n.content)
      let out = esc(n.text)
      for (const m of n.marks ?? []) {
        if (m.type === 'bold') out = `<strong>${out}</strong>`
        else if (m.type === 'italic') out = `<em>${out}</em>`
        else if (m.type === 'code') out = `<code>${out}</code>`
        else if (m.type === 'link') {
          const href = safeHref(m.attrs?.href)
          if (href) out = `<a href="${esc(href)}">${out}</a>`
        }
      }
      return out
    })
    .join('')
}

const figure = (src, alt, caption) =>
  src
    ? `<figure><img src="${esc(src)}" alt="${esc(alt)}">${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`
    : ''

/** Semantic HTML of a post doc. Crawlers read it; React replaces it on mount. */
export function docHtml(node) {
  const kids = () => (node.content ?? []).map(docHtml).join('')
  const a = node.attrs ?? {}
  switch (node.type) {
    case 'doc':
      return kids()
    case 'paragraph':
    case 'lead':
      return `<p>${inlineHtml(node.content)}</p>`
    case 'heading':
      return `<h${a.level === 3 ? 3 : 2}>${inlineHtml(node.content)}</h${a.level === 3 ? 3 : 2}>`
    case 'blockquote':
      return `<blockquote>${kids()}${a.cite ? `<cite>${esc(a.cite)}</cite>` : ''}</blockquote>`
    case 'bulletList':
      return `<ul>${kids()}</ul>`
    case 'orderedList':
      return `<ol>${kids()}</ol>`
    case 'listItem':
      return `<li>${kids()}</li>`
    case 'codeBlock':
      return `<pre><code>${esc(docText(node))}</code></pre>`
    case 'imageCard':
      return figure(a.src, a.alt, a.caption)
    case 'slidesCard':
      // Only the "work" layout shows its name and words on the page
      return `${a.layout === 'work' && a.title ? `<h3>${esc(a.title)}</h3>` : ''}${a.layout === 'work' && a.text ? `<p>${esc(a.text)}</p>` : ''}${(a.slides ?? []).map((s) => figure(s.src, s.alt, s.caption)).join('')}`
    case 'videoCard': {
      // A YouTube video becomes a link, so crawlers see it; a file video has nothing to show without the player.
      const id = youtubeId(a.src)
      const label = esc(a.caption || 'YouTube')
      if (id) return `<p><a href="https://www.youtube.com/watch?v=${id}">${label}</a></p>`
      return a.caption ? `<p>${esc(a.caption)}</p>` : ''
    }
    case 'horizontalRule':
      return '<hr>'
    default:
      return inlineHtml(node.content)
  }
}

/** Everything one journal page needs for its HTML head and body. Null when the slug is unknown. */
export function postPage(journal, slug) {
  const post = journal.posts.zh.find((p) => p.slug === slug)
  const body = journal.content?.zh?.[slug]
  if (!post || !body) return null
  const url = `${SITE_URL}/journal/${slug}`
  const doc = getDoc(body)
  const image = firstImage(doc)
  return {
    title: `${post.title} · Journal · TEKUEI`,
    description: post.excerpt || docText(doc).slice(0, 120),
    url,
    type: 'article',
    image,
    ld: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: isoDate(post.date),
      dateModified: isoDate(post.updated || post.date),
      ...(image ? { image } : {}),
      inLanguage: 'zh-Hant',
      url,
      mainEntityOfPage: url,
      author: PERSON,
      publisher: PERSON,
      ...(postTags(post).length ? { articleSection: postTags(post)[0], keywords: postTags(post).join(', ') } : {}),
    },
    html:
      `<article><h1>${esc(post.title)}</h1>` +
      `<p><time datetime="${esc(isoDate(post.date))}">${esc(post.date)}</time></p>` +
      `${docHtml(doc)}<p><a href="/journal">Journal</a></p></article>`,
  }
}

export function journalIndexPage(journal, meta) {
  const url = `${SITE_URL}/journal`
  const items = journal.posts.zh
    .map(
      (p) =>
        `<li><a href="/journal/${esc(p.slug)}">${esc(p.title)}</a> ` +
        `<time datetime="${esc(isoDate(p.date))}">${esc(p.date)}</time><p>${esc(p.excerpt)}</p></li>`,
    )
    .join('')
  return {
    title: meta.title,
    description: meta.description,
    url,
    type: 'website',
    ld: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: meta.title,
      description: meta.description,
      url,
      inLanguage: 'zh-Hant',
      author: PERSON,
      blogPost: journal.posts.zh.map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        url: `${SITE_URL}/journal/${p.slug}`,
        datePublished: isoDate(p.date),
      })),
    },
    html: `<main><h1>Journal</h1><p>${esc(meta.description)}</p><ul>${items}</ul></main>`,
  }
}

/** Puts one page into the built index.html: title, description, social tags, JSON-LD and body text. */
export function injectPage(indexHtml, page) {
  const head = [
    `<link rel="canonical" href="${esc(page.url)}">`,
    `<meta property="og:type" content="${page.type}">`,
    `<meta property="og:url" content="${esc(page.url)}">`,
    `<meta property="og:title" content="${esc(page.title)}">`,
    `<meta property="og:description" content="${esc(page.description)}">`,
    `<meta name="twitter:title" content="${esc(page.title)}">`,
    `<meta name="twitter:description" content="${esc(page.description)}">`,
    ...(page.image
      ? [`<meta property="og:image" content="${esc(page.image)}">`, `<meta name="twitter:image" content="${esc(page.image)}">`]
      : []),
    jsonLd(page.ld),
  ].join('\n    ')
  // The default image's width and height go too: the page's own picture has other sizes.
  const ownImage = (html) =>
    page.image ? html.replace(/<meta (?:property="og:image[^"]*"|name="twitter:image")[^>]*>\s*/g, '') : html
  return ownImage(indexHtml)
    // Every replacement is a function: in a replacement string, "$1" or "$&" in a title or an excerpt
    // (a price, say) would be read as a command.
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(page.title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, (_, open, close) => open + esc(page.description) + close)
    .replace(/<meta property="og:(?:type|url|title|description)"[^>]*>\s*/g, '')
    .replace(/<meta name="twitter:(?:title|description)"[^>]*>\s*/g, '')
    .replace('</head>', () => `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', () => `<div id="root">${page.html}</div>`)
}

/**
 * Case pages for sitemap and llms.txt: the client cases (R2 work items, at their /projects links), then the labs.
 * @param {object} [work]  the work section the items came from, so a project with a page written in the editor is found
 */
export const siteCases = (workItems, work) => [
  ...workItems
    .filter((w) => !w.draft)
    .map((w) => ({ ...w, caseHref: projectLink(w, work) }))
    // A card that only links to another site has no page here
    .filter((w) => w.caseHref.startsWith('/')),
  ...labLinks('zh'),
]

/** Everything a project page written in the editor needs for its HTML head and body. Null for any other slug. */
export function projectPage(work, slug) {
  const item = work?.items?.find((w) => w.id === slug && !w.draft)
  const body = projectBody(work, slug, 'zh')
  if (!item || !body) return null
  const url = `${SITE_URL}/projects/${slug}`
  const title = projectTitle(item)
  const doc = getDoc(body)
  const description = docText(doc).slice(0, 120) || item.client
  return {
    title: `${title} · Projects · TEKUEI`,
    description,
    url,
    type: 'article',
    image: imageUrl(item.thumbImage?.url) ?? firstImage(doc),
    ld: {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: title,
      description,
      inLanguage: 'zh-Hant',
      url,
      mainEntityOfPage: url,
      creator: PERSON,
      ...(item.tags?.length ? { keywords: item.tags.join(', ') } : {}),
    },
    html:
      `<article><h1>${esc(title)}</h1>` +
      (item.client ? `<p>${esc(item.client)}</p>` : '') +
      `${docHtml(doc)}<p><a href="/projects">Projects</a></p></article>`,
  }
}

const paragraphs = (lines) => lines.filter(Boolean).map((t) => `<p>${esc(t)}</p>`).join('')

/**
 * A case or lab whose page is written in code: the text of its card, or of its lab entry.
 * The old case files also import videos, which a Pages Function cannot bundle, so their long copy is not used.
 */
export function casePage(item) {
  const url = `${SITE_URL}${item.caseHref}`
  const lab = item.caseHref.startsWith('/labs/') ? LAB_BY_ID[item.id]?.zh : null
  const title = lab?.title ?? projectTitle(item)
  const description = lab?.summary ?? ((item.descriptionLines ?? []).join('') || item.client)
  const tags = lab?.tags ?? item.tags ?? []
  return {
    title: `${title} · ${lab ? 'Labs' : 'Projects'} · TEKUEI`,
    description,
    url,
    type: 'article',
    ld: {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: title,
      description,
      inLanguage: 'zh-Hant',
      url,
      mainEntityOfPage: url,
      creator: PERSON,
      ...(tags.length ? { keywords: tags.join(', ') } : {}),
    },
    html:
      `<article><h1>${esc(title)}</h1>` +
      paragraphs(lab ? [lab.subtitle, ...lab.intro] : [item.client, description]) +
      (tags.length ? `<p>${esc(tags.join('、'))}</p>` : '') +
      `<p><a href="/projects">Projects</a></p></article>`,
  }
}

/** @param {{ caseHref: string }[]} cases  siteCases: what the Projects list shows, with a page here */
export function projectsIndexPage(cases, meta) {
  const url = `${SITE_URL}/projects`
  const items = cases
    .map((w) => `<li><a href="${esc(w.caseHref)}">${esc(projectTitle(w))}</a><p>${esc(w.client)}</p></li>`)
    .join('')
  return {
    title: meta.title,
    description: meta.description,
    url,
    type: 'website',
    ld: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: meta.title,
      description: meta.description,
      url,
      inLanguage: 'zh-Hant',
      author: PERSON,
      hasPart: cases.map((w) => ({ '@type': 'CreativeWork', name: projectTitle(w), url: `${SITE_URL}${w.caseHref}` })),
    },
    html: `<main><h1>${esc(meta.heading)}</h1><p>${esc(meta.description)}</p><ul>${items}</ul></main>`,
  }
}

/** The About page: R2's `aboutPage` body, else the bundled default, and the clients named under it. */
export function aboutPage(r2Data) {
  const url = `${SITE_URL}/about`
  const doc = getDoc(r2Data?.aboutPage?.zh ?? getDefaultAbout().zh)
  const meta = ABOUT_META.zh
  const clients = ABOUT_CLIENTS.flat().map((c) => `<li>${esc(c.zh)}</li>`).join('')
  return {
    title: meta.documentTitle,
    description: docText(doc).slice(0, 120),
    url,
    type: 'profile',
    image: firstImage(doc),
    ld: { '@context': 'https://schema.org', '@type': 'ProfilePage', url, inLanguage: 'zh-Hant', mainEntity: PERSON },
    html: `<main><h1>${esc(meta.title)}</h1>${docHtml(doc)}<h2>${esc(meta.clients)}</h2><ul>${clients}</ul></main>`,
  }
}

const STATIC_PATHS = ['/', '/journal', '/projects', '/about']

export function sitemapXml(journal, workItems) {
  const rows = [
    ...STATIC_PATHS.map((p) => ({ loc: `${SITE_URL}${p}` })),
    ...journal.posts.zh.map((p) => ({ loc: `${SITE_URL}/journal/${p.slug}`, lastmod: isoDate(p.updated || p.date) })),
    ...workItems.filter((w) => w.caseHref).map((w) => ({ loc: `${SITE_URL}${w.caseHref}` })),
  ]
  const urls = rows
    .map((r) => `<url><loc>${esc(r.loc)}</loc>${r.lastmod ? `<lastmod>${esc(r.lastmod)}</lastmod>` : ''}</url>`)
    .join('')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
}

/** llms.txt (llmstxt.org): a Markdown map of the site for AI readers. */
export function llmsTxt(journal, workItems) {
  const posts = journal.posts.zh.map((p) => `- [${p.title}](${SITE_URL}/journal/${p.slug}): ${p.excerpt}`)
  const cases = workItems.filter((w) => w.caseHref).map(
    (w) => `- [${[w.titleEmWord, w.title].filter(Boolean).join(' ')}](${SITE_URL}${w.caseHref}): ${w.client}`,
  )
  return [
    `# ${SITE_NAME}`,
    '',
    '> 遵循內心並實踐創造，追求卓越，為熱愛而學習，勇於面對未知與挑戰。',
    '',
    `Wade：${PERSON.description}`,
    '',
    `主題：${PERSON.knowsAbout.join('、')}`,
    '',
    '## Journal',
    ...posts,
    '',
    '## Projects',
    ...cases,
    '',
    '## Pages',
    `- [About](${SITE_URL}/about)`,
    '',
  ].join('\n')
}

// Old links that are already in search indexes. A Pages Function answers a path before public/_redirects
// is read, so the redirects for /cases/* are here: the two labs went to /labs/, every case to /projects/.
const MOVED = {
  '/cases/living-portrait': '/labs/living-portrait',
  '/cases/falling-figure': '/labs/falling-figure',
}

/**
 * Pages Function body for /projects/:slug, /labs/:slug and the old /cases/:slug: the SPA's index.html, with status 404 when no
 * such page exists. The app draws its own "not found" either way; the status is for crawlers.
 * @param {{ caseHref?: string }[]} workItems  the client cases; the labs are added here
 */
export async function serveCase({ request, env }, workItems) {
  const url = new URL(request.url)
  const path = url.pathname.replace(/\/$/, '')
  if (MOVED[path]) return Response.redirect(new URL(MOVED[path], url).href, 301)
  if (path.startsWith('/cases/')) return Response.redirect(new URL(projectHref(path), url).href, 301)
  const shell = await env.ASSETS.fetch(new URL('/', url))
  if (!shell.ok) return shell
  const item = siteCases(workItems).find((w) => w.caseHref === path)
  if (item) return rendered(shell, casePage(item))
  return new Response(shell.body, {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

/** Pages Function body: the SPA's index.html with one page rendered into it. */
export async function servePage({ request, env }, build) {
  const data = readSiteData(env.BUCKET) // runs while the shell loads; it catches its own errors
  const shell = await env.ASSETS.fetch(new URL('/', request.url))
  if (!shell.ok) return shell
  const site = await data
  const page = build(siteJournal(site), site)
  // Unknown slug: the app still renders its own "not found", but crawlers get a 404 instead of an empty 200.
  // Not cached: a slug can be missing only because R2 was unreachable for a moment.
  if (!page) {
    return new Response(shell.body, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    })
  }
  return rendered(shell, page)
}

const rendered = async (shell, page) =>
  new Response(injectPage(await shell.text(), page), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  })

/**
 * Pages Function body for /projects/:slug. A project written in the editor is rendered into the HTML,
 * like a journal post. Any other slug goes to serveCase: the cases whose pages are code, or a 404.
 * @param {{ caseHref?: string }[]} bundled  the work items to use when R2 has none
 */
export async function serveProject(ctx, bundled) {
  const work = (await readSiteData(ctx.env.BUCKET))?.work
  const page = projectPage(work, ctx.params.slug)
  if (!page) return serveCase(ctx, work?.items ?? bundled)
  const shell = await ctx.env.ASSETS.fetch(new URL('/', ctx.request.url))
  return shell.ok ? rendered(shell, page) : shell
}
