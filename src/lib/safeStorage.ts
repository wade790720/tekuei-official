type Store = 'local' | 'session'

const area = (store: Store) => (store === 'local' ? localStorage : sessionStorage)

/**
 * Reads a key from browser storage. Null when the key is not there, and also when storage cannot be used:
 * a browser that blocks site data throws on access, and on the server there is no storage at all.
 */
export function readStored(key: string, store: Store = 'local'): string | null {
  try {
    return area(store).getItem(key)
  } catch {
    return null
  }
}

/**
 * Writes a key to browser storage, or removes it when the value is null. Returns false when storage cannot
 * be used or is full; the value then lasts only as long as the page keeps it in memory.
 */
export function writeStored(key: string, value: string | null, store: Store = 'local'): boolean {
  try {
    if (value === null) area(store).removeItem(key)
    else area(store).setItem(key, value)
    return true
  } catch {
    return false
  }
}
