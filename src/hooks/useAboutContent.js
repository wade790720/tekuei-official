import { ABOUT_EN, cloneAboutContent, DEFAULT_ABOUT_CONTENT, mergeAboutImages } from '../data/about.js'
import { cloneSiteData, downloadSiteJson } from '../lib/siteData.js'
import { useLang } from '../i18n'
import { useCmsSection } from './useCmsSection.js'

export function useAboutContent() {
  const { lang } = useLang()
  const result = useCmsSection('about', () => DEFAULT_ABOUT_CONTENT, cloneAboutContent)

  if (lang === 'en') {
    return {
      ...result,
      content: mergeAboutImages(ABOUT_EN, result.content),
      draft: null,
      isEditing: false,
      startEditing: () => {},
    }
  }
  return result
}

export function downloadDataJson(siteData, aboutContent, filename = 'data.json') {
  downloadSiteJson(siteData, { about: cloneAboutContent(aboutContent) }, filename)
}
