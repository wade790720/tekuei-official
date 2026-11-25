import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { getDefaultJournal, JOURNAL_META } from '../src/data/journal.js'
import { injectPage, journalIndexPage, llmsTxt, postPage, serveCase, servePage, siteCases, siteJournal, sitemapXml } from '../src/lib/seo.js'
import { fakeR2 } from './fakeR2.mjs'

const journal = getDefaultJournal()
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
  it('falls back to the bundled journal when R2 has none', () => {
    assert.ok(siteJournal(null).posts.zh.length > 0)
    const remote = { posts: { zh: [] }, content: { zh: {} } }
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
    env: { ASSETS: { fetch: async () => new Response(indexHtml) }, BUCKET: fakeR2() },
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
    const { postTags, tagCounts, parseTags } = await import('../src/data/journal.js')
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
