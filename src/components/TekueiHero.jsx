import '../styles/tekueiHero.css'
import { CustomCursor } from './CustomCursor.jsx'
import { DiagonalGrid } from './DiagonalGrid.jsx'
import { InkTrailCanvas } from './InkTrailCanvas.jsx'

export default function TekueiHero() {
  return (
    <div className="tekuei-hero-root">
      <CustomCursor />
      <InkTrailCanvas />
      <DiagonalGrid />

      <div className="ui">
        <nav>
          <div className="logo">T E K U E I</div>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#work">Work</a>
            <a href="#journal">Journal</a>
            <a href="#contact">Contact</a>
          </div>
        </nav>
        <div className="vl" aria-hidden />
        <div className="year">EST. 2026</div>
        <div className="content">
          <div className="h-pre">得 跪 · TEKUEI</div>
          <div className="h-name">TEKUEI</div>
          <div className="h-kanji">德 溎</div>
          <div className="h-div" aria-hidden />
          <div className="h-belief">過程是你存在過的唯一證明</div>
          <div className="h-mission">
            為創作者建構美學語言，
            <br />
            讓每一束光照到它該照的地方
          </div>
        </div>
        <div className="scroll-hint">
          <div className="scroll-hint-line" />
          <span>S C R O L L</span>
        </div>
      </div>
    </div>
  )
}
