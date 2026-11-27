import { test } from 'node:test'
import assert from 'node:assert/strict'
import { clampOffset, parseOffset } from '../src/lib/editBarPosition.ts'

const box = { left: 1100, top: 840, width: 300, height: 40 }
const viewport = { width: 1440, height: 900 }

test('a position on screen stays where it was dropped', () => {
  assert.deepEqual(clampOffset({ x: -400, y: -300 }, box, viewport), { x: -400, y: -300 })
})

test('the toolbar stops 8px from every edge', () => {
  assert.deepEqual(clampOffset({ x: -5000, y: -5000 }, box, viewport), { x: -1092, y: -832 })
  assert.deepEqual(clampOffset({ x: 5000, y: 5000 }, box, viewport), { x: 32, y: 12 })
})

test('a window too small for the toolbar keeps its start edge visible', () => {
  assert.equal(clampOffset({ x: 0, y: 0 }, box, { width: 200, height: 900 }).x, -1092)
})

test('a damaged saved position falls back to the resting place', () => {
  for (const saved of [null, 'nope', '{"x":"1","y":2}', '{}']) assert.deepEqual(parseOffset(saved), { x: 0, y: 0 })
  assert.deepEqual(parseOffset('{"x":-20,"y":-30}'), { x: -20, y: -30 })
})
