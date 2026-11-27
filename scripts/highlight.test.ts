import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { tokenize } from '../src/lib/highlight.ts'

// Spaces join the neighbouring plain token, so compare trimmed text.
const types = (src: string, lang?: string) =>
  tokenize(src, lang)
    .filter((t) => t.text.trim())
    .map((t) => `${t.type}:${t.text.trim()}`)

describe('tokenize', () => {
  it('gives back the source exactly', () => {
    const src = 'const result = streamText({\n  model: "a/b",\n  stopWhen: isStepCount(15), // stop\n})\n'
    assert.equal(tokenize(src).map((t) => t.text).join(''), src)
  })

  it('marks keywords, calls, properties, strings, numbers and comments', () => {
    assert.deepEqual(types('const x = f({ model: "m", n: 15 }) // c'), [
      'keyword:const',
      'plain:x',
      'punct:=',
      'fn:f',
      'punct:({',
      'prop:model',
      'punct::',
      'string:"m"',
      'punct:,',
      'prop:n',
      'punct::',
      'number:15',
      'punct:})',
      'comment:// c',
    ])
  })

  it('treats => as a keyword and keeps a - b apart', () => {
    assert.deepEqual(types('(a) => a - b'), ['punct:(', 'plain:a', 'punct:)', 'keyword:=>', 'plain:a', 'punct:-', 'plain:b'])
  })

  it('leaves plain text unhighlighted', () => {
    assert.deepEqual(tokenize('const x // y', 'text'), [{ type: 'plain', text: 'const x // y' }])
  })

  it('uses # comments only for shell-like languages', () => {
    assert.deepEqual(types('# hi', 'bash'), ['comment:# hi'])
    assert.equal(types('#x', 'ts')[0], 'punct:#')
  })
})
