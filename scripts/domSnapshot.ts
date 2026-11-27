// Run `await import('/scripts/domSnapshot.ts')` in the browser console on a page to record its layout.
// It walks header, main and footer and lists every element with its tag, class, own text and rounded box,
// skipping canvas (it draws something new each time). The JSON lands on window.__dom; import it again after
// a reload or a resize. Compare two snapshots of the same page and width to find what moved.
declare global {
  interface Window {
    __dom: string
  }
}

type Node = { tag: string; cls: string; text: string; box: [number, number, number, number] }

const ownText = (el: Element) =>
  [...el.childNodes]
    .filter((n) => n.nodeType === 3)
    .map((n) => n.textContent ?? '')
    .join('')
    .replace(/\s+/g, ' ')
    .trim()

const walk = (el: Element, out: Node[]) => {
  if (el.tagName === 'CANVAS') return
  const r = el.getBoundingClientRect()
  out.push({
    tag: el.tagName.toLowerCase(),
    cls: el.getAttribute('class') ?? '',
    text: ownText(el),
    box: [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)],
  })
  for (const child of el.children) walk(child, out)
}

const nodes: Node[] = []
for (const el of document.querySelectorAll('header, main, footer')) {
  if (!el.parentElement?.closest('header, main, footer')) walk(el, nodes)
}
window.__dom = JSON.stringify({ url: location.pathname + location.search, width: innerWidth, title: document.title, nodes }, null, 1)
console.log(`domSnapshot: ${nodes.length} elements on window.__dom`)

export {}
