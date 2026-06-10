import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import TekueiHero from './components/TekueiHero.jsx'
import WorkListPage from './components/WorkListPage.jsx'
import CaseRouter from './components/CaseRouter.jsx'

function ScrollClasses() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.documentElement.classList.toggle(
      'tekuei-has-scroll-document',
      pathname !== '/',
    )
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollClasses />
      <Routes>
        <Route path="/" element={<TekueiHero />} />
        <Route path="/work" element={<WorkListPage />} />
        <Route path="/cases/:slug" element={<CaseRouter />} />
      </Routes>
    </BrowserRouter>
  )
}
