// Dev-only page (/dev/component-library): every reusable component with its guideline and a live demo.
// App.jsx mounts it only when import.meta.env.DEV, so the page and its assets stay out of production.
// Guideline text lives in componentLibrary.data.js. Keep it in step with the code and DESIGN.md.
import { useEffect, useRef, useState } from 'react'
import { HomeFadeIn } from '../HomeFadeIn.jsx'
import { Reveal } from '../Reveal.jsx'
import { OtpGate } from '../admin/OtpGate.jsx'
import { CodeCard } from '../journal/CodeCard.jsx'
import { ImageCard } from '../journal/ImageCard.jsx'
import { PostDoc } from '../journal/PostDoc.jsx'
import { VideoCard } from '../journal/VideoCard.jsx'
import { PostEditor } from '../journal/editor/PostEditor.jsx'
import { blocksToDoc } from '../../lib/postDoc.js'
import { mountGlyphField } from '../../lib/glyphField.js'
import { mountShatterImage } from '../../lib/shatterImage.js'
import { GROUPS } from './componentLibrary.data.js'
import heroImage from '../../assets/hero/bg.webp'
import cutImage from '../../assets/hero/cut.webp'
import seaImage from '../../assets/journal/footer-sea.webp'
import demoClip from '../../assets/dev/demo-clip.mp4'
import '../../styles/work.css'
import '../../styles/journal.css'
import '../../styles/case.css'
import '../../styles/cms.css'
import '../../styles/componentLibrary.css'

const SAMPLE_CODE = `// Stream a reply and let the model call two tools.
const result = streamText({
  model: "anthropic/claude-haiku-5.5",
  messages: await convertToModelMessages(messages),
  stopWhen: isStepCount(15),
  tools: {
    logFood: tool({
      inputSchema: z.object({ day: mealDay, items: mealItems }),
      execute: ({ day, items }) => addMeals(day, items),
    }),
  },
});`

function Replay({ onClick }) {
  return (
    <button type="button" className="cl-replay" onClick={onClick}>
      重播
    </button>
  )
}

// Remounts its children, so one-shot effects (reveal, shatter) can play again.
function Replayable({ children }) {
  const [run, setRun] = useState(0)
  return (
    <>
      <Replay onClick={() => setRun((n) => n + 1)} />
      <div key={run}>{children}</div>
    </>
  )
}

function ShatterDemo() {
  const canvas = useRef(null)
  useEffect(() => mountShatterImage(canvas.current, { src: seaImage, crop: [0, 389, 1280, 470] }), [])
  return <canvas ref={canvas} className="cl-shatter" aria-hidden />
}

// Demo only: 123456 is "correct", nothing is sent anywhere.
function OtpDemo() {
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState('')
  return (
    <div className="cl-box cl-box--row">
      <button type="button" className="cl-replay cl-replay--inline" onClick={() => setOpen(true)}>
        打開密碼框
      </button>
      <span>示範密碼 123456 {result}</span>
      <OtpGate
        open={open}
        onClose={() => setOpen(false)}
        onVerify={async (code) => {
          await new Promise((r) => setTimeout(r, 600))
          return code === '123456'
        }}
        onUnlocked={() => {
          setOpen(false)
          setResult('· 已解鎖')
        }}
      />
    </div>
  )
}

// Demo only: edits stay in this page, uploads become local object URLs.
const EDITOR_SAMPLE = blocksToDoc([
  { type: 'lead', text: '編輯器的示範。試試選取文字後按工具列。' },
  { type: 'h2', text: '小標題' },
  { type: 'p', text: '一般段落。可以加粗、斜體、連結和行內程式碼。' },
  { type: 'quote', text: '引言放在這裡。', attr: '出處' },
  { type: 'code', lang: 'ts', filename: 'demo.ts', code: 'const x = 1' },
])

function EditorDemo() {
  const [doc, setDoc] = useState(EDITOR_SAMPLE)
  return (
    <div className="cl-editor">
      <div className="cl-editor__pane">
        <PostEditor doc={EDITOR_SAMPLE} onChange={setDoc} upload={async (file) => URL.createObjectURL(file)} />
      </div>
      <div className="journal-post__body cl-editor__preview">
        <PostDoc doc={doc} />
      </div>
    </div>
  )
}

function GlyphDemo() {
  const canvas = useRef(null)
  useEffect(() => mountGlyphField(canvas.current), [])
  return (
    <div className="cl-glyph">
      <canvas ref={canvas} className="journal-header__glyphs" aria-hidden />
    </div>
  )
}

const DEMOS = {
  code: () => (
    <>
      <CodeCard lang="ts" filename="route.ts" code={SAMPLE_CODE} />
      <CodeCard lang="bash" code={'# install and run\nnpm install\nnpm run dev'} />
    </>
  ),
  image: () => (
    <>
      <ImageCard src={heroImage} alt="示範：Hero 背景圖" caption="滿版" />
      <ImageCard src={cutImage} alt="示範：人物去背圖" caption="frame" frame />
    </>
  ),
  video: () => <VideoCard src={demoClip} caption="示範影片（由 Hero 圖生成）" />,
  editor: () => <EditorDemo />,
  fade: () => (
    <Replayable>
      <HomeFadeIn className="cl-box">HomeFadeIn</HomeFadeIn>
    </Replayable>
  ),
  reveal: () => (
    <Replayable>
      <Reveal className="cl-box">Reveal</Reveal>
    </Replayable>
  ),
  shatter: () => (
    <Replayable>
      <ShatterDemo />
    </Replayable>
  ),
  glyph: () => <GlyphDemo />,
  otp: () => <OtpDemo />,
}

function Entry({ item }) {
  const Demo = item.demo ? DEMOS[item.demo] : null
  return (
    <section className="cl-item" id={item.id} aria-labelledby={`${item.id}-title`}>
      <header className="cl-item__head">
        <h3 className="cl-item__name" id={`${item.id}-title`}>
          {item.name}
        </h3>
        <code className="cl-item__file">{item.file}</code>
      </header>
      <p className="cl-item__summary">{item.summary}</p>

      {Demo ? (
        <div className="cl-stage">
          <div className="cl-stage__label">示範</div>
          <Demo />
        </div>
      ) : null}

      <div className="cl-rules">
        <div>
          <h4 className="cl-rules__title cl-rules__title--do">什麼時候用</h4>
          <ul>
            {item.use.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="cl-rules__title cl-rules__title--dont">不要用在</h4>
          <ul>
            {item.avoid.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      <h4 className="cl-sub">Props</h4>
      <div className="cl-table-wrap">
        <table className="cl-table">
          <thead>
            <tr>
              <th scope="col">名稱</th>
              <th scope="col">型別</th>
              <th scope="col">預設</th>
              <th scope="col">說明</th>
            </tr>
          </thead>
          <tbody>
            {item.props.map(([name, type, def, desc]) => (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td>
                  <code>{type}</code>
                </td>
                <td>
                  <code>{def}</code>
                </td>
                <td>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 className="cl-sub">用法</h4>
      <CodeCard code={item.example} lang="jsx" filename={item.file.split('/').pop()} />

      {item.notes.length ? (
        <>
          <h4 className="cl-sub">注意</h4>
          <ul className="cl-notes">
            {item.notes.map((t) => (
              <li key={t} data-todo={t.startsWith('待修') || undefined}>
                {t}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  )
}

export default function ComponentLibrary() {
  useEffect(() => {
    document.title = 'Component Library · TEKUEI'
  }, [])

  return (
    <div className="journal-page cl-page">
      <nav className="cl-toc" aria-label="元件目錄">
        <div className="cl-toc__title">目錄</div>
        {GROUPS.map((g) => (
          <div key={g.id} className="cl-toc__group">
            <a href={`#${g.id}`} className="cl-toc__group-link">
              {g.title}
            </a>
            {g.items.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="cl-toc__link">
                {item.name}
              </a>
            ))}
          </div>
        ))}
      </nav>

      <main className="cl-main">
        <header className="cl-head">
          <div className="cl-head__pre">DEV ONLY</div>
          <h1 className="cl-head__title">Component Library</h1>
          <p className="cl-head__desc">
            網站裡可以重複使用的元件，和每個元件的使用規範。顏色、字型、間距的規則在 DESIGN.md。
            改了元件，同時更新這一頁（src/components/dev/componentLibrary.data.js）。
          </p>
        </header>

        {GROUPS.map((g) => (
          <section key={g.id} className="cl-group" id={g.id} aria-labelledby={`${g.id}-title`}>
            <h2 className="cl-group__title" id={`${g.id}-title`}>
              {g.title}
            </h2>
            <p className="cl-group__intro">{g.intro}</p>
            {g.items.map((item) => (
              <Entry key={item.id} item={item} />
            ))}
          </section>
        ))}
      </main>
    </div>
  )
}
