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

test('a stylesheet that breaks a design rule is caught, and a token or a step of the scale is not', async () => {
  const { designIn } = await import('./noSlop.mjs')
  const rules = (css, file) => designIn(css, file).map((d) => d.rule)
  assert.deepEqual(rules('.a { color: #c99a63; }', 'src/styles/a.css'), ['色碼'])
  assert.deepEqual(rules('.a { font-weight: 700; }'), ['字重'])
  assert.deepEqual(rules('.a { margin: 20px 0; }'), ['間距'])
  assert.deepEqual(rules('.a {\n  gap: 8px;\n  padding: 6px 12px;\n}').length, 1)
  assert.equal(designIn('.a {\n  gap: 8px;\n  padding: 6px 12px;\n}')[0].line, 3)
  assert.deepEqual(rules(':root { --ember: #c99a63; }', 'src/styles/tokens.css'), [], 'tokens.css is where colours are defined')
  assert.deepEqual(rules('.a { color: var(--ember); margin: var(--gap-block) 0; padding: 0 8px; font-weight: 400; }'), [])
  assert.deepEqual(rules('/* was #fff and 20px */ .a { inset: -4px -2px; width: 20px; }'), [], 'comments and sizes are not spacing')
})

test('a file may keep the breaks it had, and not one more', async () => {
  const { designProblems } = await import('./noSlop.mjs')
  const { mkdtempSync, writeFileSync } = await import('node:fs')
  const { join } = await import('node:path')
  const { tmpdir } = await import('node:os')
  const file = join(mkdtempSync(join(tmpdir(), 'design-')), 'a.css')
  writeFileSync(file, '.a { margin: 20px; }\n.b { margin: 40px; }\n')
  const key = file.split(/[\\/]/).join('/')
  assert.deepEqual(designProblems(file, { [key]: { 間距: 2 } }), [])
  assert.equal(designProblems(file, { [key]: { 間距: 1 } }).length, 2, 'one more than before: every break in the file is listed')
  assert.equal(designProblems(file, {}).length, 2)
})
