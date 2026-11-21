import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/experiment.css'
import { Button } from './Button.jsx'
import { Card } from './Card.jsx'
import { EXPERIMENT_BY_ID, EXPERIMENT_LABELS, liveHref } from '../data/experiments.js'
import { useLang } from '../i18n'

/**
 * One experiment, laid out like a motionsites.ai item: the live piece on the left, its details on the right.
 * The piece runs in an iframe, so its own scroll, fixed canvas and page classes stay inside it.
 */
export default function ExperimentPage({ id }) {
  const { lang } = useLang()
  const item = EXPERIMENT_BY_ID[id]
  const text = item[lang]
  const labels = EXPERIMENT_LABELS[lang]

  useEffect(() => {
    document.title = `${text.title} · TEKUEI`
  }, [text.title])

  return (
    <main className="experiment">
      <Card className="experiment__card">
        <div className="experiment__preview">
          <iframe src={liveHref(id)} title={`${text.title} · ${labels.preview}`} />
          <Button as={Link} to="/work" variant="overlay" className="experiment__back" aria-label={labels.back}>
            ←
          </Button>
        </div>

        <div className="experiment__info">
          <div>
            <h1 className="experiment__title">{text.title}</h1>
            <p className="experiment__category">{labels.category}</p>
          </div>
          <p className="experiment__summary">{text.summary}</p>
          <dl className="experiment__meta">
            <div>
              <dt>{labels.year}</dt>
              <dd>{item.year}</dd>
            </div>
            <div>
              <dt>{labels.credit}</dt>
              <dd>
                <a href={text.credit.href} target="_blank" rel="noreferrer">
                  {text.credit.label}
                </a>
              </dd>
            </div>
          </dl>
          <Button as="a" href={liveHref(id)} target="_blank" rel="noreferrer" className="experiment__open">
            {labels.open} <span aria-hidden>↗</span>
          </Button>
        </div>
      </Card>
    </main>
  )
}
