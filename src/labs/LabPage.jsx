import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import './lab.css'
import { Button } from '../components/Button.jsx'
import { Card } from '../components/Card.jsx'
import CaseStub from '../components/CaseStub.jsx'
import { LAB_BY_ID, LAB_LABELS, liveHref } from './index.js'
import { useLang } from '../i18n'

/**
 * One lab, laid out like a motionsites.ai item: the live piece on the left, its details on the right.
 * The piece runs in an iframe, so its own scroll, fixed canvas and page classes stay inside it.
 */
export default function LabPage() {
  const { slug: id } = useParams()
  const { lang } = useLang()
  const item = LAB_BY_ID[id]
  const title = item?.[lang].title

  useEffect(() => {
    if (title) document.title = `${title} · TEKUEI`
  }, [title])

  if (!item) return <CaseStub />
  const text = item[lang]
  const labels = LAB_LABELS[lang]

  return (
    <main className="lab">
      <Card className="lab__card">
        <div className="lab__preview">
          <iframe src={liveHref(id)} title={`${text.title} · ${labels.preview}`} />
          <Button as={Link} to="/work" variant="overlay" className="lab__back" aria-label={labels.back}>
            ←
          </Button>
        </div>

        <div className="lab__info">
          <div>
            <h1 className="lab__title">{text.title}</h1>
            <p className="lab__category">{labels.category}</p>
          </div>
          <p className="lab__summary">{text.summary}</p>
          <dl className="lab__meta">
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
          <Button as="a" href={liveHref(id)} target="_blank" rel="noreferrer" className="lab__open">
            {labels.open} <span aria-hidden>↗</span>
          </Button>
        </div>
      </Card>
    </main>
  )
}
