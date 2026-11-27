import { randomInt } from 'node:crypto'

const digits = (n: number) => String(n % 1_000_000).padStart(6, '0')

/** A random admin code for one test run, and `wrong(i)`: codes that are never that code. */
export function testCodes() {
  const n = randomInt(1_000_000)
  return { right: digits(n), wrong: (i = 1) => digits(n + i) }
}
