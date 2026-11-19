// Rich-text editor (Tiptap): toolbar, card node views and the document schema, in one file.
// Outputs the document format that RichText renders (see src/lib/richText.js).
import { useEffect, useRef, useState } from 'react'
import Blockquote from '@tiptap/extension-blockquote'
import CodeBlock from '@tiptap/extension-code-block'
import { Placeholder } from '@tiptap/extensions'
import { EditorContent, mergeAttributes, Node, NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { DropdownMenu } from './DropdownMenu.jsx'
import { Switch } from './SidePanel.jsx'
import { safeHref } from '../lib/richText.js'

// ── Card node views ──

// In-editor views for the custom journal nodes (see extensions.js).
// Text inside quotes and code is edited in place; card settings use small fields on the card.

const MAX_IMAGE_BYTES = 1024 * 1024 // functions/api/upload.js rejects larger files
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Same limits as functions/api/upload.js; checked here so Wade gets the reason at once.
function imageError(file) {
  if (!IMAGE_TYPES.includes(file.type)) return '只支援 JPG、PNG、WEBP'
  if (file.size > MAX_IMAGE_BYTES) return '檔案超過 1MB'
  return ''
}

function CardField({ label, value, onChange, placeholder }) {
  return (
    <input
      className="cms-ed-field"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label}
    />
  )
}

function QuoteView({ node, updateAttributes }) {
  return (
    <NodeViewWrapper as="blockquote" className="cms-ed-quote">
      <NodeViewContent className="cms-ed-quote__text" />
      <div contentEditable={false} className="cms-ed-quote__cite">
        <CardField
          label="引言出處"
          value={node.attrs.cite}
          onChange={(cite) => updateAttributes({ cite })}
          placeholder="──出處（選填）"
        />
      </div>
    </NodeViewWrapper>
  )
}

function CodeBlockView({ node, updateAttributes }) {
  return (
    <NodeViewWrapper className="cms-ed-code">
      <div contentEditable={false} className="cms-ed-code__bar">
        <CardField label="程式語言" value={node.attrs.language} onChange={(language) => updateAttributes({ language })} placeholder="ts" />
        <CardField label="檔名" value={node.attrs.filename} onChange={(filename) => updateAttributes({ filename })} placeholder="檔名（選填）" />
      </div>
      <pre spellCheck={false}>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}

function CardShell({ title, selected, deleteNode, children }) {
  return (
    <NodeViewWrapper className="cms-ed-card" data-selected={selected || undefined}>
      <div contentEditable={false}>
        <div className="cms-ed-card__head" data-drag-handle>
          <span className="cms-ed-card__title">{title}</span>
          <button type="button" className="cms-icon cms-icon--danger" onClick={deleteNode} aria-label={`刪除${title}`}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </NodeViewWrapper>
  )
}

function ImageCardView({ node, updateAttributes, deleteNode, selected, extension }) {
  const a = node.attrs
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function upload(file) {
    if (!file) return
    const bad = imageError(file)
    setErr(bad)
    if (bad) return
    setBusy(true)
    try {
      updateAttributes({ src: await extension.options.upload(file) })
    } catch (e) {
      setErr(e.message || '上傳失敗')
    } finally {
      setBusy(false)
    }
  }

  return (
    <CardShell title="圖片" selected={selected} deleteNode={deleteNode}>
      {a.src ? <img className="cms-ed-card__preview" src={a.src} alt="" /> : null}
      <div className="cms-ed-card__row">
        <CardField label="圖片網址" value={a.src} onChange={(src) => updateAttributes({ src })} placeholder="圖片網址，或按右邊上傳" />
        <label className="cms-btn cms-btn--ghost cms-upload">
          {busy ? '上傳中' : '上傳'}
          <input type="file" accept={IMAGE_TYPES.join(',')} hidden onChange={(e) => upload(e.target.files?.[0])} />
        </label>
      </div>
      {err ? <div className="cms-row__error">{err}</div> : null}
      <CardField label="替代文字" value={a.alt} onChange={(alt) => updateAttributes({ alt })} placeholder="替代文字（必填，說明圖片內容）" />
      <CardField label="圖說" value={a.caption} onChange={(caption) => updateAttributes({ caption })} placeholder="圖說（選填）" />
      <label className="cms-check">
        <Switch checked={a.frame} onChange={(frame) => updateAttributes({ frame })} label="小圖置中" />
        小圖置中（手機截圖用）
      </label>
    </CardShell>
  )
}

function VideoCardView({ node, updateAttributes, deleteNode, selected }) {
  const a = node.attrs
  return (
    <CardShell title="影片" selected={selected} deleteNode={deleteNode}>
      <CardField label="影片網址" value={a.src} onChange={(src) => updateAttributes({ src })} placeholder="影片網址（mp4）" />
      <CardField label="封面圖網址" value={a.poster} onChange={(poster) => updateAttributes({ poster })} placeholder="封面圖網址（選填）" />
      <CardField label="影片說明" value={a.caption} onChange={(caption) => updateAttributes({ caption })} placeholder="說明（選填）" />
      <label className="cms-check">
        <Switch checked={a.loop} onChange={(loop) => updateAttributes({ loop })} label="重複播放" />
        重複播放
      </label>
    </CardShell>
  )
}

function SlidesCardView({ node, updateAttributes, deleteNode, selected, extension }) {
  const slides = node.attrs.slides ?? []
  const [busy, setBusy] = useState(-1)
  const [err, setErr] = useState('')
  const setSlides = (next) => updateAttributes({ slides: next })
  const setSlide = (i, patch) => setSlides(slides.map((s, j) => (j === i ? { ...s, ...patch } : s)))

  async function upload(i, file) {
    if (!file) return
    const bad = imageError(file)
    setErr(bad)
    if (bad) return
    setBusy(i)
    try {
      setSlide(i, { src: await extension.options.upload(file) })
    } catch (e) {
      setErr(e.message || '上傳失敗')
    } finally {
      setBusy(-1)
    }
  }

  return (
    <CardShell title={`圖片輪播 · ${slides.length} 張`} selected={selected} deleteNode={deleteNode}>
      {slides.map((s, i) => (
        <div className="cms-ed-slide" key={i}>
          {s.src ? <img className="cms-ed-slide__thumb" src={s.src} alt="" /> : <span className="cms-ed-slide__thumb" />}
          <div className="cms-ed-slide__fields">
            <div className="cms-ed-card__row">
              <CardField label={`第 ${i + 1} 張的圖片網址`} value={s.src} onChange={(src) => setSlide(i, { src })} placeholder="圖片網址，或按右邊上傳" />
              <label className="cms-btn cms-btn--ghost cms-upload">
                {busy === i ? '上傳中' : '上傳'}
                <input type="file" accept={IMAGE_TYPES.join(',')} hidden onChange={(e) => upload(i, e.target.files?.[0])} />
              </label>
              <button
                type="button"
                className="cms-icon cms-icon--danger"
                onClick={() => setSlides(slides.filter((_, j) => j !== i))}
                aria-label={`刪除第 ${i + 1} 張`}
              >
                ✕
              </button>
            </div>
            <CardField label={`第 ${i + 1} 張的替代文字`} value={s.alt} onChange={(alt) => setSlide(i, { alt })} placeholder="替代文字（必填）" />
            <CardField label={`第 ${i + 1} 張的圖說`} value={s.caption} onChange={(caption) => setSlide(i, { caption })} placeholder="圖說（選填）" />
          </div>
        </div>
      ))}
      {err ? <div className="cms-row__error">{err}</div> : null}
      <button type="button" className="cms-btn cms-btn--ghost cms-ed-slide__add" onClick={() => setSlides([...slides, { src: '', alt: '', caption: '' }])}>
        ＋ 新增一張
      </button>
    </CardShell>
  )
}

// ── Schema ──

// Tiptap extensions for the journal editor. The node names and attributes match src/lib/richText.js,
// which documents the stored format, and RichText.jsx, which renders it on the site.

const attr = (name, fallback = '') => ({
  [name]: {
    default: fallback,
    parseHTML: (el) => el.getAttribute(`data-${name}`) ?? fallback,
    renderHTML: (attrs) => ({ [`data-${name}`]: attrs[name] }),
  },
})

/** The opening paragraph of a post, set larger. */
const Lead = Node.create({
  name: 'lead',
  group: 'block',
  content: 'inline*',
  parseHTML: () => [{ tag: 'p.lead' }],
  renderHTML: ({ HTMLAttributes }) => ['p', mergeAttributes(HTMLAttributes, { class: 'lead' }), 0],
  addCommands() {
    return { setLead: () => ({ commands }) => commands.setNode(this.name) }
  },
})

/** A quote with an optional source line. */
const Quote = Blockquote.extend({
  addAttributes: () => attr('cite'),
  addNodeView: () => ReactNodeViewRenderer(QuoteView),
})

/** A code card: language and an optional file name in its header. */
const CodeCardBlock = CodeBlock.extend({
  addAttributes() {
    return { ...this.parent?.(), ...attr('filename') }
  },
  addNodeView: () => ReactNodeViewRenderer(CodeBlockView),
}).configure({ defaultLanguage: 'ts' })

function card(name, attrs, view) {
  return Node.create({
    name,
    group: 'block',
    atom: true,
    draggable: true,
    addOptions: () => ({ upload: null }),
    addAttributes: () => Object.assign({}, ...Object.entries(attrs).map(([k, v]) => attr(k, v))),
    parseHTML: () => [{ tag: `div[data-type="${name}"]` }],
    renderHTML: ({ HTMLAttributes }) => ['div', mergeAttributes(HTMLAttributes, { 'data-type': name })],
    addNodeView: () => ReactNodeViewRenderer(view),
  })
}

const ImageCard = card('imageCard', { src: '', alt: '', caption: '', frame: false }, ImageCardView)

/** An image carousel. `slides` is a list, so it goes through HTML as JSON. */
const SlidesCard = card('slidesCard', {}, SlidesCardView).extend({
  addAttributes: () => ({
    slides: {
      default: [],
      parseHTML: (el) => {
        try {
          return JSON.parse(el.getAttribute('data-slides') || '[]')
        } catch {
          return []
        }
      },
      renderHTML: (attrs) => ({ 'data-slides': JSON.stringify(attrs.slides ?? []) }),
    },
  }),
})
const VideoCard = card('videoCard', { src: '', poster: '', caption: '', loop: false }, VideoCardView)

/**
 * @param {{ upload: (file: File) => Promise<string>, placeholder: string }} opts
 *   upload stores an image and returns its URL.
 */
function editorExtensions({ upload, placeholder }) {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      blockquote: false,
      codeBlock: false,
      link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
    }),
    Lead,
    Quote,
    CodeCardBlock,
    ImageCard.configure({ upload }),
    SlidesCard.configure({ upload }),
    VideoCard,
    Placeholder.configure({ placeholder }),
  ]
}

// ── Editor ──

/**
 * Rich-text editor for a post body, with a Framer-style toolbar.
 * The document is the editor's own JSON (src/lib/richText.js). It is read once on mount;
 * remount with a new key to load a different post.
 * @param {{ doc: object, onChange: (doc: object) => void, upload: (file: File) => Promise<string> }} props
 */
export function Editor({ doc, onChange, upload }) {
  const change = useRef(onChange)
  useEffect(() => {
    change.current = onChange
  })

  // The editor keeps the upload it was created with. That is fine: it unmounts when the login changes.
  const editor = useEditor({
    extensions: editorExtensions({ upload, placeholder: '開始寫……' }),
    content: doc,
    immediatelyRender: true,
    editorProps: { attributes: { class: 'cms-ed-content', 'aria-label': '內文', spellcheck: 'false' } },
    onUpdate: ({ editor: e }) => change.current(e.getJSON()),
  })

  return (
    <div>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

const MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
const MOD = MAC ? '⌘' : 'Ctrl '
const ALT = MAC ? '⌥' : 'Alt '
const SHIFT = MAC ? '⇧' : 'Shift '
// Tiptap's own shortcuts, shown in the tooltips.
const KEYS = {
  bold: `${MOD}B`,
  italic: `${MOD}I`,
  underline: `${MOD}U`,
  code: `${MOD}E`,
  quote: `${MOD}${SHIFT}B`,
  bullet: `${MOD}${SHIFT}8`,
  ordered: `${MOD}${SHIFT}7`,
}

// Warm tooltips (after React Bits "Warm Tooltip"): the first tooltip waits, then while the bar is "warm"
// the same tooltip slides to the next button at once.
const TIP_DELAY = 400
const TIP_WARM = 300

const ICON = {
  paragraph: <Glyph d="M7 3h6M10 3v10M7 3a3 3 0 000 6h3" />,
  lead: <Glyph d="M3 4h10M3 8h10M3 12h6" />,
  h2: <Glyph d="M3 3v10M9 3v10M3 8h6M12 9.5a1.5 1.5 0 113 0c0 1-3 2-3 3.5h3" small />,
  h3: <Glyph d="M3 3v10M9 3v10M3 8h6M12 8.5a1.5 1.2 0 113 .3c0 .7-1.5.7-1.5.7s1.5 0 1.5 .8a1.5 1.2 0 01-3 .2" small />,
  code: <Glyph d="M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5" />,
  image: <Glyph d="M2.5 3.5h11v9h-11zM2.5 10.5l3-3 3 3 2-2 3 3" />,
  slides: <Glyph d="M4.5 4.5h7v7h-7zM2 6v4M14 6v4" />,
  video: <Glyph d="M2.5 4h8v8h-8zM10.5 7l3-2v6l-3-2" />,
  hr: <Glyph d="M2 8h12" />,
}

const STYLES = [
  { value: 'paragraph', label: '段落', icon: ICON.paragraph, kbd: `${MOD}${ALT}0` },
  { value: 'lead', label: '前言', icon: ICON.lead },
  { value: 'h2', label: '小標題', icon: ICON.h2, kbd: `${MOD}${ALT}2` },
  { value: 'h3', label: '次標題', icon: ICON.h3, kbd: `${MOD}${ALT}3` },
]
const STYLE_LABEL = Object.fromEntries(STYLES.map((x) => [x.value, x.label]))

const INSERTS = [
  { value: 'code', label: '程式碼', icon: ICON.code },
  { value: 'image', label: '圖片', icon: ICON.image },
  { value: 'slides', label: '圖片輪播', icon: ICON.slides },
  { value: 'video', label: '影片', icon: ICON.video },
  'divider',
  { value: 'hr', label: '分隔線', icon: ICON.hr },
]

function useWarmTooltip() {
  const bar = useRef(null)
  const timer = useRef(0)
  const warmUntil = useRef(0)
  const [tip, setTip] = useState(null) // { text, kbd, x, travel }

  useEffect(() => () => clearTimeout(timer.current), [])

  const place = (el) => {
    const b = bar.current.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    setTip((t) => ({ text: el.dataset.tip, kbd: el.dataset.kbd, x: r.left - b.left + r.width / 2, travel: Boolean(t) }))
  }
  const hide = () => {
    clearTimeout(timer.current)
    if (tip) warmUntil.current = performance.now() + TIP_WARM
    setTip(null)
  }
  const over = (e) => {
    const el = e.target.closest('[data-tip]')
    if (!el || el.dataset.tip === tip?.text) return
    clearTimeout(timer.current)
    if (tip || performance.now() < warmUntil.current) place(el)
    else timer.current = setTimeout(() => place(el), TIP_DELAY)
  }
  const focus = (e) => {
    const el = e.target.closest('[data-tip]')
    if (el) place(el)
  }

  return {
    bar,
    tip,
    barProps: { ref: bar, onPointerOver: over, onPointerLeave: hide, onFocus: focus, onBlur: hide, onPointerDown: hide },
  }
}

function Toolbar({ editor }) {
  const { tip, barProps } = useWarmTooltip()
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      style: e.isActive('lead')
        ? 'lead'
        : e.isActive('heading', { level: 2 })
          ? 'h2'
          : e.isActive('heading', { level: 3 })
            ? 'h3'
            : 'paragraph',
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      code: e.isActive('code'),
      link: e.isActive('link'),
      quote: e.isActive('blockquote'),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
    }),
  })

  const run = () => editor.chain().focus()

  const setStyle = (v) => {
    if (v === 'lead') run().setLead().run()
    else if (v === 'h2') run().setHeading({ level: 2 }).run()
    else if (v === 'h3') run().setHeading({ level: 3 }).run()
    else run().setParagraph().run()
  }

  const insert = (kind) => {
    if (kind === 'code') run().setCodeBlock({ language: 'ts' }).run()
    else if (kind === 'hr') run().setHorizontalRule().run()
    else run().insertContent({ type: { image: 'imageCard', slides: 'slidesCard', video: 'videoCard' }[kind] }).run()
  }

  const link = () => {
    if (s.link) return run().unsetLink().run()
    const input = window.prompt('連結網址', 'https://')
    if (input === null) return
    const href = safeHref(input)
    if (!href) return window.alert('這個網址不能用，請用 https://、mailto: 或 / 開頭的網址。')
    run().extendMarkRange('link').setLink({ href }).run()
  }

  return (
    <div className="cms-ed-bar" role="toolbar" aria-label="文字格式" {...barProps}>
      <DropdownMenu label="插入" tip="插入" trigger={<PlusIcon />} items={INSERTS} onSelect={insert} triggerClassName="cms-ed-btn" />
      <DropdownMenu
        label="段落樣式"
        tip="段落樣式"
        triggerClassName="cms-ed-style"
        trigger={
          <>
            {STYLE_LABEL[s.style]}
            <ChevronDown />
          </>
        }
        items={STYLES}
        value={s.style}
        onSelect={setStyle}
      />
      <span className="cms-ed-sep" aria-hidden />
      <Btn label="粗體" kbd={KEYS.bold} on={s.bold} onClick={() => run().toggleBold().run()}>
        <b>B</b>
      </Btn>
      <Btn label="斜體" kbd={KEYS.italic} on={s.italic} onClick={() => run().toggleItalic().run()}>
        <i>I</i>
      </Btn>
      <Btn label="底線" kbd={KEYS.underline} on={s.underline} onClick={() => run().toggleUnderline().run()}>
        <u>U</u>
      </Btn>
      <Btn label="連結" on={s.link} onClick={link}>
        <LinkIcon />
      </Btn>
      <Btn label="引言" kbd={KEYS.quote} on={s.quote} onClick={() => run().toggleBlockquote().run()}>
        ❝
      </Btn>
      <Btn label="行內程式碼" kbd={KEYS.code} on={s.code} onClick={() => run().toggleCode().run()}>
        {'<>'}
      </Btn>
      <Btn label="項目清單" kbd={KEYS.bullet} on={s.bullet} onClick={() => run().toggleBulletList().run()}>
        <ListIcon />
      </Btn>
      <Btn label="編號清單" kbd={KEYS.ordered} on={s.ordered} onClick={() => run().toggleOrderedList().run()}>
        <OrderedIcon />
      </Btn>
      {tip ? (
        <div className="cms-ed-tip" role="tooltip" style={{ '--x': `${tip.x}px` }} data-travel={tip.travel || undefined}>
          {tip.text}
          {tip.kbd ? <kbd>{tip.kbd}</kbd> : null}
        </div>
      ) : null}
    </div>
  )
}

function Btn({ on, label, kbd, onClick, children }) {
  return (
    <button
      type="button"
      className="cms-ed-btn"
      aria-label={label}
      aria-pressed={on}
      aria-keyshortcuts={kbd?.replace('⌘', 'Meta+').replace('Ctrl ', 'Control+').replace(/⇧|Shift /, 'Shift+')}
      data-tip={label}
      data-kbd={kbd}
      onMouseDown={(e) => e.preventDefault()} // keep the text selection
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function Glyph({ d, small = false }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={small ? 1.2 : 1.4} aria-hidden>
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M6.5 9.5l3-3M7 4.5l1-1a2.8 2.8 0 014 4l-1 1M9 11.5l-1 1a2.8 2.8 0 01-4-4l1-1" strokeLinecap="round" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M6 4h8M6 8h8M6 12h8" strokeLinecap="round" />
      <circle cx="2.5" cy="4" r="1" fill="currentColor" stroke="none" />
      <circle cx="2.5" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="2.5" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function OrderedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M6 4h8M6 8h8M6 12h8" strokeLinecap="round" />
      <text x="0.5" y="5.5" fontSize="5" fill="currentColor" stroke="none">
        1
      </text>
      <text x="0.5" y="9.5" fontSize="5" fill="currentColor" stroke="none">
        2
      </text>
      <text x="0.5" y="13.5" fontSize="5" fill="currentColor" stroke="none">
        3
      </text>
    </svg>
  )
}
