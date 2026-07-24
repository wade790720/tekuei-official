import { parsePhoneNumberFromString } from 'libphonenumber-js'

const MOBILE_TYPES = new Set(['MOBILE', 'FIXED_LINE_OR_MOBILE'])

/**
 * 將 react-phone-input-2 的 value（國碼+號碼數字）轉成標準 E.164
 * 例：8860912869565 → +886912869565（去掉 trunk 0）
 *
 * @param {string} value
 * @param {{ dialCode?: string, countryCode?: string } | null} [country]
 */
export function digitsToE164(value, country = null) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''

  const iso = country?.countryCode
    ? String(country.countryCode).toUpperCase()
    : undefined
  const dial = String(country?.dialCode || '').replace(/\D/g, '')

  // 1) 優先用 libphonenumber 依國家解析（會自動去掉 trunk prefix）
  if (iso) {
    let national = digits
    if (dial && digits.startsWith(dial)) {
      national = digits.slice(dial.length)
    }
    const parsedByCountry = parsePhoneNumberFromString(national, iso)
    if (parsedByCountry) {
      return parsedByCountry.format('E.164')
    }
  }

  // 2) 已是 +E.164 可解析
  const parsedPlus = parsePhoneNumberFromString(`+${digits}`)
  if (parsedPlus) {
    return parsedPlus.format('E.164')
  }

  // 3) fallback：手動去掉國碼後的開頭 0（各國 trunk prefix 習性）
  if (dial && digits.startsWith(dial)) {
    const national = digits.slice(dial.length).replace(/^0+/, '')
    if (national) return `+${dial}${national}`
  }

  return `+${digits}`
}

/** 例：+886912869565（僅格式，不保證為有效手機） */
export function isValidE164(phone) {
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) return false
  const parsed = parsePhoneNumberFromString(phone)
  return Boolean(parsed?.isValid())
}

/**
 * 報到用：必須是有效手機（含 FIXED_LINE_OR_MOBILE）
 * @returns {{ ok: boolean, e164: string, reason: 'empty' | 'invalid' | null }}
 */
export function validateCheckinPhone(value, country = null) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) {
    return { ok: false, e164: '', reason: 'empty' }
  }

  const e164 = digitsToE164(value, country)
  const parsed = parsePhoneNumberFromString(e164)
  if (!parsed?.isValid()) {
    return { ok: false, e164, reason: 'invalid' }
  }

  const type = parsed.getType()
  // 部分地區 getType() 可能為 undefined，此時以 isValid 為準
  if (type && !MOBILE_TYPES.has(type)) {
    return { ok: false, e164, reason: 'invalid' }
  }

  return { ok: true, e164, reason: null }
}
