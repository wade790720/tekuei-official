import aboutDefaults from './about.json'

/** @typedef {typeof aboutDefaults} AboutContent */

export const DEFAULT_ABOUT_CONTENT = aboutDefaults

/** @deprecated 請改用 useAboutContent() 或 DEFAULT_ABOUT_CONTENT */
export const ABOUT_META = aboutDefaults.meta
export const ABOUT_HERO = aboutDefaults.hero
export const ABOUT_INTRO = aboutDefaults.intro
export const ABOUT_FOUNDER = aboutDefaults.founder
export const ABOUT_APPROACH = aboutDefaults.approach
export const ABOUT_BELIEFS = aboutDefaults.beliefs
export const ABOUT_QUOTE = aboutDefaults.quote
export const ABOUT_SERVICES = aboutDefaults.services
export const ABOUT_CTA = aboutDefaults.cta

export function cloneAboutContent(content = aboutDefaults) {
  return structuredClone(content)
}
