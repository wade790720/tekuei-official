import assert from 'node:assert/strict'
import { test } from 'node:test'
import { localizeWork, projectLink, publishedWork, withCodeProjects } from '../src/lib/projectHref.ts'
import type { CodeProject } from '../src/lib/projectHref.ts'
import type { WorkData } from '../src/lib/siteData.ts'
import { docOf, nodeAt } from './testDoc.ts'

const CODE: CodeProject[] = [{ id: 'sre', title: 'SRE', link: 'https://example.com/', page: { zh: '中文', en: 'English' } }]
const saved = (): WorkData => ({ items: [{ id: 'matsu', title: 'Biennial', titleEmWord: 'Matsu', caseHref: '/cases/matsu' }] })

test('a project that began as code joins the list once, with its page, and stays deleted when Wade deletes it', () => {
  const once = withCodeProjects(saved(), CODE)
  assert.deepEqual(once.items.map((i) => i.id), ['matsu', 'sre'])
  assert.equal('page' in once.items[1], false, 'the page is not a field of the project')
  assert.equal(nodeAt(docOf(once.content?.zh?.sre), 0, 0).text, '中文')
  assert.deepEqual(withCodeProjects(once, CODE), once, 'loading again adds nothing')

  const edited = structuredClone(once)
  assert.ok(edited.content?.zh)
  edited.content.zh.sre = { doc: { type: 'doc', content: [] } }
  assert.deepEqual(withCodeProjects(edited, CODE).content?.zh?.sre, edited.content.zh.sre, 'a page Wade wrote is kept')

  const noPage = { items: [...saved().items, { id: 'sre', title: 'SRE Official' }] }
  const filled = withCodeProjects(noPage, CODE)
  assert.equal(filled.items[1].title, 'SRE Official', 'the saved project is not replaced')
  assert.ok(filled.content?.zh?.sre, 'a saved project with no page gets the starting page')

  assert.deepEqual(withCodeProjects({ ...saved(), removed: ['sre'] }, CODE).items.map((i) => i.id), ['matsu'])
})

test('the English list uses the project English first, then the bundled one, then the Chinese', () => {
  const work: WorkData = {
    items: [
      { id: 'a', title: '甲', client: '客戶' },
      { id: 'b', title: '乙', client: '乙方', en: { title: 'B', client: '' } },
      { id: 'matsu', title: 'Biennial', titleEmWord: 'Matsu' },
    ],
  }
  const en = localizeWork(work, 'en', { matsu: { title: 'Biennial', titleEmWord: 'Matsu', client: 'Matsu Biennial' } })
  assert.equal(en.items[0].title, '甲')
  assert.equal(en.items[1].title, 'B')
  assert.equal(en.items[1].client, '乙方', 'an empty English field falls back, it does not blank the card')
  assert.equal(en.items[2].client, 'Matsu Biennial')
  assert.equal(localizeWork(work, 'zh'), work)
})

test('readers never get a draft, and a card links to the page when there is one', () => {
  const work: WorkData = {
    items: [{ id: 'a', draft: true }, { id: 'b', link: 'https://b.example/' }, { id: 'c', link: 'https://c.example/' }],
    content: { zh: { c: { doc: {} } } },
  }
  assert.deepEqual(publishedWork(work).items.map((i) => i.id), ['b', 'c'])
  assert.equal(projectLink(work.items[1], work), 'https://b.example/')
  assert.equal(projectLink(work.items[2], work), '/projects/c')
})
