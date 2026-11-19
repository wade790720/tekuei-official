// Server-side SEO for a client-rendered site. Pages Functions use these to put each page's
// real text, meta tags and JSON-LD into the HTML, so crawlers and AI readers see content without JS.
// Chinese only: the URL does not carry a language yet, and zh is the default.

import { getDoc, docText, safeHref } from './richText.js'
import { getDefaultJournal } from '../data/journal.js'

export const SITE_URL = 'https://tekuei.com'
export const SITE_NAME = 'TEKUEI 德溎'

export const PERSON = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: 'Wade',
  alternateName: 'TEKUEI 德溎',
  url: `${SITE_URL}/about`,
  jobTitle: '工程師、策展人',
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c])

// "<\/script>" inside JSON-LD would end the script tag early.
export const jsonLd = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`

/** R2 data.json, or null when the bucket is empty or the JSON is bad. */
export async function readSiteData(bucket) {
  try {
    const obj = await bucket?.get('data.json')
    return obj ? await obj.json() : null
  } catch {
    return null
  }
}

/** The journal as the site shows it: R2's copy when it exists, else the bundled default. */
export function siteJournal(r2Data) {
  const j = r2Data?.journal
  return j?.posts?.zh ? j : getDefaultJournal()
}

export const isoDate = (d) => String(d ?? '').replace(/\./g, '-')

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
      return (a.slides ?? []).map((s) => figure(s.src, s.alt, s.caption)).join('')
    case 'videoCard':
      return a.caption ? `<p>${esc(a.caption)}</p>` : ''
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
  return {
    title: `${post.title} · Journal · TEKUEI`,
    description: post.excerpt || docText(doc).slice(0, 120),
    url,
    type: 'article',
    ld: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: isoDate(post.date),
      inLanguage: 'zh-Hant',
      url,
      mainEntityOfPage: url,
      author: PERSON,
      publisher: PERSON,
      ...(post.category ? { articleSection: post.category } : {}),
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
    jsonLd(page.ld),
  ].join('\n    ')
  return indexHtml
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${esc(page.description)}$2`)
    .replace(/<meta property="og:(?:type|url|title|description)"[^>]*>\s*/g, '')
    .replace(/<meta name="twitter:(?:title|description)"[^>]*>\s*/g, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', () => `<div id="root">${page.html}</div>`)
}

const STATIC_PATHS =['/', '/journal', '/work', '/about']

export function sitemapXml(journal, workItems) {
  const rows = [
    ...STATIC_PATHS.map((p) => ({ loc: `${SITE_URL}${p}` })),
    ...journal.posts.zh.map((p) => ({ loc: `${SITE_URL}/journal/${p.slug}`, lastmod: isoDate(p.date) })),
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
    '> Wade 的個人網站。他寫了十年程式，也做過兩年展覽策展。文章寫他當下遇到的事：行銷、AI、技術、實作過程。',
    '',
    '## Journal',
    ...posts,
    '',
    '## Work',
    ...cases,
    '',
    '## Pages',
    `- [About](${SITE_URL}/about)`,
    '',
  ].join('\n')
}

/** Pages Function body: the SPA's index.html with one page rendered into it. */
export async function servePage({ request, env }, build) {
  const shell = await env.ASSETS.fetch(new URL('/', request.url))
  const page = build(siteJournal(await readSiteData(env.BUCKET)))
  if (!page || !shell.ok) return shell
  return new Response(injectPage(await shell.text(), page), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  })
}
