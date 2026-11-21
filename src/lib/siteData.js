import siteDefaults from '../data/data.json'

export { siteDefaults }

export function cloneSiteData(data = siteDefaults) {
  return structuredClone(data)
}
