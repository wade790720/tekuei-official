import { useEffect, useRef, useState } from 'react'
import { Button } from '../Button.tsx'
import { useAdmin } from '../../context/admin.ts'
import { TRANSLATE_LABELS as T } from '../../data/admin.ts'
import { useLang } from '../../i18n'
import { translateTexts } from '../../lib/adminApi.ts'
import { docSlots } from '../../lib/docTranslate.ts'
import { hasBody } from '../../lib/richText.ts'
import type { Doc } from '../../lib/siteData.ts'
import type { Slot } from '../../lib/docTranslate.ts'

const DONE_MS = 5000 // how long the "translated" note stays

/**
 * The translate button of an edit panel: fills the English draft from the Chinese one. Nothing is saved:
 * Wade reads it, edits it, then saves. It works from either language, since it always writes the English side.
 * Goes in SidePanel's `actions`.
 */
export interface TranslateSectionProps {
  zhDoc: Doc
  enDoc: Doc
  /** Short Chinese texts outside the body, e.g. the title. */
  fields?: Record<string, string | undefined>
  onDone: (result: { doc: Doc; fields: Record<string, string> }) => void
}

export function TranslateSection({ zhDoc, enDoc, fields = {}, onDone }: TranslateSectionProps) {
  const { lang } = useLang()
  const admin = useAdmin()
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [status, setStatus] = useState({ error: '', done: false })
  const abort = useRef<AbortController | null>(null)

  useEffect(() => () => abort.current?.abort(), [])

  // The "done" note leaves by itself; an error stays until the next try.
  useEffect(() => {
    if (!status.done) return undefined
    const id = setTimeout(() => setStatus({ error: '', done: false }), DONE_MS)
    return () => clearTimeout(id)
  }, [status.done])

  async function run() {
    if (hasBody(enDoc) && !window.confirm(T.confirm)) return
    const { doc, slots } = docSlots(zhDoc)
    const out: Record<string, string> = {}
    const all: Slot[] = [...slots]
    for (const [k, v] of Object.entries(fields)) if (v?.trim()) all.push({ text: v, set: (t) => (out[k] = t) })
    if (!all.length) {
      setStatus({ error: T.empty, done: false })
      return
    }
    const controller = new AbortController()
    abort.current = controller
    setStatus({ error: '', done: false })
    setProgress({ done: 0, total: 1 })
    try {
      const texts = await translateTexts(all.map((s) => s.text), admin.getToken(), {
        signal: controller.signal,
        onProgress: (done, total) => setProgress({ done, total }),
      })
      all.forEach((s, i) => s.set(texts[i]))
      onDone({ doc, fields: out })
      setStatus({ error: '', done: true })
    } catch (err) {
      if (!(err instanceof Error && err.name === 'AbortError')) setStatus({ error: err instanceof Error ? err.message : String(err), done: false })
    } finally {
      setProgress(null)
    }
  }

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
      ) : status.done ? (
        <p className="cms-bar__note" data-tone="ok" role="status">
          {lang === 'en' ? T.done : T.doneElsewhere}
        </p>
      ) : null}
    </>
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
