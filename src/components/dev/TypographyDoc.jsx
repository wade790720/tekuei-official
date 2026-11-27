// The Typography page of the library, laid out like the Radix Themes typography docs:
// base components, formatting, the type scale, weights, families, then the measured spec.
import { useState } from 'react'
import { blocksToDoc } from '../../lib/richText.ts'
import { RichText } from '../RichText.jsx'
import { DocSection } from './doc/DocSection.jsx'
import { DocTable } from './doc/DocTable.jsx'
import { Example } from './doc/Example.jsx'
import { RuleList } from './doc/RuleList.jsx'
import { TypeScalePicker } from './doc/TypeScalePicker.jsx'
import { rootVar } from './doc/tokens.js'

// Sizes are rem in tokens.css; the docs show the px a 16px root gives
const toPx = (v) => v.replace(/(\d*\.?\d+)rem/g, (_, n) => `${+n * 16}px`)
import { TYPE_DOC, TYPE_RULES, TYPE_STEPS } from './foundations.data.js'
import { SpecView } from './SpecView.jsx'

const { base, formatting, weight, family } = TYPE_DOC

const baseCode = `<RichText
  doc={blocksToDoc([
${base.blocks.map((b) => `    { type: '${b.type}', text: '${b.text}' },`).join('\n')}
  ])}
/>`

const weightCode = weight.rows.map(([, token, use]) => `font-weight: var(${token}); /* ${use} */`).join('\n')
const familyCode = family.rows.map(([use, token]) => `font-family: var(${token}); /* ${use} */`).join('\n')

// Font stacks are long; the first three names say enough.
const shortStack = (v) =>
  v
    .split(',')
    .slice(0, 3)
    .map((f) => f.trim().replace(/["']/g, ''))
    .join(', ')

function readValues() {
  return {
    steps: TYPE_STEPS.map((s) => [
      s.name,
      s.token,
      toPx(rootVar(s.token)),
      rootVar(`${s.token}-lh`),
      s.tracking ? rootVar(`${s.token}-ls`) : '0',
      s.use,
    ]),
    weights: weight.rows.map(([name, token, use]) => [name, token, rootVar(token), use]),
    families: family.rows.map(([use, token]) => [use, token, shortStack(rootVar(token))]),
  }
}

export function TypographyDoc() {
  const [vals] = useState(readValues)
  return (
    <>
      <DocSection id="base" title="基本元件" lead={base.lead}>
        <Example code={baseCode}>
          <div className="journal-post__body doc-prose">
            <RichText doc={blocksToDoc(base.blocks)} />
          </div>
        </Example>
      </DocSection>

      <DocSection id="formatting" title="行內格式" lead={formatting.lead}>
        <Example code={formatting.code} lang="html">
          <div className="journal-post__body doc-prose">
            <RichText doc={formatting.doc} />
          </div>
        </Example>
      </DocSection>

      <DocSection id="scale" title="字級" lead={TYPE_DOC.scale}>
        <TypeScalePicker steps={TYPE_STEPS} initial="Body" />
        <DocTable head={['名稱', 'Token', '字級', '行高', '字距', '用途']} rows={vals.steps} code={[1, 2, 3, 4]} />
      </DocSection>

      <DocSection id="weight" title="字重" lead={weight.lead}>
        <Example code={weightCode} lang="css">
          <div className="doc-weights">
            {weight.rows.map(([name, token]) => (
              <span key={token} style={{ fontWeight: `var(${token})` }}>
                {name} 留白的建築
              </span>
            ))}
          </div>
        </Example>
        <DocTable head={['字重', 'Token', '值', '用在']} rows={vals.weights} code={[1, 2]} />
      </DocSection>

      <DocSection id="family" title="字型" lead={family.lead}>
        <Example code={familyCode} lang="css">
          <div className="doc-families">
            {family.rows.map(([, token, sample]) => (
              <span key={token} style={{ fontFamily: `var(${token})` }}>
                {sample}
              </span>
            ))}
          </div>
        </Example>
        <DocTable head={['用途', 'Token', '字型']} rows={vals.families} code={[1]} />
      </DocSection>

      <DocSection id="spec" title="標註" lead={TYPE_DOC.spec}>
        <SpecView mode="typography" />
      </DocSection>

      <DocSection id="rules" title="原則">
        <RuleList items={TYPE_RULES} />
      </DocSection>
    </>
  )
}
