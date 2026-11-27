import type { ReactNode } from 'react'
import { DocCode } from './DocCode.tsx'

/**
 * A live preview with the code that makes it, joined in one card.
 */
interface ExampleProps {
  children: ReactNode
  code?: string
  lang?: string
  center?: boolean
}

export function Example({ children, code, lang = 'jsx', center = false }: ExampleProps) {
  return (
    <figure className="doc-example">
      <div className={`doc-example__preview${center ? ' doc-example__preview--center' : ''}`}>{children}</div>
      {code ? <DocCode code={code} lang={lang} joined /> : null}
    </figure>
  )
}
