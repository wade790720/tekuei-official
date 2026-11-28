import { useState } from 'react'
import { DocCode } from './doc/DocCode.tsx'
import { ColorScale } from './doc/ColorScale.tsx'
import { DocSection } from './doc/DocSection.tsx'
import { DocTable } from './doc/DocTable.tsx'
import { Example } from './doc/Example.tsx'
import { hex, ratio, readColors, type Rgba } from './doc/contrast.ts'
import { COLOR_GROUPS } from './foundations.data.ts'
import { GUIDES } from './guides.data.ts'

const g = GUIDES.color

const scaleCode = (name: string) => `/* 背景 */
var(--${name}-1);  var(--${name}-2);

/* 互動元件 */
var(--${name}-3);  var(--${name}-4);  var(--${name}-5);

/* 邊框和分隔線 */
var(--${name}-6);  var(--${name}-7);  var(--${name}-8);

/* 實色 */
var(--${name}-9);  var(--${name}-10);

/* 文字 */
var(--${name}-11); var(--${name}-12);

/* 透明版本：在每一階前面加 a */
var(--${name}-a1) … var(--${name}-a12);`

const POINTS_AT: Record<string, string> = {
  '--surface-0': '--gray-1',
  '--surface-1': '--gray-3',
  '--surface-2': '--gray-5',
  '--line': '--gray-a6',
  '--line-strong': '--gray-a7',
  '--text-primary': '--gray-12',
  '--text-body': '--gray-a12',
  '--text-secondary': '--gray-a11',
  '--text-tertiary': '--gray-a10',
  '--text-faint': '--gray-a9',
  '--ember': '--accent-9',
  '--ember-soft': '--accent-10',
  '--ember-line': '--accent-a7',
  '--ember-whisper': '--accent-a4',
}

const SEMANTIC = COLOR_GROUPS.flatMap((grp) => grp.swatches.map(([token, use]) => ({ token, use, text: grp.text })))

function readSemantic() {
  const colors = readColors([...SEMANTIC.map((s) => s.token), '--surface-0', '--surface-1'])
  const page = colors['--surface-0'].rgba
  const card = colors['--surface-1'].rgba
  return SEMANTIC.map(({ token, use, text }) => {
    const c = colors[token].rgba
    const contrast = (bg: Rgba) => {
      const v = ratio(c, bg)
      return <span className="fd-ratio" data-pass={v >= 4.5 || undefined}>{v.toFixed(1)}</span>
    }
    return [
      <span key="t" className="doc-swatch">
        <span className="doc-swatch__chip" style={{ background: `var(${token})` }} />
        <code>{token}</code>
      </span>,
      POINTS_AT[token] ?? '—',
      hex(c),
      use,
      text ? contrast(page) : '—',
      text ? contrast(card) : '—',
    ]
  })
}

export function ColorPage() {
  const [rows] = useState(readSemantic)
  return (
    <>
      <p className="doc-section__lead doc-intro">{g.intro}</p>

      <DocSection id="accent" title="強調色" lead={g.accent}>
        <ColorScale name="accent" />
        <DocCode code={scaleCode('accent') + '\n\n/* 放在實色上的文字 */\nvar(--accent-contrast);'} lang="css" />
      </DocSection>

      <DocSection id="gray" title="灰階" lead={g.gray}>
        <ColorScale name="gray" />
        <DocCode code={scaleCode('gray')} lang="css" />
      </DocSection>

      <DocSection id="alpha" title="透明色" lead={g.alpha}>
        <DocCode code={g.alphaCode} lang="css" />
      </DocSection>

      <DocSection id="semantic" title="語意 token" lead={g.semantic}>
        <DocTable head={['Token', '指向', '色值', '用途', '頁面', '卡片']} rows={rows} code={[1, 2]} />
      </DocSection>

      <DocSection id="backgrounds" title="背景" lead={g.backgrounds}>
        <Example code={g.backgroundsCode} lang="css">
          <div className="doc-surfaces">
            {['--surface-0', '--surface-1', '--surface-2'].map((t) => (
              <div key={t} className="doc-surfaces__layer" style={{ background: `var(${t})` }}>
                <code>{t}</code>
              </div>
            ))}
          </div>
        </Example>
      </DocSection>

      <DocSection id="focus" title="Hover 和聚焦" lead={g.focus}>
        <Example code={g.focusCode} lang="css" center>
          <div className="doc-focus">
            <span className="doc-focus__item">一般</span>
            <span className="doc-focus__item doc-focus__item--hover">hover</span>
            <span className="doc-focus__item doc-focus__item--focus">鍵盤聚焦</span>
          </div>
        </Example>
      </DocSection>
    </>
  )
}
