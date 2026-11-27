// One component page, laid out like the Radix Themes component docs:
// hero example, API Reference (one part per sub-heading), Examples, Keyboard, Notes.
import { Demo } from './demos.tsx'
import { DocCode } from './doc/DocCode.tsx'
import { DocSection } from './doc/DocSection.tsx'
import { DocTable } from './doc/DocTable.tsx'
import { Example } from './doc/Example.tsx'
import { RuleList } from './doc/RuleList.tsx'
import { partId } from './componentToc.ts'

const PROPS_HEAD = ['Prop', '型別', '預設', '說明']

/** A live demo with its code under it, or just the code when there is nothing to show live. */
function Showcase({ demo, code }) {
  if (demo) {
    return (
      <Example code={code}>
        <Demo name={demo} />
      </Example>
    )
  }
  return code ? <DocCode code={code} /> : null
}

function Part({ part }) {
  const table = part.props.length ? <DocTable head={PROPS_HEAD} rows={part.props} code={[0, 1, 2]} /> : null
  if (!part.part) {
    return (
      <>
        {part.description ? <p className="doc-section__lead">{part.description}</p> : null}
        {table}
      </>
    )
  }
  return (
    <DocSection id={partId(part.part)} title={part.part} lead={part.description} level={3}>
      {table}
    </DocSection>
  )
}

export function ComponentPage({ item }) {
  return (
    <>
      <div className="doc-hero">
        <Showcase demo={item.hero.demo} code={item.hero.code} />
      </div>

      <DocSection id="api" title="API Reference">
        {item.api.map((p, i) => (
          <Part key={p.part ?? i} part={p} />
        ))}
      </DocSection>

      {item.examples.length ? (
        <DocSection id="examples" title="Examples">
          {item.examples.map((ex) => (
            <DocSection key={ex.id} id={`ex-${ex.id}`} title={ex.title} lead={ex.description} level={3}>
              <Showcase demo={ex.demo} code={ex.code} />
            </DocSection>
          ))}
        </DocSection>
      ) : null}

      {item.keyboard?.length ? (
        <DocSection id="keyboard" title="鍵盤">
          <DocTable head={['按鍵', '動作']} rows={item.keyboard.map(([k, a]) => [<kbd key="k">{k}</kbd>, a])} />
        </DocSection>
      ) : null}

      {item.notes?.length ? (
        <DocSection id="notes" title="說明">
          <RuleList items={item.notes} />
        </DocSection>
      ) : null}
    </>
  )
}
