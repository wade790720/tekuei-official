import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import 'lenis/dist/lenis.css'
import './aboutFall.css'
import figureSrc from './carving.png'
import { ABOUT_FALL_ACTS, ABOUT_FALL_INTRO } from './content.ts'
import type { AboutFallAct } from './content.ts'
import { mountFallScene } from './fallScene.ts'
import type { FallScene } from './fallScene.ts'
import { useLang, useLocalePath } from '../../i18n'

/** The About page today, and the Falling Figure lab. */
export function FallingFigure() {
  const { lang } = useLang()
  const localePath = useLocalePath()
  const intro = ABOUT_FALL_INTRO[lang]
  const acts = ABOUT_FALL_ACTS[lang]
  const canvas = useRef<HTMLCanvasElement>(null)
  const figure = useRef<HTMLImageElement>(null)
  const main = useRef<HTMLElement>(null)
  const dot = useRef<HTMLElement>(null)
  const scene = useRef<FallScene | null>(null)
  const [current, setCurrent] = useState(-1)
  const [sound, setSound] = useState(true)

  // The scene reads the act sections from the DOM, so it is rebuilt when the language changes.
  useEffect(() => {
    if (!canvas.current || !figure.current || !main.current) return
    const mounted = mountFallScene({
      canvas: canvas.current,
      figure: figure.current,
      sections: [...main.current.querySelectorAll<HTMLElement>('[data-act]')],
      acts,
      progressDot: dot.current,
      onAct: setCurrent,
    })
    scene.current = mounted
    return () => mounted.destroy()
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

      <div className={`about-fall__caption${shownAct ? ' is-on' : ''}`}>
        {/* key: a new act starts closed */}
        {shownAct ? <ActCaption key={shownAct.sub} act={shownAct} intro={intro} /> : null}
      </div>

      <button type="button" className="about-fall__sound" aria-pressed={sound} onClick={toggleSound}>
        <span className="about-fall__bars" aria-hidden>
          <i />
          <i />
          <i />
        </span>
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
              <ul>
                {act.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              {act.details.map((group) => (
                <div key={group.heading}>
                  <h3>{group.heading}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      <nav className="about-fall__end" aria-label={lang === 'zh' ? '接下來' : 'Next'}>
        <Link to={localePath('/journal')}>Journal</Link>
        <Link to={localePath('/projects')}>Projects</Link>
      </nav>
    </div>
  )
}

/**
 * Corner caption for the act the figure is in: org / role, a few points, and an arrow that opens the full details.
 * The summary is aria-hidden: screen readers read the act sections in <main>. The arrow and details stay reachable.
 */
interface ActCaptionProps {
  act: AboutFallAct
  intro: { more: string; less: string }
}

function ActCaption({ act, intro }: ActCaptionProps) {
  const [open, setOpen] = useState(false)
  const id = `about-act-${act.sub.replace(/\W+/g, '-')}`
  return (
    <>
      <div aria-hidden>
        <p className="about-fall__caption-sub">{act.sub}</p>
        <p className="about-fall__caption-head">
          <span>{act.org ?? act.title}</span>
          <span className="about-fall__caption-slash">/</span>
          <span className="about-fall__caption-role">{act.role}</span>
        </p>
        <ul className="about-fall__caption-points">
          {act.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
      <div className="about-fall__caption-details" id={id} inert={!open} data-lenis-prevent>
        <div>
          {act.details.map((group) => (
            <section key={group.heading}>
              <h3>{group.heading}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="about-fall__caption-more"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        {open ? intro.less : intro.more}
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path d="M2 6h8M6.5 2.5 10 6 6.5 9.5" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>
    </>
  )
}
