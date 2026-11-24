import { DocCode } from './DocCode.jsx'

/**
 * A live preview with the code that makes it, joined in one card.
 * @param {{ children: import('react').ReactNode, code?: string, lang?: string, center?: boolean }} props
 */
export function Example({ children, code, lang = 'jsx', center = false }) {
  return (
    <figure className="doc-example">
      <div className={`doc-example__preview${center ? ' doc-example__preview--center' : ''}`}>{children}</div>
      {code ? <DocCode code={code} lang={lang} joined /> : null}
    </figure>
  )
}
