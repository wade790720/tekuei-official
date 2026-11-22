import assert from 'node:assert/strict'
import { test } from 'node:test'
import { slopIn } from './noSlop.mjs'

test('flags the patterns', () => {
  assert.equal(slopIn(' ── Schema ── ').length, 1)
  assert.equal(slopIn(' --- Drawing --- ').length, 1)
  assert.equal(slopIn(' picked on 2026-11-20 ').length, 1)
  assert.equal(slopIn(' eslint-disable-next-line react-hooks/exhaustive-deps ').length, 1)
  assert.equal(slopIn(' list — level 3 ').length, 1)
  assert.equal(slopIn(' We leverage the cache ').length, 1)
  assert.deepEqual(slopIn(' see tekueiSiteNav.css '), ['指向不存在的檔案：tekueiSiteNav.css'])
})

test('lets real comments through', () => {
  assert.deepEqual(slopIn(' Canvas cannot read CSS variables: read them with getComputedStyle. '), [])
  assert.deepEqual(slopIn(' as in Notion and Editor.js '), [])
  assert.deepEqual(slopIn(' imported by eslint.config.js and tokens.css '), [])
  assert.deepEqual(slopIn(' Logo: a blinking underscore cursor '), [])
})
