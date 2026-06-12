import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import TekueiHero from './components/TekueiHero.jsx'
import AboutPage from './components/AboutPage.jsx'
import WorkListPage from './components/WorkListPage.jsx'
import JournalListPage from './components/JournalListPage.jsx'
import JournalPostPage from './components/JournalPostPage.jsx'
import CaseRouter from './components/CaseRouter.jsx'
import { PaperSiteBackground } from './components/PaperSiteBackground.jsx'

function ScrollClasses() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.documentElement.classList.add('tekuei-has-scroll-document')
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollClasses />
      <PaperSiteBackground />
      <Routes>
        <Route path="/" element={<TekueiHero />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/work" element={<WorkListPage />} />
        <Route path="/journal" element={<JournalListPage />} />
        <Route path="/journal/:slug" element={<JournalPostPage />} />
        <Route path="/cases/:slug" element={<CaseRouter />} />
      </Routes>
    </BrowserRouter>
  )
}
