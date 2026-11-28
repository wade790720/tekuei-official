import assert from 'node:assert/strict'
import { it } from 'node:test'
import { RouterContextProvider } from 'react-router'
import { cloneJournal } from '../src/data/journal.ts'
import { siteDefaults } from '../src/data/siteDefaults.ts'
import { cf, readSite } from '../src/lib/cf.server.ts'
import { hasEnglish, langOf, localePath, otherLangPath, samePage, stripLang } from '../src/lib/localePath.ts'
import { journalList, journalPost, projectList, projectPage } from '../src/lib/pageData.ts'
import { LANGS } from '../src/lib/siteData.ts'
import type { SiteData, WorkData } from '../src/lib/siteData.ts'
import { fakeR2 } from './fakeR2.ts'
import { sampleJournal } from './fixtures/journal.ts'

const doc = (text: string) => ({ doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] } })

// The middle post is a draft, in both languages.
function site(): SiteData {
  const journal = cloneJournal(sampleJournal())
  const draft = journal.posts.zh[1].slug
  for (const l of LANGS) journal.posts[l] = journal.posts[l].map((p) => (p.slug === draft ? { ...p, draft: true } : p))
  const work: WorkData = {
    items: [
      { id: 'live', title: 'Live project' },
      { id: 'secret', title: 'Secret project', draft: true },
      { id: 'card-only', title: 'Card only', link: 'https://example.com' },
    ],
    content: { zh: { live: doc('live body'), secret: doc('secret body') }, en: {} },
  }
  return { journal, work }
}

it('the Journal list sends every published post and no draft, without bodies', () => {
  const s = site()
  const draft = s.journal?.posts.zh.find((p) => p.draft)?.slug
  const list = journalList(s)
  for (const l of LANGS) assert.ok(!list.posts[l].some((p) => p.slug === draft))
  assert.equal(list.posts.zh.length, (s.journal?.posts.zh.length ?? 0) - 1)
  assert.deepEqual(list.content, { zh: {}, en: {} })
  assert.ok(!JSON.stringify(list).includes(String(draft)))
})

it('a post page sends its body and the neighbours next to it, never a draft', () => {
  const s = site()
  const posts = s.journal?.posts.zh ?? []
  const draft = posts.find((p) => p.draft)?.slug ?? ''
  assert.equal(journalPost(s, draft), null)
  assert.equal(journalPost(s, 'no-such-post'), null)

  const first = posts[0].slug
  const page = journalPost(s, first)
  assert.ok(page)
  assert.deepEqual(Object.keys(page.content.zh), [first])
  // The draft between the first and third post is skipped, so the third is the first post's neighbour.
  assert.deepEqual(page.posts.zh.map((p) => p.slug), [first, posts[2].slug])
  assert.ok(!JSON.stringify(page).includes(draft))
})

it('a draft project sends no body; the list points each card where it goes', () => {
  const s = site()
  const secret = projectPage(s, 'secret', false)
  assert.equal(secret.found, false)
  assert.ok(!JSON.stringify(secret).includes('secret body'))
  assert.ok(!secret.work.items.some((i) => i.id === 'secret'))

  const live = projectPage(s, 'live', false)
  assert.equal(live.found, true)
  assert.deepEqual(Object.keys(live.work.content?.zh ?? {}), ['live'])

  const list = projectList(s)
  assert.equal(list.content, undefined)
  assert.equal(list.items.find((i) => i.id === 'live')?.caseHref, '/projects/live')
  assert.equal(list.items.find((i) => i.id === 'card-only')?.caseHref, 'https://example.com')
  assert.ok(!list.items.some((i) => i.id === 'secret'))
})

const contextWith = (bucket: ReturnType<typeof fakeR2>) => {
  const context = new RouterContextProvider()
  context.set(cf, { env: { BUCKET: bucket }, ctx: { waitUntil() {} } })
  return context
}
const statusOf = async (p: Promise<unknown>) => {
  try {
    await p
    return 200
  } catch (err) {
    const init = typeof err === 'object' && err !== null && 'init' in err ? err.init : null
    return typeof init === 'object' && init !== null && 'status' in init ? init.status : 'not a response'
  }
}

it('readSite: the bundled defaults with no data.json, a 503 when R2 cannot be read', async () => {
  assert.equal(await readSite(contextWith(fakeR2()), ['journal']), siteDefaults)
  assert.equal(await statusOf(readSite(contextWith(fakeR2({ 'data.json': site() })), ['journal'])), 200)

  const broken = fakeR2()
  await broken.put('data.json', '{"journal": ')
  assert.equal(await statusOf(readSite(contextWith(broken), ['journal'])), 503)

  // A malformed section fails only the pages that read it.
  const bad = fakeR2({ 'data.json': { ...site(), journal: { posts: 'nope' } } })
  assert.equal(await statusOf(readSite(contextWith(bad), ['journal'])), 503)
  assert.equal(await statusOf(readSite(contextWith(bad), ['work'])), 200)
})

it('localePath: English under /en, one-URL pages and outside links unchanged', () => {
  assert.equal(localePath('/', 'en'), '/en')
  assert.equal(localePath('/journal/abc', 'en'), '/en/journal/abc')
  assert.equal(localePath('/en/journal', 'zh'), '/journal')
  assert.equal(localePath('/en/journal', 'en'), '/en/journal')
  assert.equal(localePath('/checkin', 'en'), '/checkin')
  assert.equal(localePath('/labs/living-portrait/live', 'en'), '/labs/living-portrait/live')
  assert.equal(localePath('/sitemap.xml', 'en'), '/sitemap.xml')
  assert.equal(localePath('mailto:a@b.c', 'en'), 'mailto:a@b.c')
  assert.equal(localePath('https://example.com/x', 'en'), 'https://example.com/x')
  assert.equal(localePath('//example.com/x', 'en'), '//example.com/x')
  assert.equal(localePath('/en//evil.com', 'zh'), '/evil.com')
  assert.equal(localePath('/en//evil.com', 'en'), '/en/evil.com')

  assert.equal(langOf('/en'), 'en')
  assert.equal(langOf('/enough'), 'zh')
  assert.equal(stripLang('/en'), '/')
  assert.equal(stripLang('/en/about'), '/about')
  assert.equal(hasEnglish('/labs/x/live'), false)
  assert.equal(otherLangPath('/about'), '/en/about')
  assert.equal(otherLangPath('/en'), '/')
  assert.equal(otherLangPath('/checkin'), null)
  assert.ok(samePage('/journal', '/en/journal'))
  assert.ok(!samePage('/journal', '/en/journal/abc'))
})
