// Live demos for the component pages. Each entry in componentLibrary.data.js names one by key.
// Demo data only: nothing here is real content, and nothing is sent anywhere.
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { CodeCard } from '../CodeCard.jsx'
import { ImageCard } from '../ImageCard.jsx'
import { RichText } from '../RichText.jsx'
import { SlidesCard } from '../SlidesCard.jsx'
import { VideoCard } from '../VideoCard.jsx'
import { DropdownMenu } from '../DropdownMenu.jsx'
import { Button } from '../Button.jsx'
import { Card } from '../Card.jsx'
import { Drawer, DrawerBody, DrawerHeader } from '../Drawer.jsx'
import { Switch } from '../Switch.jsx'
import { TextArea } from '../TextArea.jsx'
import { TextField } from '../TextField.jsx'
import { TooltipGroup } from '../Tooltip.jsx'
import { OtpInput } from '../OtpInput.jsx'
import { Tag, TagList } from '../Tag.jsx'
import { ScrollShadow } from '../ScrollShadow.jsx'
import { Breadcrumbs, BreadcrumbsItem } from '../Breadcrumbs.jsx'
import { Accordion, AccordionItem } from '../Accordion.jsx'
import { Skeleton } from '../Skeleton.jsx'
import { Marquee } from '../Marquee.jsx'
import { blocksToDoc } from '../../lib/richText.js'
import { mountGlyphField } from '../../lib/glyphField.js'
import { mountGrainHaze } from '../../lib/grainHaze.js'
import { mountKoiPond } from '../../lib/koiPond.js'
import { mountShatterImage } from '../../labs/shatter-footer/shatterImage.js'
import { playWaterRipple } from '../../lib/waterRipple.js'
import { SOUNDS } from '../../lib/uiSound.js'
import heroImage from '../../labs/living-portrait/bg.webp'
import cutImage from '../../labs/living-portrait/cut.webp'
import seaImage from '../../labs/shatter-footer/sea.webp'
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

const EDITOR_SAMPLE = blocksToDoc([
  { type: 'lead', text: '編輯器的示範，選取文字後按工具列。' },
  { type: 'h2', text: '小標題' },
  { type: 'p', text: '一般段落，可以加粗、斜體、連結和行內程式碼。' },
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
  useEffect(() => mountShatterImage(canvas.current, { src: seaImage, crop: [0, 583, 1920, 705] }), [])
  return <canvas ref={canvas} className="cl-shatter" aria-hidden />
}

function RippleDemo() {
  const play = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const fromPointer = e.detail > 0
    playWaterRipple(fromPointer ? e.clientX : r.left + r.width / 2, fromPointer ? e.clientY : r.top + r.height / 2)
  }
  return (
    <button type="button" className="cl-box cl-ripple" onClick={play}>
      在這裡點一下
    </button>
  )
}

// One button per sound. data-sound picks it, the same way a real button would (App's click listener plays it).
function SoundDemo() {
  return (
    <div className="cl-sounds">
      {Object.keys(SOUNDS).map((name) => (
        <Button key={name} variant="ghost" data-sound={name}>
          {name}
        </Button>
      ))}
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

function KoiDemo() {
  const canvas = useRef(null)
  useEffect(() => mountKoiPond(canvas.current), [])
  return (
    <div className="cl-glyph">
      <canvas ref={canvas} className="cl-koi" aria-hidden />
    </div>
  )
}

function HazeDemo() {
  const canvas = useRef(null)
  useEffect(() => mountGrainHaze(canvas.current), [])
  return (
    <div className="cl-glyph">
      <canvas ref={canvas} className="cl-koi" aria-hidden />
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
function OtpInputDemo({ length = 6, startInvalid = false }) {
  const [code, setCode] = useState('')
  const [wrong, setWrong] = useState(startInvalid)
  const right = '123456'.slice(0, length)
  return (
    <div className="cl-box cl-box--row">
      <OtpInput
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

function FieldsDemo() {
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  return (
    <div className="cl-box cl-fields">
      <TextField value={title} onChange={setTitle} placeholder="文章標題" aria-label="文章標題" />
      <TextArea value={excerpt} onChange={setExcerpt} placeholder="摘要，輸入多行時會長高" aria-label="摘要" />
    </div>
  )
}

function SwitchDemo() {
  const [on, setOn] = useState(false)
  return (
    <div className="cl-box cl-box--row">
      <Switch checked={on} onChange={setOn} label="重複播放" />
      <span>重複播放：{on ? '開' : '關'}</span>
    </div>
  )
}

function DrawerDemo() {
  const [open, setOpen] = useState(false)
  return (
    <div className="cl-box">
      <Button variant="ghost" onClick={() => setOpen(true)}>
        打開 Drawer
      </Button>
      <Drawer open={open} label="示範面板">
        <DrawerHeader title="示範面板" subtitle="Drawer">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            關閉
          </Button>
        </DrawerHeader>
        <DrawerBody>
          <p className="cl-drawer-text">內容放在 DrawerBody，太長時在這裡捲動。</p>
        </DrawerBody>
      </Drawer>
    </div>
  )
}

// One pane of the editor demo: a header with a direction icon, then the content.
function IoPane({ dir, title, meta, className = '', children }) {
  return (
    <section className="cl-editor__pane" aria-label={title}>
      <header className="cl-editor__head">
        <span className="cl-editor__icon" aria-hidden>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4">
            {dir === 'in' ? (
              <path d="M1.5 5h7M5.5 2l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M8.5 5h-7M4.5 2l-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </span>
        <span className="cl-editor__title">{title}</span>
        <code className="cl-editor__meta">{meta}</code>
      </header>
      <div className={`cl-editor__body ${className}`}>{children}</div>
    </section>
  )
}

// Tiptap loads only on the Editor page, not on every Component Library page.
const Editor = lazy(() => import('../Editor.jsx').then((m) => ({ default: m.Editor })))

// Input (what the editor holds) on the left, output (how RichText shows it) on the right.
function EditorDemo() {
  const [doc, setDoc] = useState(EDITOR_SAMPLE)
  return (
    <div className="cl-editor">
      <IoPane dir="in" title="Input" meta="Editor" className="journal-post__body doc-prose">
        <Suspense fallback={null}>
          <Editor doc={EDITOR_SAMPLE} onChange={setDoc} upload={async (file) => URL.createObjectURL(file)} />
        </Suspense>
      </IoPane>
      <IoPane dir="out" title="Output" meta="RichText" className="journal-post__body doc-prose">
        <RichText doc={doc} />
      </IoPane>
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
        { src: seaImage, alt: '示範：Shatter Footer 的海浪', caption: '第二張' },
        { src: cutImage, alt: '示範：人物去背圖', caption: '第三張' },
      ]}
    />
  ),
  'menu-actions': () => <ActionMenuDemo />,
  'menu-picker': () => <PickerMenuDemo />,
  'otp-input': () => <OtpInputDemo />,
  'otp-input-invalid': () => <OtpInputDemo startInvalid />,
  'otp-input-length': () => <OtpInputDemo length={4} />,
  drawer: () => <DrawerDemo />,
  editor: () => <EditorDemo />,
  card: () => (
    <div className="cl-box">
      <Card className="cl-card">Card</Card>
    </div>
  ),
  button: () => (
    <div className="cl-box cl-box--row">
      <Button>儲存</Button>
      <Button variant="ghost">登出</Button>
      <Button variant="icon" aria-label="更多">
        ⋯
      </Button>
      <Button disabled>儲存</Button>
      <Button variant="overlay" aria-label="返回">
        ←
      </Button>
    </div>
  ),
  tooltip: () => (
    <div className="cl-box">
      <TooltipGroup className="cl-tips" role="toolbar" aria-label="示範工具列">
        <Button variant="icon" aria-label="粗體" data-tip="粗體" data-kbd="Ctrl B">
          <b>B</b>
        </Button>
        <Button variant="icon" aria-label="斜體" data-tip="斜體" data-kbd="Ctrl I">
          <i>I</i>
        </Button>
        <Button variant="icon" aria-label="連結" data-tip="連結">
          ↗
        </Button>
      </TooltipGroup>
    </div>
  ),
  'text-field': () => <FieldsDemo />,
  switch: () => <SwitchDemo />,
  fade: () => (
    <Replayable>
      <div className="fade-in cl-box">.fade-in</div>
    </Replayable>
  ),
  shatter: () => (
    <Replayable>
      <ShatterDemo />
    </Replayable>
  ),
  glyph: () => <GlyphDemo />,
  koi: () => <KoiDemo />,
  haze: () => <HazeDemo />,
  ripple: () => <RippleDemo />,
  sounds: () => <SoundDemo />,
  tag: () => <TagList tags={['AI', 'MARKETING', 'ENGINEERING']} />,
  'tag-outline': () => <TagList tags={['WEB DESIGN', 'EXHIBITION']} variant="outline" />,
  'tag-filter': () => <TagFilterDemo />,
  breadcrumbs: () => (
    <Breadcrumbs label="導覽路徑">
      <BreadcrumbsItem href="/">首頁</BreadcrumbsItem>
      <BreadcrumbsItem href="/journal">Journal</BreadcrumbsItem>
      <BreadcrumbsItem>示範文章的標題</BreadcrumbsItem>
    </Breadcrumbs>
  ),
  'breadcrumbs-levels': () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {[['Work'], ['Work', 'Matsu Biennial'], ['Work', 'Matsu Biennial', '展場']].map((levels) => (
        <Breadcrumbs key={levels.join()} label="導覽路徑">
          <BreadcrumbsItem href="/">首頁</BreadcrumbsItem>
          {levels.map((l, i) =>
            i < levels.length - 1 ? (
              <BreadcrumbsItem key={l} href="/work">
                {l}
              </BreadcrumbsItem>
            ) : (
              <BreadcrumbsItem key={l}>{l}</BreadcrumbsItem>
            ),
          )}
        </Breadcrumbs>
      ))}
    </div>
  ),
  'breadcrumbs-separator': () => (
    <Breadcrumbs label="導覽路徑" separator="/">
      <BreadcrumbsItem href="/">首頁</BreadcrumbsItem>
      <BreadcrumbsItem href="/journal">Journal</BreadcrumbsItem>
      <BreadcrumbsItem>文章</BreadcrumbsItem>
    </Breadcrumbs>
  ),
  marquee: () => (
    <div style={{ display: 'grid', gap: 'var(--space-8)', width: '100%' }}>
      <Marquee items={['LG', 'GQ', 'Starbucks', 'Hahow', 'W Hotel']} />
      <Marquee items={['AUO', 'PTS', 'TAICCA', 'Uni-President']} reverse />
    </div>
  ),
  accordion: () => <AccordionDemo />,
  'accordion-surface': () => <AccordionDemo variant="surface" />,
  'accordion-no-separator': () => <AccordionDemo hideSeparator />,
  'accordion-multiple': () => <AccordionDemo multiple defaultOpen={['stack', 'update']} />,
  'accordion-disabled': () => <AccordionDemo disabledId="contact" />,
  'scroll-shadow': () => (
    <div className="cl-stage">
      <div className="cl-ss-usage">
        <ScrollShadow className="cl-ss-usage__box">
          <div className="cl-ss-usage__text">
            {Array.from({ length: 10 }, (_, i) => (
              <p key={i}>
                第 {i + 1} 段示範文字。這是一段用來撐出捲動高度的內容，沒有實際意義。往下捲動時，上緣開始淡出；捲到最下面時，下緣的淡出消失。內容不夠長、不需要捲動時，兩邊都不淡出。
              </p>
            ))}
          </div>
        </ScrollShadow>
      </div>
    </div>
  ),
  skeleton: () => (
    <div className="cl-stage">
      <div className="cl-sk-panel cl-sk-card" role="status" aria-label="載入中">
        <Skeleton className="cl-sk-r8" style={{ height: 128 }} />
        <div className="cl-sk-stack">
          <Skeleton className="cl-sk-r8" style={{ height: 12, width: '60%' }} />
          <Skeleton className="cl-sk-r8" style={{ height: 12, width: '80%' }} />
          <Skeleton className="cl-sk-r8" style={{ height: 12, width: '40%' }} />
        </div>
      </div>
    </div>
  ),
  'skeleton-text': () => (
    <div className="cl-stage">
      <div className="cl-sk-stack cl-sk-text" role="status" aria-label="載入中">
        {['100%', '83%', '67%', '100%', '50%'].map((w, i) => (
          <Skeleton key={i} style={{ height: 16, width: w }} />
        ))}
      </div>
    </div>
  ),
  'skeleton-list': () => (
    <div className="cl-stage">
      <div className="cl-sk-list" role="status" aria-label="載入中">
        {[1, 2, 3].map((i) => (
          <div key={i} className="cl-sk-item">
            <Skeleton className="cl-sk-r8" style={{ height: 40, width: 40, flexShrink: 0 }} />
            <div>
              <Skeleton style={{ height: 12, width: '100%' }} />
              <Skeleton style={{ height: 12, width: '80%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  'skeleton-types': () => (
    <div className="cl-stage">
      <div className="cl-sk-types">
        {[
          ['shimmer', 'Shimmer'],
          ['pulse', 'Pulse'],
          ['none', 'None'],
        ].map(([type, label]) => (
          <div key={type}>
            <p className="cl-sk-type-label">{label}</p>
            <div className="cl-sk-panel cl-sk-stack">
              <Skeleton animation={type} className="cl-sk-r8" style={{ height: 80 }} />
              <Skeleton animation={type} className="cl-sk-r8" style={{ height: 12, width: '60%' }} />
              <Skeleton animation={type} className="cl-sk-r8" style={{ height: 12, width: '80%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
}

const ACCORDION_DEMO = [
  ['stack', '網站用什麼做的？', '示範文字：Vite、React 和 Cloudflare Pages，文章存在 R2。'],
  ['update', '多久更新一次？', '示範文字：想到就寫，沒有固定的頻率。'],
  ['contact', '怎麼聯絡？', '示範文字：頁尾有 Email 和 Instagram。'],
]

function AccordionDemo({ disabledId, ...props }) {
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <Accordion {...props}>
        {ACCORDION_DEMO.map(([id, title, body]) => (
          <AccordionItem key={id} id={id} title={title} disabled={id === disabledId}>
            {body}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

function TagFilterDemo() {
  const [tag, setTag] = useState(null)
  const tags = [['AI', 2], ['MARKETING', 1], ['ENGINEERING', 1]]
  return (
    <div className="tag-group" role="group" aria-label="依標籤篩選">
      <Tag count={4} selected={!tag} onClick={() => setTag(null)}>
        全部
      </Tag>
      {tags.map(([name, count]) => (
        <Tag key={name} count={count} selected={tag === name} onClick={() => setTag(tag === name ? null : name)}>
          {name}
        </Tag>
      ))}
    </div>
  )
}

/** Renders the live demo registered under `name`, or nothing. */
export function Demo({ name }) {
  const D = DEMOS[name]
  return D ? <D /> : null
}
