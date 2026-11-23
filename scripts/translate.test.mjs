import { test } from 'node:test'
import assert from 'node:assert/strict'
import { onRequestPost } from '../functions/api/translate.js'
import { batchTexts, docSlots } from '../src/lib/docTranslate.js'
import { fakeR2 } from './fakeR2.mjs'

const doc = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '我寫' },
        { type: 'text', text: '程式', marks: [{ type: 'link', attrs: { href: 'https://a.b' } }] },
        { type: 'hardBreak' },
        { type: 'text', text: 'a < b 的時候' },
      ],
    },
    { type: 'codeBlock', attrs: { language: 'ts' }, content: [{ type: 'text', text: '// 中文註解' }] },
    { type: 'imageCard', attrs: { src: 'x.webp', alt: '海浪', caption: '' } },
    { type: 'slidesCard', attrs: { slides: [{ src: 'y.webp', alt: 'photo', caption: '第二張' }] } },
    { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '清單' }] }] }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'English only' }] },
  ],
}

test('only Chinese text becomes a slot; code and English stay out', () => {
  assert.deepEqual(docSlots(doc).slots.map((s) => s.text), ['我寫<t1>程式</t1><br/>a &lt; b 的時候', '海浪', '第二張', '清單'])
})

test('a translation keeps marks, line breaks, images and code, and leaves the source doc alone', () => {
  const before = structuredClone(doc)
  const { doc: out, slots } = docSlots(doc)
  ;['I write <t1>code</t1><br/>when a &lt; b', 'Waves', 'Second', 'List'].forEach((t, i) => slots[i].set(t))
  assert.deepEqual(out.content[0].content, [
    { type: 'text', text: 'I write ' },
    { type: 'text', text: 'code', marks: [{ type: 'link', attrs: { href: 'https://a.b' } }] },
    { type: 'hardBreak' },
    { type: 'text', text: 'when a < b' },
  ])
  assert.equal(out.content[1].content[0].text, '// 中文註解')
  assert.equal(out.content[2].attrs.src, 'x.webp')
  assert.equal(out.content[2].attrs.alt, 'Waves')
  assert.equal(out.content[3].attrs.slides[0].caption, 'Second')
  assert.deepEqual(doc, before)
})

test('a stray tag from the model never reaches the page', () => {
  const { doc: out, slots } = docSlots(doc)
  slots[0].set('I write <t1>code')
  assert.equal(out.content[0].content[0].text, 'I write code')
})

test('batches keep order and respect the limit', () => {
  assert.deepEqual(batchTexts(['aaa', 'bb', 'cccc', 'd'], 5), [['aaa', 'bb'], ['cccc', 'd']])
})

const env = (reply, extra = {}) => {
  const calls = []
  const run = async (model, input) => {
    calls.push({ model, input })
    if (reply instanceof Error) throw reply
    return reply
  }
  return { ADMIN_SECRET: '123456', BUCKET: fakeR2({}), AI: { run }, calls, ...extra }
}
const post = (e, body, code = '123456') =>
  onRequestPost({
    request: new Request('https://x/api/translate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${code}` },
      body: JSON.stringify(body),
    }),
    env: e,
  })
const answer = (content, finish_reason = 'stop') => ({ choices: [{ finish_reason, message: { content } }] })
const pair = JSON.stringify({ translations: [{ id: 1, text: 'World' }, { id: 0, text: 'Hello' }] })

test('the API needs the admin code and never calls the model without it', async () => {
  const e = env(answer(pair))
  assert.equal((await post(e, { texts: ['你好'] }, '000000')).status, 401)
  assert.equal(e.calls.length, 0)
})

test('a missing Workers AI binding is reported', async () => {
  assert.equal((await post(env(answer(pair), { AI: undefined }), { texts: ['你好'] })).status, 503)
})

test('translations come back in input order, with low reasoning to save the free quota', async () => {
  const e = env(answer(pair))
  const res = await post(e, { texts: ['你好', '世界'] })
  assert.deepEqual(await res.json(), { texts: ['Hello', 'World'] })
  assert.equal(e.calls[0].model, '@cf/qwen/qwen3.8-27b')
  assert.equal(e.calls[0].input.reasoning_effort, 'low')
})

test('JSON wrapped in a code fence still parses', async () => {
  const res = await post(env(answer('```json\n' + pair + '\n```')), { texts: ['你好', '世界'] })
  assert.deepEqual(await res.json(), { texts: ['Hello', 'World'] })
})

test('a partial, cut-off or malformed reply is an error, not a half translation', async () => {
  const partial = JSON.stringify({ translations: [{ id: 0, text: 'Hello' }] })
  for (const reply of [answer(partial), answer(pair, 'length'), answer('sorry')]) {
    assert.equal((await post(env(reply), { texts: ['你好', '世界'] })).status, 502)
  }
})

test('a used-up daily quota says so', async () => {
  const res = await post(env(new Error('4006: you have used up your daily free allocation')), { texts: ['你好'] })
  assert.equal(res.status, 429)
})
