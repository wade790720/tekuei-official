/**
 * About 富文本 · *點睛字* 編輯語法
 */

/** @param {{ t: string, accent?: boolean }[]} parts */
export function partsToEditString(parts) {
  if (!parts?.length) return ''
  return parts
    .map((p) => (p.accent ? `*${p.t}*` : p.t))
    .join('')
}

/** @param {string | { parts: { t: string, accent?: boolean }[] }} line */
export function lineToEditString(line) {
  if (typeof line === 'string') return line
  return partsToEditString(line.parts)
}

/** @param {string} str */
export function editStringToParts(str) {
  if (!str) return [{ t: '' }]
  const parts = []
  const re = /\*([^*]+)\*/g
  let last = 0
  let match
  while ((match = re.exec(str)) !== null) {
    if (match.index > last) {
      parts.push({ t: str.slice(last, match.index) })
    }
    parts.push({ t: match[1], accent: true })
    last = match.index + match[0].length
  }
  if (last < str.length) {
    parts.push({ t: str.slice(last) })
  }
  if (parts.length === 0) parts.push({ t: str })
  return parts
}

/** @param {string} str */
export function editStringToLine(str) {
  if (!str.includes('*')) return str
  return { parts: editStringToParts(str) }
}

/** @param {string | { parts: { t: string, accent?: boolean }[] }} value */
export function richValueToEditString(value) {
  if (typeof value === 'string') return value
  return partsToEditString(value.parts)
}

/** @param {string} str */
export function editStringToRichValue(str) {
  if (!str.includes('*')) return str
  return { parts: editStringToParts(str) }
}
