import siteDefaults from './data.json'

export const DEFAULT_WORK = siteDefaults.work
export const WORK_ITEMS = siteDefaults.work.items

export function cloneWorkContent(content = siteDefaults.work) {
  return structuredClone(content)
}
