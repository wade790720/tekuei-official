import { Demo } from './demos.tsx'
import { DocCode } from './doc/DocCode.tsx'
import { DocSection } from './doc/DocSection.tsx'
import { DocTable } from './doc/DocTable.tsx'
import { Example } from './doc/Example.tsx'
import { RuleList } from './doc/RuleList.tsx'
import { partId } from './componentToc.ts'
import type { ApiPart, ComponentEntry } from './libraryTypes.ts'

const PROPS_HEAD = ['Prop', '型別', '預設', '說明']

function Showcase({ demo, code }: { demo?: string; code?: string }) {
  if (demo) {
    return (
      <Example code={code}>
        <Demo name={demo} />
      </Example>
    )
  }
  return code ? <DocCode code={code} /> : null
}

function Part({ part }: { part: ApiPart }) {
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

export function ComponentPage({ item }: { item: ComponentEntry }) {
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
