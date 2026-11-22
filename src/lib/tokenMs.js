/** A duration token from tokens.css (e.g. '--duration-exit'), in milliseconds. */
export function tokenMs(name) {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0
}
