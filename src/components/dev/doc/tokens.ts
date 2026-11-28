/** The raw value of a CSS custom property on :root, e.g. rootVar('--type-body') → '17px'. */
export const rootVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
