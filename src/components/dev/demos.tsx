// Live demos for the component pages. Each entry in componentLibrary.data.tsx names one by key.
// Demo data only: nothing here is real content, and nothing is sent anywhere.
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { ComponentProps, ComponentType, MouseEvent, ReactNode } from 'react'
import { CodeBlock } from '../CodeBlock.tsx'
import { ImageCard } from '../ImageCard.tsx'
import { RichText } from '../RichText.tsx'
import { Carousel } from '../Carousel.tsx'
import { Gallery } from '../Gallery.tsx'
import { FeaturedPhotos } from '../FeaturedPhotos.tsx'
import { VideoPlayer } from '../VideoPlayer.tsx'
import { DropdownMenu, type MenuItem } from '../DropdownMenu.tsx'
import { Button } from '../Button.tsx'
import { Card } from '../Card.tsx'
import { Drawer, DrawerBody, DrawerHeader } from '../Drawer.tsx'
import { Switch } from '../Switch.tsx'
import { TextArea } from '../TextArea.tsx'
import { TextField } from '../TextField.tsx'
import { TooltipGroup } from '../Tooltip.tsx'
import { OtpInput } from '../OtpInput.tsx'
import { Tag, TagList } from '../Tag.tsx'
import { ScrollShadow } from '../ScrollShadow.tsx'
import { Breadcrumbs, BreadcrumbsItem } from '../Breadcrumbs.tsx'
import { Accordion, AccordionItem } from '../Accordion.tsx'
import { Skeleton } from '../Skeleton.tsx'
import { Marquee } from '../Marquee.tsx'
import { ScrollStack } from '../ScrollStack.tsx'
import { blocksToDoc } from '../../lib/richText.ts'
import { mountGlyphField } from '../../lib/glyphField.ts'
import { mountGrainHaze } from '../../lib/grainHaze.ts'
import { mountMeasureLines } from '../../lib/measureLines.ts'
import '../../styles/work.css'
import { mountKoiPond } from '../../lib/koiPond.ts'
import { mountShatterImage } from '../../labs/shatter-footer/shatterImage.ts'
import { playWaterRipple } from '../../lib/waterRipple.ts'
import { SOUNDS } from '../../lib/uiSound.ts'
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

const STYLE_ITEMS: MenuItem[] = [
  { value: 'paragraph', label: '段落', kbd: '⌘⌥0' },
  { value: 'lead', label: '前言' },
  'divider',
  { value: 'h2', label: '小標題', kbd: '⌘⌥2' },
  { value: 'h3', label: '次標題', kbd: '⌘⌥3' },
]

const ACTION_ITEMS: MenuItem[] = [
  { value: 'code', label: '程式碼' },
  { value: 'image', label: '圖片' },
  { value: 'slides', label: '圖片輪播' },
  { value: 'video', label: '影片' },
  'divider',
  { value: 'rule', label: '分隔線' },
]

const labelOf = (items: MenuItem[], value: string) => {
  const hit = items.find((i) => i !== 'divider' && i.value === value)
  return hit && hit !== 'divider' ? hit.label : undefined
}

function Replayable({ children }: { children: ReactNode }) {
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
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = canvas.current
    return c ? mountShatterImage(c, { src: seaImage, crop: [0, 583, 1920, 705] }) : undefined
  }, [])
  return <canvas ref={canvas} className="cl-shatter" aria-hidden />
}

function RippleDemo() {
  const play = (e: MouseEvent<HTMLButtonElement>) => {
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
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = canvas.current
    return c ? mountGlyphField(c) : undefined
  }, [])
  return (
    <div className="cl-glyph">
      <canvas ref={canvas} className="journal-header__glyphs" aria-hidden />
    </div>
  )
}

function MeasureDemo() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const block = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const c = canvas.current
    const b = block.current
    return c && b ? mountMeasureLines(c, { block: b }) : undefined
  }, [])
  return (
    <div style={{ position: 'relative', zIndex: 0, width: '100%', padding: 'var(--space-12) 0' }}>
      <canvas ref={canvas} className="work-page-header__measure" aria-hidden />
      <div ref={block} style={{ margin: '0 var(--space-12)', fontFamily: 'var(--font-serif)', fontSize: 'var(--type-h1)' }}>
        Projects
      </div>
    </div>
  )
}

function KoiDemo() {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = canvas.current
    return c ? mountKoiPond(c) : undefined
  }, [])
  return (
    <div className="cl-glyph">
      <canvas ref={canvas} className="cl-koi" aria-hidden />
    </div>
  )
}

function HazeDemo() {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = canvas.current
    return c ? mountGrainHaze(c) : undefined
  }, [])
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
      <span>{last ? `選了：${labelOf(ACTION_ITEMS, last)}` : '打開選單選一個動作'}</span>
    </div>
  )
}

function PickerMenuDemo() {
  const [v, setV] = useState('paragraph')
  const label = labelOf(STYLE_ITEMS, v)
  return (
    <div className="cl-box cl-box--row">
      <DropdownMenu label="段落樣式" trigger={`${label} ▾`} items={STYLE_ITEMS} value={v} onSelect={setV} />
    </div>
  )
}

function OtpInputDemo({ length = 6, startInvalid = false }: { length?: number; startInvalid?: boolean }) {
  const [code, setCode] = useState('')
  const [wrong, setWrong] = useState(startInvalid)
  const [right] = useState(() => Array.from({ length }, () => Math.floor(Math.random() * 10)).join(''))
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
interface IoPaneProps {
  dir: 'in' | 'out'
  title: string
  meta: string
  className?: string
  children: ReactNode
}

function IoPane({ dir, title, meta, className = '', children }: IoPaneProps) {
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
const Editor = lazy(() => import('../Editor.tsx').then((m) => ({ default: m.Editor })))

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

const DEMOS: Record<string, ComponentType> = {
  code: () => <CodeBlock lang="ts" filename="route.ts" code={SAMPLE_CODE} />,
  'code-shell': () => <CodeBlock lang="bash" code={'# install and run\nnpm install\nnpm run dev'} />,
  'code-plain': () => <CodeBlock lang="css" code={'.journal-card {\n  padding: var(--space-4);\n}'} />,
  image: () => <ImageCard src={heroImage} alt="示範：Hero 背景圖" caption="滿版" />,
  'image-frame': () => <ImageCard src={cutImage} alt="示範：人物去背圖" caption="frame" frame />,
  video: () => <VideoPlayer src={demoClip} caption="示範影片" />,
  'video-loop': () => <VideoPlayer src={demoClip} caption="播完重新播放" loop />,
  slides: () => (
    <Carousel
      slides={[
        { src: heroImage, alt: '示範：Hero 背景圖', caption: '第一張' },
        { src: seaImage, alt: '示範：Shatter Footer 的海浪', caption: '第二張' },
        { src: cutImage, alt: '示範：人物去背圖', caption: '第三張' },
      ]}
    />
  ),
  gallery: () => (
    <Gallery
      photos={[
        { src: heroImage, alt: '示範：Hero 背景圖', caption: '第一張' },
        { src: cutImage, alt: '示範：人物去背圖' },
        { src: seaImage, alt: '示範：Shatter Footer 的海浪', caption: '第三張' },
        { src: seaImage, alt: '示範：Shatter Footer 的海浪' },
        { src: heroImage, alt: '示範：Hero 背景圖', caption: '第五張' },
        { src: cutImage, alt: '示範：人物去背圖', caption: '第六張' },
      ]}
    />
  ),
  'featured-photos': () => (
    <FeaturedPhotos
      title="示範作品"
      text={'創作者姓名\n一兩句說明，寫這件作品在做什麼。'}
      photos={[
        { src: heroImage, alt: '示範：Hero 背景圖' },
        { src: seaImage, alt: '示範：Shatter Footer 的海浪' },
        { src: cutImage, alt: '示範：人物去背圖' },
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
  measure: () => <MeasureDemo />,
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
  'scroll-stack': () => (
    <div
      style={{
        width: '100%',
        height: 420,
        overflowY: 'auto',
        '--scroll-stack-width': '360px',
        '--scroll-stack-height': '240px',
        '--scroll-stack-top': 'var(--space-12)',
        '--scroll-stack-gap': 'var(--space-24)',
      }}
    >
      <ScrollStack>
        {['01', '02', '03', '04', '05'].map((n) => (
          <div
            key={n}
            style={{
              display: 'grid',
              placeItems: 'center',
              height: '100%',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface-2)',
              boxShadow: 'inset 0 0 0 1px var(--line-strong)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-label)',
            }}
          >
            {n}
          </div>
        ))}
      </ScrollStack>
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
        {SKELETON_TYPES.map(([type, label]) => (
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

const SKELETON_TYPES: ['shimmer' | 'pulse' | 'none', string][] = [
  ['shimmer', 'Shimmer'],
  ['pulse', 'Pulse'],
  ['none', 'None'],
]

const ACCORDION_DEMO = [
  ['stack', '網站用什麼做的？', '示範文字：Vite、React 和 Cloudflare Pages，文章存在 R2。'],
  ['update', '多久更新一次？', '示範文字：想到就寫，沒有固定的頻率。'],
  ['contact', '怎麼聯絡？', '示範文字：頁尾有 Email 和 Instagram。'],
]

function AccordionDemo({ disabledId, ...props }: { disabledId?: string } & Omit<ComponentProps<typeof Accordion>, 'children'>) {
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
  const [tag, setTag] = useState<string | null>(null)
  const tags: [string, number][] = [['AI', 2], ['MARKETING', 1], ['ENGINEERING', 1]]
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
export function Demo({ name }: { name: string }) {
  const D = DEMOS[name]
  return D ? <D /> : null
}
