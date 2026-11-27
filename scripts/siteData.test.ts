import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseSiteData } from '../src/lib/siteData.ts'

const doc = (text: string) => ({ doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] } })
const post = (slug: string, extra = {}) => ({
  slug,
  num: '01',
  tags: ['NOTE'],
  date: '2026.11.01',
  title: '標題',
  titleEn: 'Title',
  excerpt: '摘要',
  ...extra,
})
const site = () => ({
  journal: {
    posts: { zh: [post('a', { draft: true, readMin: 6 })], en: [post('a', { title: 'Title' })] },
    content: { zh: { a: doc('中文') }, en: { a: doc('English') } },
  },
  work: {
    meta: { title: 'TEKUEI · Work' },
    items: [{ id: 'matsu', title: 'Biennial', tags: ['Web'], thumbImage: { url: '' }, en: { title: 'Matsu' }, draft: false }],
    content: { zh: { matsu: doc('內頁') }, en: {} },
    removed: ['sre'],
  },
  aboutPage: { zh: doc('關於'), en: doc('About') },
  cases: { monolab: { hero: { image: { url: '/api/file/a.webp' } } } },
  about: { meta: { title: 'old copy' } },
})

test('a complete data.json comes through unchanged, fields the site does not know about included', () => {
  const { data, invalid } = parseSiteData(site())
  assert.deepEqual(invalid, [])
  assert.deepEqual(data, site())
})

test('anything but a JSON object is refused as a whole', () => {
  for (const raw of [null, [], 'data', 42]) assert.throws(() => parseSiteData(raw), `refuses ${JSON.stringify(raw)}`)
})

test('a section R2 does not have yet is missing, not broken', () => {
  const { data, invalid } = parseSiteData({ work: site().work })
  assert.deepEqual(invalid, [])
  assert.equal(data.journal, undefined)
  assert.equal(data.aboutPage, undefined)
  assert.ok(data.work)
})

test('a post saved before tags existed gets its category as its only tag, and keeps the category', () => {
  const old = { slug: 'a', num: '01', category: 'VISUAL', date: '2025.01.01', title: '舊文', titleEn: '', excerpt: '' }
  const journal = { posts: { zh: [old], en: [] }, content: { zh: {}, en: {} } }
  const read = parseSiteData({ journal }).data.journal?.posts.zh[0]
  assert.deepEqual(read?.tags, ['VISUAL'])
  assert.equal(read?.category, 'VISUAL')
})

test('a journal with no English yet gets an empty English list, so adding a post in the editor works', () => {
  const zhOnly = { posts: { zh: [post('a')] }, content: { zh: { a: doc('中文') } } }
  const { data, invalid } = parseSiteData({ journal: zhOnly })
  assert.deepEqual(invalid, [])
  assert.deepEqual(data.journal?.posts.en, [])
  assert.deepEqual(data.journal?.content.en, {})
  assert.equal(data.journal?.posts.zh[0].slug, 'a')
})

test('a post missing a text field reads it as empty', () => {
  const { slug, title } = post('a')
  const journal = { posts: { zh: [{ slug, title }], en: [] }, content: { zh: {}, en: {} } }
  const read = parseSiteData({ journal }).data.journal?.posts.zh[0]
  assert.deepEqual(
    { num: read?.num, date: read?.date, titleEn: read?.titleEn, excerpt: read?.excerpt, tags: read?.tags },
    { num: '', date: '', titleEn: '', excerpt: '', tags: [] },
  )
})

test('a body stored in the old block format is accepted', () => {
  const s = site()
  const journal = { ...s.journal, content: { zh: { a: { blocks: [{ type: 'p', text: '舊' }] } }, en: {} } }
  const { data, invalid } = parseSiteData({ ...s, journal })
  assert.deepEqual(invalid, [])
  assert.deepEqual(data.journal?.content.zh.a, { blocks: [{ type: 'p', text: '舊' }] })
})

test('a broken section is reported by name, and the other sections still load', () => {
  const broken: Record<string, unknown>[] = [
    { journal: { posts: { zh: 'not a list', en: [] }, content: { zh: {}, en: {} } } },
    { journal: { posts: { zh: [{ title: 'no slug' }], en: [] }, content: { zh: {}, en: {} } } },
    { journal: { posts: { zh: [post('a', { tags: [1] })], en: [] }, content: { zh: {}, en: {} } } },
    { journal: { posts: { zh: [post('a', { title: 7 })], en: [] }, content: { zh: {}, en: {} } } },
    { journal: { posts: { zh: [], en: [] }, content: { zh: { a: 'text' }, en: {} } } },
    { journal: 'gone' },
  ]
  for (const bad of broken) {
    const { data, invalid } = parseSiteData({ ...site(), ...bad })
    assert.deepEqual(invalid, ['journal'], JSON.stringify(bad))
    assert.equal(data.journal, undefined)
    assert.deepEqual(data.work, site().work, 'work still loads')
  }
})

test('a work section with an item that has no id, or a field of the wrong kind, is broken', () => {
  for (const items of [[{ title: 'x' }], [{ id: 'a', tags: 'Web' }], [{ id: 'a', thumbImage: 'a.jpg' }], 'none']) {
    const { invalid } = parseSiteData({ ...site(), work: { items } })
    assert.deepEqual(invalid, ['work'], JSON.stringify(items))
  }
})

test('an About body that is not a document is broken; one with no English yet is not', () => {
  assert.deepEqual(parseSiteData({ aboutPage: { zh: 'text', en: doc('About') } }).invalid, ['aboutPage'])
  const { data, invalid } = parseSiteData({ aboutPage: { zh: doc('關於') } })
  assert.deepEqual(invalid, [])
  assert.deepEqual(data.aboutPage?.zh, doc('關於'))
})

test('case pictures that are not objects make the cases section broken', () => {
  assert.deepEqual(parseSiteData({ cases: { monolab: 'x' } }).invalid, ['cases'])
  assert.deepEqual(parseSiteData({ cases: { monolab: { hero: { image: { url: 3 } } } } }).invalid, ['cases'])
})
