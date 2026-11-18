import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/aboutFall.css'
import figureSrc from '../assets/about/fall-figure.png'
import { ABOUT_FALL_ACTS, ABOUT_FALL_INTRO, ABOUT_FALL_META } from '../data/aboutFall.js'
import { mountFallScene } from '../lib/fallScene.js'
import { useLang } from '../i18n'

export default function AboutPage() {
  const { lang } = useLang()
  const meta = ABOUT_FALL_META[lang]
  const intro = ABOUT_FALL_INTRO[lang]
  const acts = ABOUT_FALL_ACTS[lang]
  const canvas = useRef(null)
  const figure = useRef(null)
  const main = useRef(null)
  const dot = useRef(null)
  const scene = useRef(null)
  const [current, setCurrent] = useState(-1)
  const [sound, setSound] = useState(true)

  useEffect(() => {
    document.title = meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
  }, [meta])

  // The scene reads the act sections from the DOM, so it is rebuilt when the language changes.
  useEffect(() => {
    scene.current = mountFallScene({
      canvas: canvas.current,
      figure: figure.current,
      sections: [...main.current.querySelectorAll('[data-act]')],
      acts,
      progressDot: dot.current,
      onAct: setCurrent,
    })
    return () => scene.current.destroy()
  }, [acts])

  const toggleSound = () => {
    scene.current?.setSound(!sound)
    setSound(!sound)
  }

  const shownAct = current >= 0 ? acts[current] : null

  return (
    <div className="about-fall">
      <canvas className="about-fall__canvas" ref={canvas} aria-hidden />
      <img ref={figure} src={figureSrc} alt="" hidden />

      <div className="about-fall__rail" aria-hidden>
        <span>{intro.railStart}</span>
        <i ref={dot} />
        <span>{intro.railEnd}</span>
      </div>

      {/* The slab text is drawn on the canvas, so screen readers get it from the sections below instead. */}
      <div className={`about-fall__caption${shownAct ? ' is-on' : ''}`} aria-hidden>
        {shownAct ? (
          <>
            <p className="about-fall__caption-sub">{shownAct.sub}</p>
            <p className="about-fall__caption-role">{shownAct.role}</p>
            {shownAct.lines.map((line) => (
              <p key={line} className="about-fall__caption-line">
                {line}
              </p>
            ))}
          </>
        ) : null}
      </div>

      <button type="button" className="about-fall__sound" aria-pressed={sound} onClick={toggleSound}>
        {sound ? intro.soundOn : intro.soundOff}
      </button>

      <main className="about-fall__main" ref={main}>
        <section className="about-fall__intro">
          <div>
            <p className="about-fall__label">{intro.label}</p>
            <h1>
              {intro.headline.map((line, i) => (
                <span key={line}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </h1>
            <p>{intro.body}</p>
            <p className="about-fall__hint">{intro.hint} ↓</p>
          </div>
        </section>

        {acts.map((act) => (
          <section key={act.sub} className="about-fall__act" data-act>
            <div className="about-fall__sr">
              <h2>{act.title}</h2>
              <p>{act.sub}</p>
              <p>{act.role}</p>
              {act.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </section>
        ))}
      </main>

      <nav className="about-fall__end" aria-label={lang === 'zh' ? '接下來' : 'Next'}>
        <Link to="/journal">Journal</Link>
        <Link to="/work">Work</Link>
      </nav>
    </div>
  )
}
