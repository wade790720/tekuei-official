import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/tokens.css'
import App from './App.tsx'
import { LangProvider } from './i18n'

// index.html carries a title and description for crawlers (src/lib/seo.ts fills them per page). Each page renders
// its own with React, which adds new elements rather than reusing these. Keep the shipped ones until the first page
// title arrives, so the tab never shows the bare URL while the route loads, then drop them to keep one of each.
const shipped = document.head.querySelectorAll('title, meta[name="description"]')
new MutationObserver((_, observer) => {
  if (document.head.querySelectorAll('title').length < 2) return
  for (const el of shipped) el.remove()
  observer.disconnect()
}).observe(document.head, { childList: true })

const root = document.getElementById('root')
if (!root) throw new Error('index.html has no #root')
createRoot(root).render(
  <StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </StrictMode>,
)
