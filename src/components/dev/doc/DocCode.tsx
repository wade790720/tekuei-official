import { useMemo } from 'react'
import { tokenize } from '../../../lib/highlight.ts'

/**
 * Highlighted code on its own (token lists, install steps). Example puts the same block under a preview.
 * @param {{ code: string, lang?: string, joined?: boolean }} props  joined: sits under a preview, no own frame
 */
export function DocCode({ code, lang = 'jsx', joined = false }) {
  const tokens = useMemo(() => tokenize(code, lang), [code, lang])
  return (
    <pre className={`doc-code${joined ? ' doc-code--joined' : ''}`} tabIndex={0}>
      <code>
        {tokens.map((t, i) =>
          t.type === 'plain' ? (
            t.text
          ) : (
            <span key={i} className={`code-block__tok--${t.type}`}>
              {t.text}
            </span>
          ),
        )}
      </code>
    </pre>
  )
}
