import { useEffect, useRef, useState } from 'react'
import { Button } from '../Button.jsx'
import { PanelSection } from '../SidePanel.jsx'
import { useAdmin } from '../../context/admin.js'
import { TRANSLATE_LABELS as T } from '../../data/admin.js'
import { useLang } from '../../i18n'
import { translateTexts } from '../../lib/adminApi.js'
import { docSlots } from '../../lib/docTranslate.js'
import { docText } from '../../lib/richText.js'

/**
 * Fills the English draft from the Chinese one. Nothing is saved: Wade reads it, edits it, then saves.
 * @param {{
 *   zhDoc: object, enDoc: object,
 *   fields?: Record<string, string>,  // short Chinese texts outside the body, e.g. the title
 *   compact?: boolean,                // one button for the SidePanel toolbar
 *   onDone: (result: { doc: object, fields: Record<string, string> }) => void,
 * }} props
 */
export function TranslateSection({ zhDoc, enDoc, fields = {}, compact = false, onDone }) {
  const { lang } = useLang()
  const admin = useAdmin()
  const [progress, setProgress] = useState(null)
  const [status, setStatus] = useState({ error: '', done: false })
  const abort = useRef(null)

  useEffect(() => () => abort.current?.abort(), [])

  if (lang !== 'en') {
    if (compact) return null
    return (
      <PanelSection title={T.title}>
        <div className="cms-translate">
          <p className="cms-translate__note">{T.switchToEn}</p>
        </div>
      </PanelSection>
    )
  }

  async function run() {
    if (docText(enDoc).trim() && !window.confirm(T.confirm)) return
    const { doc, slots } = docSlots(zhDoc)
    const out = {}
    const all = [
      ...slots,
      ...Object.entries(fields)
        .filter(([, v]) => v?.trim())
        .map(([k, v]) => ({ text: v, set: (t) => (out[k] = t) })),
    ]
    if (!all.length) {
      setStatus({ error: T.empty, done: false })
      return
    }
    abort.current = new AbortController()
    setStatus({ error: '', done: false })
    setProgress({ done: 0, total: 1 })
    try {
      const texts = await translateTexts(all.map((s) => s.text), admin.getToken(), {
        signal: abort.current.signal,
        onProgress: (done, total) => setProgress({ done, total }),
      })
      all.forEach((s, i) => s.set(texts[i]))
      onDone({ doc, fields: out })
      setStatus({ error: '', done: true })
    } catch (err) {
      if (err.name !== 'AbortError') setStatus({ error: err.message, done: false })
    } finally {
      setProgress(null)
    }
  }

  if (compact) {
    const label = progress ? `${T.running} ${progress.done}/${progress.total}` : T.action
    return (
      <>
        <Button variant="icon" onClick={run} disabled={Boolean(progress)} aria-label={label} data-tip={label}>
          <span className="icon-swap">
            <span data-off={progress ? true : undefined}>
              <TranslateIcon />
            </span>
            <span data-off={progress ? undefined : true}>
              <span className="cms-spin" />
            </span>
          </span>
        </Button>
        {status.error ? (
          <p className="cms-bar__note" role="alert">
            {status.error}
          </p>
        ) : null}
      </>
    )
  }

  return (
    <PanelSection title={T.title}>
      <div className="cms-translate">
        <Button variant="ghost" onClick={run} disabled={Boolean(progress)}>
          {progress ? `${T.running} ${progress.done}/${progress.total}` : T.action}
        </Button>
        <p className="cms-translate__note" role="status">
          {status.done ? T.done : status.error ? '' : T.note}
        </p>
        {status.error ? (
          <p className="cms-row__error" role="alert">
            {status.error}
          </p>
        ) : null}
      </div>
    </PanelSection>
  )
}

function TranslateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  )
}
