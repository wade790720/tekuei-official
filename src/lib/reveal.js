// Scroll reveal for the whole site: any element with class `fade-in` gets `is-visible`
// once 15% of it is on screen. Offset and timing live in each page's CSS.
// Same pattern as mountClickSounds: App.jsx mounts it once, components only write the class.

const SELECTOR = '.fade-in'

export function mountReveal(root = document.body) {
  const shown = new WeakSet()

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        shown.add(e.target)
        e.target.classList.add('is-visible')
        io.unobserve(e.target)
      }
    },
    { threshold: 0.15 },
  )

  const watch = (node) => {
    if (!(node instanceof Element)) return
    if (node.matches(SELECTOR)) io.observe(node)
    node.querySelectorAll(SELECTOR).forEach((el) => io.observe(el))
  }

  // React adds pages after mount, and rewrites className when a prop changes,
  // which would drop is-visible. Watch for both.
  const mo = new MutationObserver((records) => {
    for (const r of records) {
      const el = r.target
      if (r.type === 'childList') r.addedNodes.forEach(watch)
      // check first: classList.add always writes the attribute, which would loop
      else if (shown.has(el)) {
        if (!el.classList.contains('is-visible')) el.classList.add('is-visible')
      } else if (el.matches(SELECTOR)) io.observe(el)
    }
  })

  watch(root)
  mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })
  return () => {
    io.disconnect()
    mo.disconnect()
  }
}
