import siteDefaults from './data.json'

/** @typedef {typeof siteDefaults.about} AboutContent */

export const DEFAULT_ABOUT_CONTENT = siteDefaults.about

/** @deprecated 請改用 useAboutContent() 或 DEFAULT_ABOUT_CONTENT */
export const ABOUT_META = siteDefaults.about.meta
export const ABOUT_HERO = siteDefaults.about.hero
export const ABOUT_INTRO = siteDefaults.about.intro
export const ABOUT_FOUNDER = siteDefaults.about.founder
export const ABOUT_APPROACH = siteDefaults.about.approach
export const ABOUT_BELIEFS = siteDefaults.about.beliefs
export const ABOUT_QUOTE = siteDefaults.about.quote
export const ABOUT_SERVICES = siteDefaults.about.services
export const ABOUT_CTA = siteDefaults.about.cta

export function cloneAboutContent(content = siteDefaults.about) {
  return structuredClone(content)
}

export function cloneSiteData(data = siteDefaults) {
  return structuredClone(data)
}