import { cloneAboutContent, DEFAULT_ABOUT_CONTENT } from '../data/about.js'
import { cloneSiteData, downloadSiteJson } from '../lib/siteData.js'
import { useCmsSection } from './useCmsSection.js'

export function useAboutContent() {
  return useCmsSection('about', () => DEFAULT_ABOUT_CONTENT, cloneAboutContent)
}

export function downloadDataJson(siteData, aboutContent, filename = 'data.json') {
  downloadSiteJson(siteData, { about: cloneAboutContent(aboutContent) }, filename)
}
