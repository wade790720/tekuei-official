/**
 * react-phone-input-2 的 value 為國碼+號碼數字（無 +）
 * → E.164：+886912869565
 */
export function digitsToE164(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''
  return `+${digits}`
}

/** 例：+886912869565 */
export function isValidE164(phone) {
  return /^\+[1-9]\d{7,14}$/.test(phone)
}
