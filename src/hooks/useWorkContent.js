import { cloneWorkContent, DEFAULT_WORK, mergeWorkImages, WORK_EN } from '../data/work.js'
import { useLang } from '../i18n'
import { useCmsSection } from './useCmsSection.js'

export function useWorkContent() {
  const { lang } = useLang()
  const result = useCmsSection('work', () => DEFAULT_WORK, cloneWorkContent)

  if (lang === 'en') {
    return {
      ...result,
      content: mergeWorkImages(WORK_EN, result.content),
      draft: null,
      isEditing: false,
      startEditing: () => {},
    }
  }
  return result
}
