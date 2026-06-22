import { DEFAULT_WORK, cloneWorkContent } from '../data/work.js'
import { useCmsSection } from './useCmsSection.js'

export function useWorkContent() {
  return useCmsSection('work', () => DEFAULT_WORK, cloneWorkContent)
}
