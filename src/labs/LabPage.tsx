import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useParams } from 'react-router'
import './lab.css'
import { Breadcrumbs, BreadcrumbsItem } from '../components/Breadcrumbs.tsx'
import { Button } from '../components/Button.tsx'
import { Card } from '../components/Card.tsx'
import CaseStub from '../components/CaseStub.tsx'
import { CheckIcon, CopyIcon } from '../components/CodeBlock.tsx'
import { SiteFooter } from '../components/SiteFooter.tsx'
import { TagList } from '../components/Tag.tsx'
import { writeClipboard } from '../lib/clipboard.ts'
import { LAB_BY_ID, LAB_LABELS, LABS, labHref, liveHref } from './index.ts'
import { LAB_THUMBS } from './media.ts'
import { LAB_PROMPTS } from './prompts.ts'
import { useLang } from '../i18n'

/**
 * One lab, laid out like a Framer Marketplace component page: title and actions, a playable preview,
 * the write-up, then the other labs. The preview runs the live page in an iframe, so its own scroll,
 * fixed canvas and page classes stay inside it. Show Preview opens the same page full screen.
 */
export default function LabPage() {
  const { slug: id } = useParams()
  const { lang } = useLang()
  const item = id ? LAB_BY_ID[id] : undefined

  if (!item) return <CaseStub />
  const text = item[lang]
  const labels = LAB_LABELS[lang]
  const others = LABS.filter((x) => x.id !== id)

  return (
    <>
      <title>{`${text.title} · TEKUEI`}</title>
      <meta name="description" content={text.summary} />
      <main className="lab">
        <header className="lab__head">
          <Breadcrumbs label={labels.crumbs} className="lab__crumbs">
            <BreadcrumbsItem href="/">{labels.home}</BreadcrumbsItem>
            <BreadcrumbsItem href="/projects">Projects</BreadcrumbsItem>
            <BreadcrumbsItem>{text.title}</BreadcrumbsItem>
          </Breadcrumbs>
          <div className="lab__heading">
            <h1 className="lab__title">{text.title}</h1>
            <p className="lab__summary">{text.summary}</p>
            <TagList tags={[labels.category, ...text.tags]} variant="outline" />
          </div>
          <div className="lab__actions">
            <Button as="a" href={liveHref(item.id)} target="_blank" rel="noreferrer" variant="ghost">
              {labels.showPreview} <span aria-hidden>↗</span>
            </Button>
            <CopyPromptButton prompt={LAB_PROMPTS[item.id]} labels={labels} />
          </div>
        </header>

        <Card className="lab__preview" style={item.previewAspect ? ({ '--lab-aspect': item.previewAspect } as CSSProperties) : undefined}>
          <iframe src={liveHref(item.id)} title={`${text.title} · ${labels.preview}`} />
        </Card>

        <section className="lab__about" aria-labelledby="lab-about-title">
          <div className="lab__prose">
            <h2 id="lab-about-title" className="lab__subtitle">
              {labels.about} {text.title}
            </h2>
            {text.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
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
        </section>

        <section className="lab__more" aria-labelledby="lab-more-title">
          <h2 id="lab-more-title" className="lab__subtitle">
            {labels.more}
          </h2>
          <ul className="lab__more-list">
            {others.map((x) => (
              <li key={x.id}>
                <Link to={labHref(x.id)} className="lab__more-link">
                  <Card className="lab__more-thumb">
                    <img src={LAB_THUMBS[x.id].url} alt="" loading="lazy" />
                  </Card>
                  <span className="lab__more-title">{x[lang].title}</span>
                  <span className="lab__more-sub">{x[lang].subtitle}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}

/** Copies the lab's prompt; the copy icon turns into a check for a moment, like the CodeBlock copy button. */
interface CopyPromptButtonProps {
  prompt: string
  labels: { copyPrompt: string; copied: string }
}

function CopyPromptButton({ prompt, labels }: CopyPromptButtonProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    if (!(await writeClipboard(prompt))) return
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }

  return (
    <Button onClick={copy} className="lab__copy">
      <span className="icon-swap" aria-hidden>
        <span data-off={copied || undefined}>
          <CopyIcon />
        </span>
        <span data-off={!copied || undefined}>
          <CheckIcon />
        </span>
      </span>
      {labels.copyPrompt}
      <span className="card__sr" role="status">
        {copied ? labels.copied : ''}
      </span>
    </Button>
  )
}
