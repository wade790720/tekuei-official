import siteDefaults from '../data/data.json'

export { siteDefaults }

export function cloneSiteData(data = siteDefaults) {
  return structuredClone(data)
}

export function downloadSiteJson(siteData, patch, filename = 'data.json') {
  const payload = cloneSiteData(siteData ?? siteDefaults)
  for (const [key, value] of Object.entries(patch)) {
    payload[key] = structuredClone(value)
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
