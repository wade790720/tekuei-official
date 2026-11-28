import assert from 'node:assert/strict'
import { it } from 'node:test'
import { cloneJournal, copyJournalDraft, differsOnlyIn, publishedJournal, readableJournal } from '../src/data/journal.ts'
import { sampleJournal, samplePost } from './fixtures/journal.ts'
import { siteJournal, sitemapXml, llmsTxt } from '../src/lib/seo.ts'
import { LANGS } from '../src/lib/siteData.ts'

it('copyJournalDraft: edits on the copy leave the saved journal alone, bodies are shared', () => {
  const saved = cloneJournal(sampleJournal())
  const before = JSON.stringify(saved)
  const draft = copyJournalDraft(saved)
  const slug = draft.posts.zh[0].slug

  draft.posts.zh[0].title = 'changed'
  draft.posts.zh.unshift(samplePost({ slug: 'new' }))
  draft.content.zh[slug] = { doc: { type: 'doc', content: [] } }
  delete draft.content.en?.[slug]

  assert.equal(JSON.stringify(saved), before)
  const other = Object.keys(saved.content.zh).find((s) => s !== slug)
  if (other) assert.equal(draft.content.zh[other], saved.content.zh[other])
})

const withDraft = () => {
  const j = cloneJournal(sampleJournal())
  for (const l of LANGS) j.posts[l][0] = { ...j.posts[l][0], draft: true }
  return j
}

it('a draft is hidden from readers and the rest are renumbered from 01', () => {
  const j = withDraft()
  const slug = j.posts.zh[0].slug
  for (const lang of LANGS) {
    const posts = readableJournal(j).posts[lang]
    assert.ok(!posts.some((p) => p.slug === slug), lang)
    assert.equal(posts[0].num, '01')
  }
  assert.equal(publishedJournal(j).content.zh[slug], undefined)
  assert.ok(j.posts.zh.some((p) => p.slug === slug), 'the stored journal keeps the draft for the editor')
})

it('a draft is not in the sitemap or llms.txt', () => {
  const j = withDraft()
  const slug = j.posts.zh[0].slug
  const site = siteJournal({ journal: j })
  assert.ok(!sitemapXml(site, [], true).includes(`/journal/${slug}<`))
  assert.ok(!llmsTxt(site, [], [], false).includes(`/journal/${slug})`))
})

it('a journal with no drafts is returned as it is', () => {
  const j = cloneJournal(sampleJournal())
  assert.equal(publishedJournal(j), j)
})

it('a draft autosaves only when nothing outside it changed', () => {
  const saved = cloneJournal(sampleJournal())
  const slug = saved.posts.zh[0].slug
  const edited = cloneJournal(saved)
  edited.posts.zh[0].title = 'new title'
  edited.content.zh[slug] = { doc: { type: 'doc', content: [] } }
  assert.equal(differsOnlyIn(edited, saved, slug), true)

  const created = cloneJournal(saved)
  created.posts.zh.unshift(samplePost({ slug: 'fresh', num: '01', draft: true }))
  created.posts.zh.forEach((p, i) => (p.num = String(i + 1).padStart(2, '0')))
  assert.equal(differsOnlyIn(created, saved, 'fresh'), true, 'renumbering for a new post does not count')

  const alsoDeleted = cloneJournal(edited)
  alsoDeleted.posts.zh.pop()
  assert.equal(differsOnlyIn(alsoDeleted, saved, slug), false)
})
