// Live demos for the component pages. Each entry in componentLibrary.data.js names one by key.
// Demo data only: nothing here is real content, and nothing is sent anywhere.
import { useEffect, useRef, useState } from 'react'
import { FadeIn } from '../FadeIn.jsx'
import { OtpGate } from '../admin/OtpGate.jsx'
import { CodeCard } from '../CodeCard.jsx'
import { ImageCard } from '../ImageCard.jsx'
import { RichText } from '../RichText.jsx'
import { SlidesCard } from '../SlidesCard.jsx'
import { VideoCard } from '../VideoCard.jsx'
import { Editor } from '../Editor.jsx'
import { DropdownMenu } from '../DropdownMenu.jsx'
import { SecretInput } from '../SecretInput.jsx'
import { blocksToDoc } from '../../lib/richText.js'
import { mountGlyphField } from '../../lib/glyphField.js'
import { mountShatterImage } from '../../lib/shatterImage.js'
import heroImage from '../../assets/hero/bg.webp'
import cutImage from '../../assets/hero/cut.webp'
import seaImage from '../../assets/journal/footer-sea.webp'
import demoClip from '../../assets/dev/demo-clip.mp4'

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

const SAMPLE_DOC = blocksToDoc([
  { type: 'lead', text: '前言用比內文大一階的字，帶出整篇文章。' },
  { type: 'h2', text: '小標題' },
  { type: 'p', text: '一般段落。字級 17px，行高 1.9，一行約 35–40 個中文字。' },
  { type: 'quote', text: '引言放在這裡。', attr: '出處' },
])

const EDITOR_SAMPLE = blocksToDoc([
  { type: 'lead', text: '編輯器的示範。選取文字後按工具列。' },
  { type: 'h2', text: '小標題' },
  { type: 'p', text: '一般段落。可以加粗、斜體、連結和行內程式碼。' },
  { type: 'quote', text: '引言放在這裡。', attr: '出處' },
  { type: 'code', lang: 'ts', filename: 'demo.ts', code: 'const x = 1' },
])

const STYLE_ITEMS = [
  { value: 'paragraph', label: '段落', kbd: '⌘⌥0' },
  { value: 'lead', label: '前言' },
  'divider',
  { value: 'h2', label: '小標題', kbd: '⌘⌥2' },
  { value: 'h3', label: '次標題', kbd: '⌘⌥3' },
]

const ACTION_ITEMS = [
  { value: 'code', label: '程式碼' },
  { value: 'image', label: '圖片' },
  { value: 'slides', label: '圖片輪播' },
  { value: 'video', label: '影片' },
  'divider',
  { value: 'rule', label: '分隔線' },
]

function Replayable({ children }) {
  const [run, setRun] = useState(0)
  return (
    <>
      <button type="button" className="cl-replay" onClick={() => setRun((n) => n + 1)}>
        重播
      </button>
      <div key={run}>{children}</div>
    </>
  )
}

function ShatterDemo() {
  const canvas = useRef(null)
  useEffect(() => mountShatterImage(canvas.current, { src: seaImage, crop: [0, 389, 1280, 470] }), [])
  return <canvas ref={canvas} className="cl-shatter" aria-hidden />
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

function ActionMenuDemo() {
  const [last, setLast] = useState('')
  return (
    <div className="cl-box cl-box--row">
      <DropdownMenu label="插入" trigger="＋ 插入" items={ACTION_ITEMS} onSelect={setLast} />
      <span>{last ? `選了：${ACTION_ITEMS.find((i) => i.value === last)?.label}` : '打開選單選一個動作'}</span>
    </div>
  )
}

function PickerMenuDemo() {
  const [v, setV] = useState('paragraph')
  const label = STYLE_ITEMS.find((i) => i.value === v)?.label
  return (
    <div className="cl-box cl-box--row">
      <DropdownMenu label="段落樣式" trigger={`${label} ▾`} items={STYLE_ITEMS} value={v} onSelect={setV} />
    </div>
  )
}

// 123456 is the "right" code.
function SecretDemo({ length = 6, startInvalid = false }) {
  const [code, setCode] = useState('')
  const [wrong, setWrong] = useState(startInvalid)
  const right = '123456'.slice(0, length)
  return (
    <div className="cl-box cl-box--row">
      <SecretInput
        length={length}
        value={code}
        onChange={(v) => {
          setCode(v)
          setWrong(false)
        }}
        onComplete={(v) => {
          if (v === right) return
          setWrong(true)
          setCode('')
        }}
        invalid={wrong}
        label="示範密碼"
      />
      <span>{code.length === length ? '正確' : wrong ? '錯誤，再試一次' : `示範密碼 ${right}`}</span>
    </div>
  )
}

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

function EditorDemo() {
  const [doc, setDoc] = useState(EDITOR_SAMPLE)
  return (
    <div className="cl-editor">
      <div className="cl-editor__pane">
        <Editor doc={EDITOR_SAMPLE} onChange={setDoc} upload={async (file) => URL.createObjectURL(file)} />
      </div>
      <div className="journal-post__body cl-editor__preview">
        <RichText doc={doc} />
      </div>
    </div>
  )
}

const DEMOS = {
  code: () => <CodeCard lang="ts" filename="route.ts" code={SAMPLE_CODE} />,
  'code-shell': () => <CodeCard lang="bash" code={'# install and run\nnpm install\nnpm run dev'} />,
  'code-plain': () => <CodeCard lang="css" code={'.journal-card {\n  padding: var(--space-4);\n}'} />,
  image: () => <ImageCard src={heroImage} alt="示範：Hero 背景圖" caption="滿版" />,
  'image-frame': () => <ImageCard src={cutImage} alt="示範：人物去背圖" caption="frame" frame />,
  video: () => <VideoCard src={demoClip} caption="示範影片" />,
  'video-loop': () => <VideoCard src={demoClip} caption="播完重新播放" loop />,
  slides: () => (
    <SlidesCard
      slides={[
        { src: heroImage, alt: '示範：Hero 背景圖', caption: '第一張' },
        { src: seaImage, alt: '示範：Journal 頁尾的海浪', caption: '第二張' },
        { src: cutImage, alt: '示範：人物去背圖', caption: '第三張' },
      ]}
    />
  ),
  'menu-actions': () => <ActionMenuDemo />,
  'menu-picker': () => <PickerMenuDemo />,
  secret: () => <SecretDemo />,
  'secret-invalid': () => <SecretDemo startInvalid />,
  'secret-length': () => <SecretDemo length={4} />,
  otp: () => <OtpDemo />,
  postdoc: () => (
    <div className="journal-post__body doc-prose">
      <RichText doc={SAMPLE_DOC} />
    </div>
  ),
  editor: () => <EditorDemo />,
  fade: () => (
    <Replayable>
      <FadeIn className="cl-box">FadeIn</FadeIn>
    </Replayable>
  ),
  shatter: () => (
    <Replayable>
      <ShatterDemo />
    </Replayable>
  ),
  glyph: () => <GlyphDemo />,
}

/** Renders the live demo registered under `name`, or nothing. */
export function Demo({ name }) {
  const D = DEMOS[name]
  return D ? <D /> : null
}
