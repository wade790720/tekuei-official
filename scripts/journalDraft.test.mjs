import assert from 'node:assert/strict'
import { it } from 'node:test'
import { cloneJournal, copyJournalDraft, getDefaultJournal } from '../src/data/journal.js'

it('copyJournalDraft: edits on the copy leave the saved journal alone, bodies are shared', () => {
  const saved = cloneJournal(getDefaultJournal())
  const before = JSON.stringify(saved)
  const draft = copyJournalDraft(saved)
  const slug = draft.posts.zh[0].slug

  draft.posts.zh[0].title = 'changed'
  draft.posts.zh.unshift({ slug: 'new' })
  draft.content.zh[slug] = { doc: { type: 'doc', content: [] } }
  delete draft.content.en?.[slug]

  assert.equal(JSON.stringify(saved), before)
  const other = Object.keys(saved.content.zh).find((s) => s !== slug)
  if (other) assert.equal(draft.content.zh[other], saved.content.zh[other])
})
