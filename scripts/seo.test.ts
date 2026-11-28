import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { sampleJournal, samplePost } from './fixtures/journal.ts'
import { postInEnglish } from '../src/data/journal.ts'
import { blogLd, collectionLd, firstImage, headLinks, ldJson, llmsTxt, pageUrl, postLd, siteCases, siteJournal, sitemapXml } from '../src/lib/seo.ts'
import type { Doc, JournalData, WorkData, WorkItem } from '../src/lib/siteData.ts'

const journal = sampleJournal()
const slug = journal.posts.zh[0].slug
const work: WorkItem[] = JSON.parse(readFileSync(new URL('../src/data/data.json', import.meta.url), 'utf8')).work.items
const body = (text: string) => ({ doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] } })

function halfTranslated(): JournalData {
  const j = structuredClone(journal)
  j.content.en = Object.fromEntries(j.posts.en.slice(1).map((p) => [p.slug, body('English')]))
  return j
}

describe('addresses', () => {
  it('puts English under /en and keeps the home page a directory', () => {
    assert.equal(pageUrl('/', 'zh'), 'https://tekuei.com/')
    assert.equal(pageUrl('/', 'en'), 'https://tekuei.com/en')
    assert.equal(pageUrl('/journal/abc', 'en'), 'https://tekuei.com/en/journal/abc')
  })
})

describe('head links', () => {
  const hreflangs = (links: ReturnType<typeof headLinks>) => links.alternates.map(([l]) => l).join(' ')

  it('an untranslated page names no English version from either URL, and both point at the Chinese one', () => {
    const j = halfTranslated()
    const english = postInEnglish(j, slug)
    assert.equal(english, false)
    for (const lang of ['zh', 'en'] as const) {
      const links = headLinks(`/journal/${slug}`, lang, english)
      assert.equal(hreflangs(links), 'zh-Hant x-default', lang)
      assert.equal(links.canonical, `https://tekuei.com/journal/${slug}`, lang)
      assert.equal(links.locale, 'zh_TW')
      assert.equal(links.localeAlternate, undefined)
    }
  })

  it('once translated, both URLs name both languages and each is its own canonical', () => {
    const other = journal.posts.zh[1].slug
    const english = postInEnglish(halfTranslated(), other)
    assert.equal(english, true)
    const zh = headLinks(`/journal/${other}`, 'zh', english)
    const en = headLinks(`/journal/${other}`, 'en', english)
    assert.equal(hreflangs(zh), 'zh-Hant en x-default')
    assert.equal(hreflangs(en), 'zh-Hant en x-default')
    assert.equal(zh.canonical, `https://tekuei.com/journal/${other}`)
    assert.equal(en.canonical, `https://tekuei.com/en/journal/${other}`)
    assert.equal(en.localeAlternate, 'zh_TW')
  })

  it('the sitemap follows the same rule', () => {
    const xml = sitemapXml(halfTranslated(), [], true)
    assert.doesNotMatch(xml, new RegExp(`hreflang="en" href="https://tekuei.com/en/journal/${slug}"`))
    assert.match(xml, new RegExp(`hreflang="en" href="https://tekuei.com/en/journal/${journal.posts.zh[1].slug}"`))
  })
})

describe('JSON-LD', () => {
  it('keeps "</script>" in a title from closing the script tag', () => {
    const text = ldJson(postLd(samplePost({ title: '</script><script>alert(1)</script>' }), 'zh', pageUrl('/journal/x', 'zh'), undefined))
    assert.doesNotMatch(text, /<\/script>/)
    assert.equal(JSON.parse(text).headline, '</script><script>alert(1)</script>')
  })

  it('names the language, the tags and the date the post last changed', () => {
    const post = journal.posts.zh[0]
    const ld = postLd(post, 'en', pageUrl(`/journal/${slug}`, 'en'), undefined)
    assert.equal(ld.inLanguage, 'en')
    assert.equal(ld.url, `https://tekuei.com/en/journal/${slug}`)
    assert.equal(ld.keywords, 'PHILOSOPHY')
    assert.equal(ld.dateModified, ld.datePublished)
    assert.equal(postLd({ ...post, updated: '2026.12.01' }, 'zh', '', undefined).dateModified, '2026-12-01')
  })

  it('lists the posts of a Journal and the parts of the Projects page in the page language', () => {
    const blog = blogLd({ title: 'Journal', description: 'd' }, journal.posts.en, 'en')
    assert.equal(blog.blogPost.length, journal.posts.en.length)
    assert.match(blog.blogPost[0].url, /^https:\/\/tekuei.com\/en\/journal\//)
    const untranslated = blogLd({ title: 'Journal', description: 'd' }, [{ ...journal.posts.en[0], untranslated: true }], 'en')
    assert.equal(untranslated.blogPost[0].url, `https://tekuei.com/journal/${journal.posts.en[0].slug}`, 'an untranslated post is listed at its Chinese URL')
    const cases = siteCases(work)
    const page = collectionLd({ title: 'Projects', description: 'd' }, cases.map((w) => ({ name: w.title ?? w.id, href: w.caseHref, english: w.english })), 'zh')
    assert.equal(page.hasPart.length, cases.length)
    assert.ok(page.hasPart.some((p) => p.url === 'https://tekuei.com/labs/shatter-footer'))
    const english = collectionLd({ title: 'Projects', description: 'd' }, [{ name: 'A', href: '/projects/a', english: false }, { name: 'B', href: '/projects/b', english: true }], 'en')
    assert.deepEqual(english.hasPart.map((p) => p.url), ['https://tekuei.com/projects/a', 'https://tekuei.com/en/projects/b'], 'an untranslated project is listed at its Chinese URL')
  })
})

describe('social image', () => {
  const doc = (src: string): Doc => ({ type: 'doc', content: [{ type: 'paragraph' }, { type: 'imageCard', attrs: { src, alt: 'A' } }] })

  it('is the first picture of a page, as a full URL', () => {
    assert.equal(firstImage(doc('/api/file/a.webp')), 'https://tekuei.com/api/file/a.webp')
    assert.equal(firstImage({ type: 'doc', content: [{ type: 'videoCard', attrs: { src: 'v.mp4', poster: 'https://x.test/p.jpg' } }] }), 'https://x.test/p.jpg')
  })

  it('skips an inline data picture', () => {
    assert.equal(firstImage(doc('data:image/png;base64,AAAA')), undefined)
  })
})

describe('sitemap and llms.txt', () => {
  it('is an empty journal when R2 has none: no post is bundled with the site', () => {
    assert.deepEqual(siteJournal(null).posts.zh, [])
  })

  it('lists each page in both languages, each naming the other', () => {
    const xml = sitemapXml(halfTranslated(), siteCases(work), true)
    const other = journal.posts.zh[1].slug
    assert.match(xml, new RegExp(`<loc>https://tekuei.com/en/journal/${other}</loc>`))
    assert.match(xml, new RegExp(`<loc>https://tekuei.com/journal/${other}</loc><lastmod>[^<]+</lastmod><xhtml:link rel="alternate" hreflang="zh-Hant" href="https://tekuei.com/journal/${other}"/><xhtml:link rel="alternate" hreflang="en" href="https://tekuei.com/en/journal/${other}"/><xhtml:link rel="alternate" hreflang="x-default"`))
    assert.match(xml, /<loc>https:\/\/tekuei.com\/en\/labs\/living-portrait<\/loc>/)
    assert.doesNotMatch(xml, /\/cases\//)
  })

  it('lists a post with no English body only in Chinese, and About too while its English is empty', () => {
    const xml = sitemapXml(halfTranslated(), [], false)
    assert.match(xml, new RegExp(`<loc>https://tekuei.com/journal/${slug}</loc>`))
    assert.doesNotMatch(xml, new RegExp(`/en/journal/${slug}<`))
    assert.doesNotMatch(xml, new RegExp(`hreflang="en" href="https://tekuei.com/en/journal/${slug}"`))
    assert.doesNotMatch(xml, /\/en\/about/)
    assert.match(xml, /<loc>https:\/\/tekuei.com\/about<\/loc>/)
  })

  it('lists the labs, which live in code, after the client cases', () => {
    const cases = siteCases(work)
    assert.deepEqual(cases.slice(0, work.length).map((w) => w.id), work.map((w) => w.id))
    const text = llmsTxt(journal, cases, siteCases(work, undefined, 'en'), true)
    assert.match(text, /^# TEKUEI/)
    assert.match(text, /\[Living Portrait\]\(https:\/\/tekuei.com\/labs\/living-portrait\)/)
    assert.match(text, /\[Living Portrait\]\(https:\/\/tekuei.com\/en\/labs\/living-portrait\)/)
  })

  it('lists only the English posts that have an English body under English', () => {
    const text = llmsTxt(halfTranslated(), [], [], false)
    const english = text.slice(text.indexOf('## English'))
    assert.doesNotMatch(english, new RegExp(`/en/journal/${slug}\\)`))
    assert.match(english, new RegExp(`/en/journal/${journal.posts.en[1].slug}\\)`))
    assert.doesNotMatch(english, /\/en\/about/, 'an About page with no English body is not listed in English')
  })

  it('a project written in the editor is listed at its page, a draft or outside link is not, and its English waits for its English body', () => {
    const doc = body('展覽的說明')
    const w: WorkData = {
      items: [
        { id: 'show', title: '某個展覽', client: '美術館' },
        { id: 'hidden', title: '還沒公開', draft: true },
        { id: 'outside', title: '外部網站', link: 'https://example.com/' },
        { id: 'coded', title: 'Coded', caseHref: '/cases/coded' },
        { id: 'both', title: '有內頁也有網站', link: 'https://example.org/' },
      ],
      content: { zh: { show: doc, hidden: doc, both: doc }, en: { both: body('English') } },
    }
    const cases = siteCases(w.items, w)
    const hrefs = cases.map((c) => c.caseHref)
    assert.ok(hrefs.includes('/projects/show') && hrefs.includes('/projects/coded') && hrefs.includes('/projects/both'))
    assert.ok(!hrefs.includes('/projects/hidden') && !hrefs.some((h) => h.startsWith('http')))
    assert.equal(cases.find((c) => c.id === 'show')?.english, false)
    assert.equal(cases.find((c) => c.id === 'both')?.english, true)
    assert.equal(cases.find((c) => c.id === 'coded')?.english, true, 'a case written in code has both languages')
  })
})

describe('post tags and dates', () => {
  it('reads tags, falls back to the old category, and counts them', async () => {
    const { postTags, tagCounts, parseTags } = await import('../src/data/journal.ts')
    assert.deepEqual(postTags({ tags: ['AI'] }), ['AI'])
    assert.deepEqual(postTags({ category: 'NOTE' }), ['NOTE'])
    assert.deepEqual(postTags({ tags: [], category: 'NOTE' }), [])
    assert.deepEqual(tagCounts([samplePost({ tags: ['B', 'A'] }), samplePost({ tags: ['A'] }), samplePost({ tags: ['C'] })]), [['A', 2], ['B', 1], ['C', 1]])
    assert.deepEqual(parseTags(' ai, Marketing，ai、 ,'), ['AI', 'MARKETING'])
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
