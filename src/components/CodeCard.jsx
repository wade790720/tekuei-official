import { useEffect, useMemo, useRef, useState } from 'react'
import { CARD_LABELS } from '../data/cards.js'
import { useLang } from '../i18n'
import { useHasChanged } from '../hooks/useHasChanged.js'
import { tokenize } from '../lib/highlight.js'
import { Card } from './Card.jsx'
import { ScrollShadow } from './ScrollShadow.jsx'
import '../styles/cards.css'

const BADGE = { bash: 'SH', shell: 'SH', zsh: 'SH', javascript: 'JS', typescript: 'TS', python: 'PY', yaml: 'YML' }

/**
 * @param {{ code: string, lang?: string, filename?: string }} props
 */
export function CodeCard({ code, lang = 'ts', filename }) {
  const { lang: ui } = useLang()
  const t = CARD_LABELS[ui]
  const tokens = useMemo(() => tokenize(code, lang), [code, lang])
  const [copied, setCopied] = useState(false)
  const swapped = useHasChanged(copied)
  const timer = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    if (!(await writeClipboard(code))) return // both ways failed: keep the button as it was
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }

  return (
    <Card as="figure" className="code-card">
      <figcaption className="code-card__bar">
        <span className="code-card__name">
          <span className="code-card__lang" aria-hidden>
            {BADGE[lang] ?? lang.slice(0, 3).toUpperCase()}
          </span>
          {filename ?? lang}
        </span>
        <button
          type="button"
          className="code-card__copy"
          onClick={copy}
          aria-label={t.copy}
          data-copied={copied || undefined}
        >
          <span key={copied ? 'check' : 'copy'} className="icon-swap" data-animate={swapped || undefined}>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </span>
        </button>
        <span className="card__sr" role="status">
          {copied ? t.copied : ''}
        </span>
      </figcaption>
      <ScrollShadow as="pre" orientation="horizontal" size={32} className="code-card__pre" tabIndex={0}>
        <code>
          {tokens.map((tk, i) =>
            tk.type === 'plain' ? (
              tk.text
            ) : (
              <span key={i} className={`code-card__tok--${tk.type}`}>
                {tk.text}
              </span>
            ),
          )}
        </code>
      </ScrollShadow>
    </Card>
  )
}

// In-app browsers (LINE, Instagram) can block the Clipboard API; execCommand still works in most of them.
async function writeClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
    document.body.append(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.8" />
      <path d="M10.5 3.5v-.3A1.7 1.7 0 0 0 8.8 1.5H3.2A1.7 1.7 0 0 0 1.5 3.2v5.6c0 .94.76 1.7 1.7 1.7h.3" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 8.5l3.2 3L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
