import { localePath } from '../lib/localePath.ts'
import { useLang } from './useLang.ts'

/** `(path) => path` in the reader's language: "/journal" stays as it is in Chinese and is "/en/journal" in English. */
export function useLocalePath(): (path: string) => string {
  const { lang } = useLang()
  return (path) => localePath(path, lang)
}
