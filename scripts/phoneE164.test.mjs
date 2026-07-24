import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  digitsToE164,
  isValidE164,
  validateCheckinPhone,
} from '../src/lib/phoneE164.js'

/**
 * input = react-phone-input-2 風格（國碼 + 本地號碼，可能含 trunk 0）
 * expected = 標準 E.164
 */
const CASES = [
  // —— 亞洲（≥5）：含馬來西亞、新加坡 ——
  {
    region: 'asia',
    name: 'Taiwan',
    country: { dialCode: '886', countryCode: 'tw' },
    input: '8860912869565',
    expected: '+886912869565',
  },
  {
    region: 'asia',
    name: 'Japan',
    country: { dialCode: '81', countryCode: 'jp' },
    input: '8109012345678',
    expected: '+819012345678',
  },
  {
    region: 'asia',
    name: 'Malaysia',
    country: { dialCode: '60', countryCode: 'my' },
    input: '600123456789',
    expected: '+60123456789',
  },
  {
    region: 'asia',
    name: 'Singapore',
    country: { dialCode: '65', countryCode: 'sg' },
    input: '6581234567',
    expected: '+6581234567',
  },
  {
    region: 'asia',
    name: 'Hong Kong',
    country: { dialCode: '852', countryCode: 'hk' },
    input: '85291234567',
    expected: '+85291234567',
  },
  {
    region: 'asia',
    name: 'South Korea',
    country: { dialCode: '82', countryCode: 'kr' },
    input: '8201012345678',
    expected: '+821012345678',
  },
  {
    region: 'asia',
    name: 'China',
    country: { dialCode: '86', countryCode: 'cn' },
    input: '8613800138000',
    expected: '+8613800138000',
  },
  {
    region: 'asia',
    name: 'Thailand',
    country: { dialCode: '66', countryCode: 'th' },
    input: '660812345678',
    expected: '+66812345678',
  },
  {
    region: 'asia',
    name: 'Philippines',
    country: { dialCode: '63', countryCode: 'ph' },
    input: '6309171234567',
    expected: '+639171234567',
  },
  {
    region: 'asia',
    name: 'Indonesia',
    country: { dialCode: '62', countryCode: 'id' },
    input: '62081234567890',
    expected: '+6281234567890',
  },
  // —— 其他地區 ——
  {
    region: 'other',
    name: 'United States',
    country: { dialCode: '1', countryCode: 'us' },
    input: '14155552671',
    expected: '+14155552671',
  },
  {
    region: 'other',
    name: 'United Kingdom',
    country: { dialCode: '44', countryCode: 'gb' },
    input: '4407911123456',
    expected: '+447911123456',
  },
  {
    region: 'other',
    name: 'Australia',
    country: { dialCode: '61', countryCode: 'au' },
    input: '610412345678',
    expected: '+61412345678',
  },
  {
    region: 'other',
    name: 'Germany',
    country: { dialCode: '49', countryCode: 'de' },
    input: '4915112345678',
    expected: '+4915112345678',
  },
]

/** 有 trunk 0 習性的國家：含 0 / 不含 0 應得到同一 E.164 */
const TRUNK_ZERO_PAIRS = [
  {
    name: 'Taiwan 0912…',
    country: { dialCode: '886', countryCode: 'tw' },
    withZero: '8860912869565',
    withoutZero: '886912869565',
    expected: '+886912869565',
  },
  {
    name: 'Japan 090…',
    country: { dialCode: '81', countryCode: 'jp' },
    withZero: '8109012345678',
    withoutZero: '819012345678',
    expected: '+819012345678',
  },
  {
    name: 'Malaysia 012…',
    country: { dialCode: '60', countryCode: 'my' },
    withZero: '600123456789',
    withoutZero: '60123456789',
    expected: '+60123456789',
  },
  {
    name: 'Korea 010…',
    country: { dialCode: '82', countryCode: 'kr' },
    withZero: '8201012345678',
    withoutZero: '821012345678',
    expected: '+821012345678',
  },
  {
    name: 'Thailand 08…',
    country: { dialCode: '66', countryCode: 'th' },
    withZero: '660812345678',
    withoutZero: '66812345678',
    expected: '+66812345678',
  },
  {
    name: 'Philippines 09…',
    country: { dialCode: '63', countryCode: 'ph' },
    withZero: '6309171234567',
    withoutZero: '639171234567',
    expected: '+639171234567',
  },
  {
    name: 'Indonesia 08…',
    country: { dialCode: '62', countryCode: 'id' },
    withZero: '62081234567890',
    withoutZero: '6281234567890',
    expected: '+6281234567890',
  },
  {
    name: 'UK 07…',
    country: { dialCode: '44', countryCode: 'gb' },
    withZero: '4407911123456',
    withoutZero: '447911123456',
    expected: '+447911123456',
  },
  {
    name: 'Australia 04…',
    country: { dialCode: '61', countryCode: 'au' },
    withZero: '610412345678',
    withoutZero: '61412345678',
    expected: '+61412345678',
  },
]

const INVALID_CASES = [
  {
    name: 'empty',
    input: '',
    country: { dialCode: '886', countryCode: 'tw' },
    reason: 'empty',
  },
  {
    name: 'too short TW',
    input: '8860912',
    country: { dialCode: '886', countryCode: 'tw' },
    reason: 'invalid',
  },
  {
    name: 'garbage letters stripped then invalid',
    input: '886abcdefgh',
    country: { dialCode: '886', countryCode: 'tw' },
    reason: 'invalid',
  },
  {
    name: 'only country code',
    input: '886',
    country: { dialCode: '886', countryCode: 'tw' },
    reason: 'invalid',
  },
  {
    name: 'random digits',
    input: '886111',
    country: { dialCode: '886', countryCode: 'tw' },
    reason: 'invalid',
  },
  {
    name: 'obviously fake repeating digits',
    input: '8860000000000',
    country: { dialCode: '886', countryCode: 'tw' },
    reason: 'invalid',
  },
]

describe('digitsToE164 coverage', () => {
  it('covers at least 10 countries', () => {
    assert.ok(CASES.length >= 10, `expected ≥10 cases, got ${CASES.length}`)
  })

  it('covers at least 5 Asian countries including MY and SG', () => {
    const asia = CASES.filter((c) => c.region === 'asia')
    assert.ok(asia.length >= 5, `expected ≥5 asia cases, got ${asia.length}`)
    assert.ok(asia.some((c) => c.country.countryCode === 'my'), 'missing Malaysia')
    assert.ok(asia.some((c) => c.country.countryCode === 'sg'), 'missing Singapore')
  })
})

describe('digitsToE164 by country', () => {
  for (const c of CASES) {
    it(`${c.name} (${c.country.countryCode}) ${c.input} → ${c.expected}`, () => {
      const got = digitsToE164(c.input, c.country)
      assert.equal(got, c.expected)
      assert.equal(isValidE164(got), true)
      assert.equal(validateCheckinPhone(c.input, c.country).ok, true)
    })
  }
})

describe('trunk leading-0 habits (with vs without 0 → same E.164)', () => {
  it('covers multiple trunk-0 countries', () => {
    assert.ok(TRUNK_ZERO_PAIRS.length >= 8)
  })

  for (const c of TRUNK_ZERO_PAIRS) {
    it(`${c.name}: with0 and without0 both → ${c.expected}`, () => {
      const a = digitsToE164(c.withZero, c.country)
      const b = digitsToE164(c.withoutZero, c.country)
      assert.equal(a, c.expected)
      assert.equal(b, c.expected)
      assert.equal(a, b)
    })
  }
})

describe('validateCheckinPhone rejects garbage', () => {
  for (const c of INVALID_CASES) {
    it(`${c.name}`, () => {
      const result = validateCheckinPhone(c.input, c.country)
      assert.equal(result.ok, false)
      assert.equal(result.reason, c.reason)
    })
  }
})
