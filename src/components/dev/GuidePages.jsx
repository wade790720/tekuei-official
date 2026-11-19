// Overview and Theme pages of the library that are mostly prose, code and tables.
// Copy lives in guides.data.js; values are read live from tokens.css where a table shows them.
import { useState } from 'react'
import { CodeBlock } from './doc/CodeBlock.jsx'
import { DocSection } from './doc/DocSection.jsx'
import { DocTable } from './doc/DocTable.jsx'
import { Example } from './doc/Example.jsx'
import { LinkCards } from './doc/LinkCards.jsx'
import { RuleList } from './doc/RuleList.jsx'
import { TokenScale } from './doc/TokenScale.jsx'
import { rootVar } from './doc/tokens.js'
import { REFERENCE_TABLE, SPACE_SCALE } from './foundations.data.js'
import { GUIDES } from './guides.data.js'

export function GettingStarted() {
  const g = GUIDES.introduction
  return (
    <>
      <DocSection id="how" title="組成" lead={g.intro} />
      <DocSection id="steps" title="步驟">
        {g.steps.map((s) => (
          <DocSection key={s.id} id={s.id} title={s.title} lead={s.text} level={3}>
            <CodeBlock code={s.code} lang={s.lang} />
          </DocSection>
        ))}
      </DocSection>
      <DocSection id="next" title="延伸閱讀">
        <LinkCards items={g.next} />
      </DocSection>
    </>
  )
}

export function Styling() {
  const g = GUIDES.styling
  return (
    <>
      <DocSection id="intro" title="說明" lead={g.intro} />
      <DocSection id="tokens" title="使用 token" lead={g.tokens.text}>
        <CodeBlock code={g.tokens.code} lang="css" />
      </DocSection>
      <DocSection id="naming" title="命名" lead={g.naming.text}>
        <CodeBlock code={g.naming.code} lang="css" />
      </DocSection>
      <DocSection id="issues" title="常見問題">
        {g.issues.map((it) => (
          <DocSection key={it.id} id={it.id} title={it.title} lead={it.text} level={3} />
        ))}
      </DocSection>
    </>
  )
}

export function LayoutGuide() {
  const g = GUIDES.layout
  return (
    <>
      <DocSection id="max-width" title="最大寬度" lead={g.maxWidth.text}>
        <CodeBlock code={g.maxWidth.code} lang="css" />
        <DocTable head={['Token', '值', '用途']} rows={g.maxWidth.rows} code={[0, 1]} />
      </DocSection>
      <DocSection id="full-bleed" title="滿版的元素" lead={g.fullBleed.text}>
        <CodeBlock code={g.fullBleed.code} lang="css" />
      </DocSection>
      <DocSection id="decoration" title="絕對定位的裝飾" lead={g.decoration.text}>
        <CodeBlock code={g.decoration.code} lang="css" />
      </DocSection>
      <DocSection id="sections" title="區塊間距" lead={g.sections.text}>
        <CodeBlock code={g.sections.code} lang="css" />
      </DocSection>
    </>
  )
}

const num = (v) => v.replace(/px$/, '')

/** The article column width, measured from the real journal styles (not from the viewport). */
function measureColumn() {
  const wrap = document.createElement('div')
  wrap.className = 'journal-page'
  wrap.style.cssText = 'position:absolute;left:-9999px;top:0;width:1600px;visibility:hidden'
  wrap.innerHTML = '<div class="journal-post"><div class="journal-post__body"></div></div>'
  document.body.append(wrap)
  const w = Math.round(wrap.querySelector('.journal-post__body').getBoundingClientRect().width)
  wrap.remove()
  return `${w}px`
}

/** TEKUEI's values for the reference table, read live so the table cannot drift from the tokens. */
function readTekuei() {
  const v = rootVar
  const tiers = ['--text-primary', '--text-body', '--text-secondary', '--text-tertiary'].filter((t) => v(t)).length
  return {
    background: v('--surface-0'),
    body: `${num(v('--type-body'))} / ${v('--type-body-lh')}`,
    h2: `${num(v('--type-h2'))} / ${v('--type-h2-lh')}`,
    display: `${v('--type-display')} / ${v('--type-display-lh')}、${v('--type-display-ls')}`,
    tiers: `${tiers} 階${v('--text-faint') ? ' + 裝飾' : ''}`,
    space: SPACE_SCALE.map(([t]) => num(v(t))).join(' · '),
    measure: measureColumn(),
  }
}

export function Resources() {
  const g = GUIDES.resources
  const [tekuei] = useState(readTekuei)
  const rows = REFERENCE_TABLE.rows.map((r) => [r.label, ...r.refs, tekuei[r.key]])
  return (
    <>
      <DocSection id="files" title="規範檔">
        <DocTable head={['檔案', '內容']} rows={g.files} code={[0]} />
      </DocSection>
      <DocSection id="references" title="參考網站對照" lead={g.references}>
        <DocTable head={REFERENCE_TABLE.head} rows={rows} rowHeader />
      </DocSection>
      <DocSection id="bibliography" title="參考文獻" lead={g.bibliography.lead}>
        {g.bibliography.groups.map((group, i) => (
          <DocSection key={group.title} id={`bibliography-${i + 1}`} title={group.title} lead={group.lead} level={3}>
            <DocTable
              head={['網站', '參考了什麼', '用在哪裡']}
              rows={group.rows.map(([site, url, what, where]) => [
                url ? (
                  <a href={url} target="_blank" rel="noreferrer">
                    {site}
                  </a>
                ) : (
                  site
                ),
                what,
                where,
              ])}
              rowHeader
            />
          </DocSection>
        ))}
      </DocSection>
    </>
  )
}

export function ThemeOverview() {
  const g = GUIDES.theme
  return (
    <>
      <DocSection id="anatomy" title="組成" lead={g.anatomy.text}>
        <CodeBlock code={g.anatomy.code} lang="css" />
      </DocSection>
      <DocSection id="principles" title="原則">
        <RuleList items={g.principles} />
      </DocSection>
      <DocSection id="tokens" title="Token">
        <LinkCards items={g.tokens} />
      </DocSection>
    </>
  )
}

const RADII = ['--radius-sm', '--radius-md', '--radius-lg', '--radius-full']

export function RadiusPage() {
  const g = GUIDES.radius
  return (
    <>
      <DocSection id="scale" title="刻度" lead={g.scale}>
        <TokenScale tokens={RADII} kind="radius" />
        <DocTable head={['Token', '值', '用在']} rows={g.rows} code={[0, 1]} />
      </DocSection>
      <DocSection id="usage" title="使用">
        <CodeBlock code={g.code} lang="css" />
      </DocSection>
    </>
  )
}

/** A dot that crosses its track with --ease-touch; click to run it again. */
function EasingDemo() {
  const [run, setRun] = useState(0)
  return (
    <button type="button" className="doc-easing" onClick={() => setRun((n) => n + 1)} aria-label="重播 easing 示範">
      <span key={run} className="doc-easing__dot" />
      <span className="doc-easing__hint">點一下重播</span>
    </button>
  )
}

export function MotionPage() {
  const g = GUIDES.motion
  const [ease] = useState(() => rootVar('--ease-touch'))
  return (
    <>
      <DocSection id="easing" title="Easing" lead={g.easing}>
        <Example code={g.easingCode} lang="css">
          <EasingDemo />
        </Example>
        <DocTable head={['Token', '值']} rows={[['--ease-touch', ease]]} code={[0, 1]} />
      </DocSection>
      <DocSection id="duration" title="時長" lead={g.durationNote}>
        <DocTable head={['用在', '時長', '例子']} rows={g.durations} code={[1]} />
      </DocSection>
      <DocSection id="reduced" title="減少動態效果" lead={g.reduced}>
        <CodeBlock code={g.reducedCode} lang="css" />
      </DocSection>
      <DocSection id="signature" title="招牌效果" lead={g.signature}>
        <DocTable head={['函式', '頁面', '效果']} rows={g.signatureRows} code={[0]} />
      </DocSection>
    </>
  )
}

export function BreakpointsPage() {
  const g = GUIDES.breakpoints
  return (
    <>
      <DocSection id="sizes" title="寬度">
        <DocTable head={['名稱', '寬度', '版面的變化']} rows={g.rows} code={[1]} />
      </DocSection>
      <DocSection id="usage" title="用法" lead={g.usage}>
        <CodeBlock code={g.code} lang="css" />
      </DocSection>
    </>
  )
}
