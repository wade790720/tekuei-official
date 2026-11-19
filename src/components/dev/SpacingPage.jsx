// Spacing page: the scale as rising boxes and a table, the three rhythms, then the measured spec view.
import { useState } from 'react'
import { CodeBlock } from './doc/CodeBlock.jsx'
import { DocSection } from './doc/DocSection.jsx'
import { DocTable } from './doc/DocTable.jsx'
import { RuleList } from './doc/RuleList.jsx'
import { TokenScale } from './doc/TokenScale.jsx'
import { rootVar } from './doc/tokens.js'
import { SPACE_RULES, SPACE_SCALE } from './foundations.data.js'
import { GUIDES } from './guides.data.js'
import { SpecView } from './SpecView.jsx'

const g = GUIDES.spacing
const TOKENS = SPACE_SCALE.map(([t]) => t)
const tokenCode = TOKENS.map((t) => `var(${t});`).join('\n')

export function SpacingPage() {
  const [rows] = useState(() => SPACE_SCALE.map(([t, use]) => [t, rootVar(t), use]))
  return (
    <>
      <DocSection id="scale" title="刻度" lead={g.scale}>
        <TokenScale tokens={TOKENS} kind="space" label={(t) => rootVar(t).replace('px', '')} />
        <DocTable head={['Token', '值', '用在']} rows={rows} code={[0, 1]} />
        <CodeBlock code={tokenCode} lang="css" />
      </DocSection>

      <DocSection id="rhythm" title="節奏" lead={g.rhythm}>
        <DocTable head={['節奏', 'Token', '值', '例子']} rows={g.rhythmRows} code={[1, 2]} />
      </DocSection>

      <DocSection id="spec" title="實際使用" lead={g.spec}>
        <SpecView mode="spacing" />
      </DocSection>

      <DocSection id="rules" title="原則">
        <RuleList items={SPACE_RULES} />
      </DocSection>
    </>
  )
}
