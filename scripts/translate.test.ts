import { test } from 'node:test'
import assert from 'node:assert/strict'
import { onRequestPost } from '../functions/api/translate.ts'
import { batchTexts, docSlots } from '../src/lib/docTranslate.ts'
import { fakeR2 } from './fakeR2.ts'
import { testCodes } from './testCodes.ts'

const { right: CODE, wrong } = testCodes()
import { nodeAt } from './testDoc.ts'
import type { Env } from '../functions/env.d.ts'

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
  assert.deepEqual(nodeAt(out, 0).content, [
    { type: 'text', text: 'I write ' },
    { type: 'text', text: 'code', marks: [{ type: 'link', attrs: { href: 'https://a.b' } }] },
    { type: 'hardBreak' },
    { type: 'text', text: 'when a < b' },
  ])
  assert.equal(nodeAt(out, 1, 0).text, '// 中文註解')
  assert.equal(nodeAt(out, 2).attrs?.src, 'x.webp')
  assert.equal(nodeAt(out, 2).attrs?.alt, 'Waves')
  assert.equal(nodeAt(out, 3).attrs?.slides[0].caption, 'Second')
  assert.deepEqual(doc, before)
})

test('a stray tag from the model never reaches the page', () => {
  const { doc: out, slots } = docSlots(doc)
  slots[0].set('I write <t1>code')
  assert.equal(nodeAt(out, 0, 0).text, 'I write code')
})

test('batches keep order and respect the limit', () => {
  assert.deepEqual(batchTexts(['aaa', 'bb', 'cccc', 'd'], 5), [['aaa', 'bb'], ['cccc', 'd']])
  assert.deepEqual(batchTexts(['a', 'b', 'c'], 5, 2), [['a', 'b'], ['c']])
  assert.ok(batchTexts(Array(900).fill('短')).every((b) => b.length <= 300))
})

type ModelInput = Record<string, unknown>
const message = (input: ModelInput, i: number): string => {
  const messages = input.messages
  assert.ok(Array.isArray(messages))
  const content: unknown = messages[i]?.content
  assert.ok(typeof content === 'string')
  return content
}

const env = (replies: unknown, extra: Partial<Env> = {}) => {
  const calls: { model: string; input: ModelInput }[] = []
  const queue = Array.isArray(replies) ? [...replies] : null
  const run = async (model: string, input: ModelInput) => {
    calls.push({ model, input })
    const reply = queue ? queue.shift() : replies
    if (reply instanceof Error) throw reply
    return reply
  }
  return { ADMIN_SECRET: CODE, BUCKET: fakeR2({}), AI: { run }, calls, ...extra }
}
const post = (e: Env, body: unknown, code = CODE) =>
  onRequestPost({
    request: new Request('https://x/api/translate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${code}` },
      body: JSON.stringify(body),
    }),
    env: e,
  })
const answer = (content: string, finish_reason = 'stop') => ({ choices: [{ finish_reason, message: { content } }] })
const pair = '<s1>World</s1>\n<s0>Hello</s0>'
const texts = ['你好', '世界']

test('the API needs the admin code and never calls the model without it', async () => {
  const e = env(answer(pair))
  assert.equal((await post(e, { texts: ['你好'] }, wrong())).status, 401)
  assert.equal(e.calls.length, 0)
})

test('a missing Workers AI binding is reported', async () => {
  assert.equal((await post(env(answer(pair), { AI: undefined }), { texts: ['你好'] })).status, 503)
})

test('translations come back in input order, with low reasoning to save the free quota', async () => {
  const e = env(answer(pair))
  const res = await post(e, { texts })
  assert.deepEqual(await res.json(), { texts: ['Hello', 'World'] })
  assert.equal(e.calls.length, 1)
  assert.equal(e.calls[0].model, '@cf/qwen/qwen3.8-27b')
  assert.equal(e.calls[0].input.reasoning_effort, 'low')
  assert.equal(message(e.calls[0].input, 1), '<s0>你好</s0>\n<s1>世界</s1>')
})

test('quotation marks and marks inside a translation survive', async () => {
  const res = await post(env(answer('<s0>He said "no" to <t1>this</t1></s0>')), { texts: ['他說不'] })
  assert.deepEqual(await res.json(), { texts: ['He said "no" to <t1>this</t1>'] })
})

test('items the model skipped are asked for again, alone', async () => {
  const e = env([answer('<s0>Hello</s0>'), answer('<s1>World</s1>')])
  const res = await post(e, { texts })
  assert.deepEqual(await res.json(), { texts: ['Hello', 'World'] })
  assert.equal(e.calls.length, 2)
  assert.equal(message(e.calls[1].input, 1), '<s1>世界</s1>')
})

test('a reply cut off mid-item keeps the finished items and retries the rest', async () => {
  const e = env([answer('<s0>Hello</s0>\n<s1>Wor', 'length'), answer('<s1>World</s1>')])
  assert.deepEqual(await (await post(e, { texts })).json(), { texts: ['Hello', 'World'] })
})

test('still incomplete after the retry is an error that says how much came back', async () => {
  const e = env(answer('<s0>Hello</s0>'))
  const original = console.error
  console.error = () => {}
  const res = await post(e, { texts })
  console.error = original
  assert.equal(res.status, 502)
  assert.match((await res.json()).error, /1\/2/)
  assert.equal(e.calls.length, 2)
})

test('an id the input does not have is ignored', async () => {
  const res = await post(env(answer('<s0>Hello</s0><s9>Extra</s9>')), { texts: ['你好'] })
  assert.deepEqual(await res.json(), { texts: ['Hello'] })
})

test('a used-up daily quota says so', async () => {
  const res = await post(env(new Error('4006: you have used up your daily free allocation')), { texts: ['你好'] })
  assert.equal(res.status, 429)
})

test('the prompt fixes his name and the company names, and keeps the brand separate', async () => {
  const e = env(answer('<s0>Hello</s0>'))
  await post(e, { texts: ['你好'] })
  const system = message(e.calls[0].input, 0)
  for (const rule of ['朱德溎 (his full name): Te-Kuei Chu', '澔學: iSchool', '雲訊科技: Cloras', 'more than ten', 'Never merge']) {
    assert.ok(system.includes(rule), rule)
  }
  assert.ok(!system.includes('德溎 is written TEKUEI'))
})
