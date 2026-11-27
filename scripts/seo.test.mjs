import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { JOURNAL_META } from '../src/data/journal.ts'
import { sampleJournal } from './fixtures/journal.mjs'
import { docHtml, injectPage, journalIndexPage, llmsTxt, postPage, serveCase, servePage, siteCases, siteJournal, sitemapXml } from '../src/lib/seo.ts'
import { fakeR2 } from './fakeR2.mjs'

const journal = sampleJournal()
const slug = journal.posts.zh[0].slug
const work = JSON.parse(readFileSync(new URL('../src/data/data.json', import.meta.url), 'utf8')).work.items
const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

describe('postPage', () => {
  it('renders the post text, meta and BlogPosting JSON-LD into index.html', () => {
    const page = postPage(journal, slug)
    const html = injectPage(indexHtml, page)
    assert.match(html, new RegExp(`<title>${journal.posts.zh[0].title} · Journal · TEKUEI</title>`))
    assert.match(html, /<link rel="canonical" href="https:\/\/tekuei.com\/journal\//)
    assert.match(html, /"@type":"BlogPosting"/)
    assert.match(html, /<div id="root"><article><h1>/)
    assert.equal(html.match(/property="og:title"/g).length, 1, 'default og:title is replaced, not doubled')
    assert.equal(html.match(/name="description"/g).length, 1)
  })

  it('returns null for an unknown slug', () => {
    assert.equal(postPage(journal, 'nope'), null)
  })

  it('escapes HTML in text and drops unsafe links', () => {
    const j = structuredClone(journal)
    j.content.zh[slug] = {
      doc: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: '<script>x</script>' },
              { type: 'text', text: 'bad', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] },
            ],
          },
        ],
      },
    }
    const { html } = postPage(j, slug)
    assert.ok(html.includes('&lt;script&gt;x&lt;/script&gt;'))
    assert.ok(!html.includes('javascript:'))
  })

  it('keeps "</script>" in a title from closing the JSON-LD tag', () => {
    const j = structuredClone(journal)
    j.posts.zh[0].title = '</script><b>'
    const out = injectPage(indexHtml, postPage(j, slug))
    assert.ok(!out.includes('"</script><b>'))
  })

  it('keeps "$" in a title or an excerpt as text', () => {
    const j = structuredClone(journal)
    j.posts.zh[0].title = "省下 $100 和 $& 和 $' 的方法"
    j.posts.zh[0].excerpt = '只要 $100 就能開始'
    const out = injectPage(indexHtml, postPage(j, slug))
    assert.match(out, /<meta\s+name="description"\s+content="只要 \$100 就能開始"/)
    assert.ok(out.includes('<title>省下 $100 和 $&amp; 和 $&#39; 的方法 · Journal · TEKUEI</title>'))
    assert.ok(out.includes(`"headline":"省下 $100 和 $& 和 $' 的方法"`))
    assert.equal(out.match(/<\/head>/g).length, 1)
  })
})

describe('site files', () => {
  it('is an empty journal when R2 has none: no post is bundled with the site', () => {
    assert.deepEqual(siteJournal(null).posts.zh, [])
    const remote = { posts: { zh: [], en: [] }, content: { zh: {}, en: {} } }
    assert.equal(siteJournal({ journal: remote }), remote)
  })

  it('lists posts in the journal index, sitemap and llms.txt', () => {
    assert.match(journalIndexPage(journal, JOURNAL_META.zh).html, new RegExp(`/journal/${slug}`))
    assert.match(sitemapXml(journal, work), new RegExp(`<loc>https://tekuei.com/journal/${slug}</loc>`))
    assert.match(sitemapXml(journal, siteCases(work)), /<loc>https:\/\/tekuei.com\/projects\//)
    assert.doesNotMatch(sitemapXml(journal, siteCases(work)), /\/cases\//)
    assert.match(llmsTxt(journal, work), /^# TEKUEI/)
  })

  it('lists the labs, which live in code, after the client cases', () => {
    const cases = siteCases(work)
    assert.deepEqual(cases.slice(0, work.length).map((w) => w.id), work.map((w) => w.id))
    assert.match(sitemapXml(journal, cases), /<loc>https:\/\/tekuei.com\/labs\/living-portrait<\/loc>/)
    assert.match(llmsTxt(journal, cases), /\[Living Portrait\]\(https:\/\/tekuei.com\/labs\/living-portrait\)/)
  })
})

describe('servePage', () => {
  const ctx = (path) => ({
    request: new Request(`https://tekuei.com${path}`),
    env: { ASSETS: { fetch: async () => new Response(indexHtml) }, BUCKET: fakeR2({ 'data.json': { journal } }) },
  })

  it('answers case and lab pages with 200, unknown ones with 404, and moved ones with 301', async () => {
    const status = async (path) => (await serveCase(ctx(path), work)).status
    assert.equal(await status(siteCases(work)[0].caseHref), 200)
    assert.equal(await status('/labs/living-portrait'), 200)
    assert.equal(await status('/labs/living-portrait/'), 200)
    assert.equal(await status('/projects/nope'), 404)
    assert.equal(await status('/labs/nope'), 404)
    const moved = await serveCase(ctx('/cases/falling-figure'), work)
    assert.equal(moved.status, 301)
    assert.equal(moved.headers.get('Location'), 'https://tekuei.com/labs/falling-figure')
    const old = await serveCase(ctx('/cases/matsu-biennial'), work)
    assert.equal(old.status, 301)
    assert.equal(old.headers.get('Location'), 'https://tekuei.com/projects/matsu-biennial')
  })

  it('renders a known post with 200', async () => {
    const res = await servePage(ctx(`/journal/${slug}`), (j) => postPage(j, slug))
    assert.equal(res.status, 200)
    assert.match(await res.text(), /<article>/)
  })

  it('answers an unknown slug with an uncached 404 that still boots the app', async () => {
    const res = await servePage(ctx('/journal/nope'), (j) => postPage(j, 'nope'))
    assert.equal(res.status, 404)
    assert.equal(res.headers.get('Cache-Control'), 'no-store')
    assert.match(await res.text(), /<div id="root"><\/div>/)
  })
})

describe('post tags', () => {
  it('reads tags, falls back to the old category, and counts them', async () => {
    const { postTags, tagCounts, parseTags } = await import('../src/data/journal.ts')
    assert.deepEqual(postTags({ tags: ['AI'] }), ['AI'])
    assert.deepEqual(postTags({ category: 'NOTE' }), ['NOTE'])
    assert.deepEqual(postTags({ tags: [], category: 'NOTE' }), [])
    assert.deepEqual(tagCounts([{ tags: ['B', 'A'] }, { tags: ['A'] }, { category: 'C' }]), [['A', 2], ['B', 1], ['C', 1]])
    assert.deepEqual(parseTags(' ai, Marketing，ai、 ,'), ['AI', 'MARKETING'])
  })

  it('puts tags into the BlogPosting JSON-LD', () => {
    assert.match(injectPage(indexHtml, postPage(journal, slug)), /"keywords":"PHILOSOPHY"/)
  })
})

it('a project written in the editor gets its own page, and a draft or outside link does not', async () => {
  const { projectPage, siteCases } = await import('../src/lib/seo.ts')
  const doc = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '展覽的說明' }] }] }
  const work = {
    items: [
      { id: 'show', title: '某個展覽', client: '美術館', tags: ['Exhibition'] },
      { id: 'hidden', title: '還沒公開', draft: true },
      { id: 'outside', title: '外部網站', link: 'https://example.com/' },
      { id: 'coded', title: 'Coded', caseHref: '/cases/coded' },
      { id: 'both', title: '有內頁也有網站', link: 'https://example.org/' },
    ],
    content: { zh: { show: { doc }, hidden: { doc }, both: { doc } } },
  }
  const page = projectPage(work, 'show')
  assert.equal(page.url, 'https://tekuei.com/projects/show')
  assert.match(page.html, /<h1>某個展覽<\/h1>.*展覽的說明/)
  assert.equal(projectPage(work, 'hidden'), null, 'a draft has no page')
  assert.equal(projectPage(work, 'coded'), null, 'a page written in code is not rendered here')
  const hrefs = siteCases(work.items, work).map((w) => w.caseHref)
  assert.ok(hrefs.includes('/projects/show') && hrefs.includes('/projects/coded'))
  assert.ok(hrefs.includes('/projects/both'), 'a project with a page is listed at its page, not its outside link')
  assert.ok(!hrefs.includes('/projects/hidden') && !hrefs.some((h) => h.startsWith('http')))
})

describe('docHtml', () => {
  it('writes a picture set name only for the work layout, where the page shows it', () => {
    const set = (layout) => docHtml({ type: 'slidesCard', attrs: { layout, title: 'Name', text: 'Words', slides: [{ src: 'a.webp', alt: 'A' }] } })
    assert.match(set('work'), /<h3>Name<\/h3><p>Words<\/p><figure>/)
    assert.doesNotMatch(set('gallery'), /Name|Words/)
    assert.match(set('gallery'), /<figure>/)
  })
})

describe('social image', () => {
  const withPicture = (src) => {
    const j = structuredClone(journal)
    j.content.zh[slug] = { doc: { type: 'doc', content: [{ type: 'paragraph' }, { type: 'imageCard', attrs: { src, alt: 'A' } }] } }
    return j
  }

  it('keeps the site image for a page without a picture', () => {
    const html = injectPage(indexHtml, postPage(journal, slug))
    assert.match(html, /property="og:image" content="https:\/\/tekuei.com\/og.jpg"/)
    assert.match(html, /name="twitter:card" content="summary_large_image"/)
  })

  it('uses the first picture of a post, as a full URL, in place of the site image', () => {
    const page = postPage(withPicture('/api/file/a.webp'), slug)
    assert.equal(page.image, 'https://tekuei.com/api/file/a.webp')
    const html = injectPage(indexHtml, page)
    assert.equal(html.match(/property="og:image"/g).length, 1)
    assert.doesNotMatch(html, /og:image:width|og.jpg/)
    assert.match(html, /name="twitter:image" content="https:\/\/tekuei.com\/api\/file\/a.webp"/)
  })

  it('skips an inline data picture', () => {
    assert.equal(postPage(withPicture('data:image/png;base64,AAAA'), slug).image, undefined)
  })
})

describe('dateModified', () => {
  it('is the date the post was last changed, or its publish date', async () => {
    const ld = (post) => postPage({ ...journal, posts: { ...journal.posts, zh: [post] } }, slug).ld
    const post = journal.posts.zh[0]
    assert.equal(ld(post).dateModified, ld(post).datePublished)
    assert.equal(ld({ ...post, updated: '2026.12.01' }).dateModified, '2026-12-01')
  })

  it('stampUpdated marks only the posts a save changes, in both languages', async () => {
    const { stampUpdated, today } = await import('../src/data/journal.ts')
    const saved = structuredClone(journal)
    const next = structuredClone(journal)
    const [a, b] = next.posts.zh
    a.title = '改過的標題'
    next.posts.zh.forEach((p, i) => (p.num = String(i + 9)))
    stampUpdated(next, saved, '2026.12.01')
    assert.equal(a.updated, '2026.12.01')
    assert.equal(next.posts.en.find((p) => p.slug === a.slug)?.updated, '2026.12.01')
    assert.equal(b.updated, undefined, 'renumbering is not a change')
    const again = structuredClone(next)
    stampUpdated(again, next, '2026.12.02')
    assert.equal(again.posts.zh[0].updated, '2026.12.01', 'the mark alone is not a change')
    assert.equal(today(new Date(2026, 0, 5)), '2026.01.05')
  })
})

describe('pages written in code', () => {
  const ctx = (path, data = { journal }) => ({
    request: new Request(`https://tekuei.com${path}`),
    params: {},
    env: { ASSETS: { fetch: async () => new Response(indexHtml) }, BUCKET: fakeR2({ 'data.json': data }) },
  })

  it('renders a case from its card and a lab from its entry', async () => {
    const caseHtml = await (await serveCase(ctx('/projects/matsu-biennial'), work)).text()
    assert.match(caseHtml, /<title>Matsu Biennial · Projects · TEKUEI<\/title>/)
    assert.match(caseHtml, /<div id="root"><article><h1>Matsu Biennial<\/h1>.*馬祖國際藝術島/)
    assert.match(caseHtml, /rel="canonical" href="https:\/\/tekuei.com\/projects\/matsu-biennial"/)
    const labHtml = await (await serveCase(ctx('/labs/living-portrait'), work)).text()
    assert.match(labHtml, /<title>Living Portrait · Labs · TEKUEI<\/title>/)
    assert.match(labHtml, /首頁改版前的 Hero/)
  })

  it('lists every project page on /projects', async () => {
    const { projectsIndexPage } = await import('../src/lib/seo.ts')
    const page = projectsIndexPage(siteCases(work), { title: 'TEKUEI · Projects', heading: 'Projects', description: '專案' })
    assert.match(page.html, /href="\/projects\/matsu-biennial"/)
    assert.match(page.html, /href="\/labs\/shatter-footer"/)
    assert.equal(page.ld.hasPart.length, siteCases(work).length)
  })

  it('renders About from R2, with the clients', async () => {
    const { aboutPage } = await import('../src/lib/seo.ts')
    const doc = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '我是 Wade' }] }] }
    const res = await servePage(ctx('/about', { journal, aboutPage: { zh: { doc } } }), (_, data) => aboutPage(data))
    const html = await res.text()
    assert.match(html, /<main><h1>About<\/h1><p>我是 Wade<\/p><h2>合作過的單位<\/h2><ul><li>LG<\/li>/)
    assert.match(html, /"@type":"ProfilePage"/)
  })
})
