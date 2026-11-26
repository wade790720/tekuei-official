// Rich-text editor (Tiptap): toolbar, card node views and the document schema, in one file.
// Outputs the document format that RichText renders (see src/lib/richText.js).
import { memo, useEffect, useEffectEvent, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Blockquote from '@tiptap/extension-blockquote'
import CodeBlock from '@tiptap/extension-code-block'
import { Placeholder } from '@tiptap/extensions'
import { EditorContent, Extension, mergeAttributes, Node, NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor, useEditorState } from '@tiptap/react'
import { NodeSelection, TextSelection } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import Suggestion from '@tiptap/suggestion'
import { DropdownMenu, MenuItems } from './DropdownMenu.jsx'
import { ImageCard } from './ImageCard.jsx'
import { Switch } from './Switch.jsx'
import { SortRows } from './SidePanel.jsx'
import { Button } from './Button.jsx'
import { TooltipGroup } from './Tooltip.jsx'
import { compressImage } from '../lib/compressImage.js'
import { safeHref } from '../lib/richText.js'


// In-editor views for the custom journal nodes.
// Text inside quotes and code is edited in place; card settings use small fields on the card.

// Pasted and dropped images: the card shows a preview at once, and its view swaps in the
// uploaded URL when this promise settles. Keyed by the preview URL, because node positions move.
const pendingUploads = new Map()

function track(src, job) {
  pendingUploads.set(src, job)
  job
    .finally(() => {
      pendingUploads.delete(src)
      if (src.startsWith('blob:')) URL.revokeObjectURL(src)
    })
    .catch(() => {}) // the card's view shows the error
}

/** Image files on a paste or drop. Some browsers fill only `items`, not `files`. */
function imageFiles(data) {
  const files = Array.from(data?.files ?? [])
  const all = files.length ? files : Array.from(data?.items ?? [], (i) => (i.kind === 'file' ? i.getAsFile() : null))
  return all.filter((f) => f?.type.startsWith('image/'))
}

// An <img> pasted from another page: download it and store our own copy, like Notion does.
// Many sites block the download (CORS); then the card keeps their URL and says so.
async function rehost(src, upload) {
  let file
  try {
    const res = await fetch(src)
    if (!res.ok) throw new Error()
    const blob = await res.blob()
    file = new File([blob], 'pasted', { type: blob.type })
  } catch {
    throw Object.assign(new Error('對方網站不讓瀏覽器下載這張圖，目前連到原網址。請改用右鍵「複製圖片」再貼上'), { keepSrc: src })
  }
  return upload(await compressImage(file))
}

const isOwnImage = (src) => !src || src.startsWith('blob:') || src.includes('/api/file/')

/** Pasted or dropped HTML: ImageCardNode parses each <img>. Start the copies; the default handler inserts the cards. */
function rehostSlice(slice, upload) {
  slice.content.descendants((node) => {
    const src = node.type.name === 'imageCard' ? node.attrs.src : ''
    if (!isOwnImage(src) && !pendingUploads.has(src)) track(src, rehost(src, upload))
  })
}

function insertImages(view, files, upload, pos) {
  const nodes = files.map((file) => {
    const src = URL.createObjectURL(file)
    track(src, compressImage(file).then(upload))
    return view.state.schema.nodes.imageCard.create({ src })
  })
  const tr = view.state.tr
  if (pos == null) tr.replaceWith(tr.selection.from, tr.selection.to, nodes)
  else tr.insert(pos, nodes)
  view.dispatch(tr.scrollIntoView())
}

/** editorProps: paste or drop images to make image cards. */
function imagePasteProps(upload) {
  return {
    handlePaste(view, event, slice) {
      const files = imageFiles(event.clipboardData)
      if (files.length) {
        insertImages(view, files, upload)
        return true
      }
      rehostSlice(slice, upload)
      return false
    },
    handleDrop(view, event, slice, moved) {
      if (moved) return false
      const files = imageFiles(event.dataTransfer)
      if (!files.length) {
        rehostSlice(slice, upload) // an image dragged from another tab arrives as HTML
        return false
      }
      const at = view.posAtCoords({ left: event.clientX, top: event.clientY })
      insertImages(view, files, upload, at?.pos ?? view.state.doc.content.size)
      return true
    },
  }
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

// The highlighter (src/lib/highlight.js) uses one grammar for all of these; the choice sets the label and # comments.
const CODE_LANGS = [
  { value: 'ts', label: 'TypeScript' },
  { value: 'tsx', label: 'TSX' },
  { value: 'js', label: 'JavaScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash' },
  { value: 'python', label: 'Python' },
  { value: 'yaml', label: 'YAML' },
  { value: 'sql', label: 'SQL' },
  { value: 'text', label: '純文字' },
]
const CODE_LANG_LABEL = Object.fromEntries(CODE_LANGS.map((x) => [x.value, x.label]))

function CodeBlockView({ node, updateAttributes }) {
  return (
    <NodeViewWrapper className="cms-ed-code">
      <div contentEditable={false} className="cms-ed-code__bar">
        <DropdownMenu
          label="程式語言"
          tip="程式語言"
          triggerClassName="cms-ed-style"
          trigger={
            <>
              {CODE_LANG_LABEL[node.attrs.language] ?? node.attrs.language}
              <ChevronDown />
            </>
          }
          items={CODE_LANGS}
          value={node.attrs.language}
          onSelect={(language) => updateAttributes({ language })}
        />
        <CardField label="檔名" value={node.attrs.filename} onChange={(filename) => updateAttributes({ filename })} placeholder="檔名（選填）" />
      </div>
      <pre spellCheck={false}>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}

/**
 * The frame of a card's form. Its head names the card: an icon, the name, and `meta` as a quiet count beside it.
 * `tools` are the card's own controls, in the head beside the delete button.
 */
function CardShell({ title, icon, meta, tools, selected, deleteNode, children }) {
  return (
    <NodeViewWrapper className="cms-ed-card" data-selected={selected || undefined}>
      <div contentEditable={false}>
        <div className="cms-ed-card__head" data-drag-handle>
          <span className="cms-ed-card__title">
            {icon}
            {title}
            {meta ? <span className="cms-ed-card__meta">{meta}</span> : null}
          </span>
          <div className="cms-ed-card__tools">
            {tools}
            <button type="button" className="cms-icon cms-icon--danger" onClick={deleteNode} aria-label={`刪除${title}`}>
              ✕
            </button>
          </div>
        </div>
        {children}
      </div>
    </NodeViewWrapper>
  )
}

function ImageCardView({ node, updateAttributes, deleteNode, selected, extension }) {
  const a = node.attrs
  const [busy, setBusy] = useState(() => pendingUploads.has(a.src))
  const [err, setErr] = useState('')

  async function follow(job) {
    try {
      updateAttributes({ src: await job })
    } catch (e) {
      setErr(e.message || '上傳失敗')
      updateAttributes({ src: e.keepSrc ?? '' })
    } finally {
      setBusy(false)
    }
  }

  function upload(file) {
    if (!file) return
    setErr('')
    setBusy(true)
    follow(compressImage(file).then(extension.options.upload))
  }

  // A pasted or dropped image: finish the upload that imagePasteProps started for the preview URL the card was made with.
  const [pasted] = useState(() => pendingUploads.get(a.src))
  const finishPasted = useEffectEvent(() => follow(pasted))
  useEffect(() => {
    const settle = () => finishPasted()
    if (pasted) pasted.then(settle, settle) // after it settles, so no state is set inside the effect itself
  }, [pasted])

  const fileInput = <input type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
  // The caption is typed in place, in the caption's own style. ImageCard takes it as its caption.
  const caption = (
    <input
      className="cms-ed-caption"
      value={a.caption ?? ''}
      onChange={(e) => updateAttributes({ caption: e.target.value })}
      placeholder="圖說（選填）"
      aria-label="圖說"
    />
  )
  const note = busy ? '上傳中' : a.src && !a.alt ? '缺替代文字' : ''

  return (
    <NodeViewWrapper className="cms-ed-image" data-selected={selected || undefined}>
      <div contentEditable={false}>
        {a.src ? (
          <ImageCard src={a.src} alt={a.alt ?? ''} caption={caption} frame={a.frame} />
        ) : (
          <div className="cms-ed-image__empty">
            <span>在內文貼上或拖放圖片，也可以選擇檔案</span>
            <Button as="label" variant="ghost" className="cms-upload">
              {busy ? '上傳中' : '選擇檔案'}
              {fileInput}
            </Button>
            <CardField label="圖片網址" value={a.src} onChange={(src) => updateAttributes({ src })} placeholder="或貼上圖片網址" />
          </div>
        )}
        <div className="cms-ed-image__tools" data-attn={note ? '' : undefined}>
          {note ? <span className="cms-ed-image__note">{note}</span> : null}
          {a.src ? (
            <CardSettings label="圖片設定">
              <label className="cms-ed-set__field">
                替代文字（必填）
                <CardField label="替代文字" value={a.alt} onChange={(alt) => updateAttributes({ alt })} placeholder="說明圖片內容" />
              </label>
              <label className="cms-ed-set__field">
                圖片網址
                <span className="cms-ed-card__row">
                  <CardField label="圖片網址" value={a.src} onChange={(src) => updateAttributes({ src })} />
                  <Button as="span" variant="ghost" className="cms-upload">
                    {busy ? '上傳中' : '換圖'}
                    {fileInput}
                  </Button>
                </span>
              </label>
              <label className="cms-check">
                <Switch checked={a.frame} onChange={(frame) => updateAttributes({ frame })} label="小圖置中" />
                小圖置中（手機截圖用）
              </label>
            </CardSettings>
          ) : null}
          <Button variant="icon" onClick={deleteNode} aria-label="刪除圖片">
            ✕
          </Button>
        </div>
        {err ? <div className="cms-row__error">{err}</div> : null}
      </div>
    </NodeViewWrapper>
  )
}

/** A "⋯" button with a small settings panel under it. It closes on Escape or a click outside. */
function CardSettings({ label, children }) {
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  useEffect(() => {
    if (!open) return
    const away = (e) => !root.current?.contains(e.target) && setOpen(false)
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', esc)
    }
  }, [open])
  return (
    <div className="cms-ed-set" ref={root}>
      <Button variant="icon" aria-label={label} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        ⋯
      </Button>
      {open ? (
        <div className="cms-ed-set__pop" role="group" aria-label={label}>
          {children}
        </div>
      ) : null}
    </div>
  )
}

function VideoPlayerView({ node, updateAttributes, deleteNode, selected }) {
  const a = node.attrs
  return (
    <CardShell title="影片" icon={ICON.video} selected={selected} deleteNode={deleteNode}>
      <CardField label="影片網址" value={a.src} onChange={(src) => updateAttributes({ src })} placeholder="影片網址（mp4 或 YouTube 連結）" />
      <CardField label="封面圖網址" value={a.poster} onChange={(poster) => updateAttributes({ poster })} placeholder="封面圖網址（選填）" />
      <CardField label="影片說明" value={a.caption} onChange={(caption) => updateAttributes({ caption })} placeholder="說明（選填）" />
      <label className="cms-check">
        <Switch checked={a.loop} onChange={(loop) => updateAttributes({ loop })} label="重複播放" />
        重複播放
      </label>
    </CardShell>
  )
}

const SLIDE_LAYOUTS = [
  { value: 'carousel', label: '輪播' },
  { value: 'stack', label: '堆疊' },
  { value: 'gallery', label: '圖庫' },
  { value: 'work', label: '作品' },
]
const SLIDE_LAYOUT_LABEL = Object.fromEntries(SLIDE_LAYOUTS.map((x) => [x.value, x.label]))

function CarouselView({ node, updateAttributes, deleteNode, selected, extension }) {
  const slides = node.attrs.slides ?? []
  const layout = node.attrs.layout || 'carousel'
  const [busy, setBusy] = useState(-1)
  const [batch, setBatch] = useState('')
  const [err, setErr] = useState('')
  const setSlides = (next) => updateAttributes({ slides: next })
  const latest = useRef(slides)
  useEffect(() => {
    latest.current = slides
  })

  // Several photos at once: one after another, each added as it arrives, so a failure keeps the ones before it.
  async function uploadMany(files) {
    setErr('')
    for (const [n, file] of files.entries()) {
      setBatch(`上傳中 ${n + 1} / ${files.length}`)
      try {
        const src = await compressImage(file).then(extension.options.upload)
        latest.current = [...latest.current, { src, alt: '', caption: '' }]
        setSlides(latest.current)
      } catch (e) {
        setErr(`${file.name}：${e.message || '上傳失敗'}`)
        break
      }
    }
    setBatch('')
  }
  const setSlide = (i, patch) => setSlides(slides.map((s, j) => (j === i ? { ...s, ...patch } : s)))
  const move = (from, to) => {
    const next = [...slides]
    next.splice(to, 0, next.splice(from, 1)[0])
    setSlides(next)
  }

  async function upload(i, file) {
    if (!file) return
    setErr('')
    setBusy(i)
    try {
      setSlide(i, { src: await compressImage(file).then(extension.options.upload) })
    } catch (e) {
      setErr(e.message || '上傳失敗')
    } finally {
      setBusy(-1)
    }
  }

  return (
    <CardShell
      title="圖組"
      icon={ICON.slides}
      meta={`${slides.length} 張`}
      selected={selected}
      deleteNode={deleteNode}
      tools={
        <>
          <DropdownMenu
            label="排法"
            tip="排法"
            triggerClassName="cms-ed-style"
            trigger={
              <>
                {SLIDE_LAYOUT_LABEL[layout]}
                <ChevronDown />
              </>
            }
            items={SLIDE_LAYOUTS}
            value={layout}
            onSelect={(next) => updateAttributes({ layout: next })}
          />
          <Button as="label" variant="ghost" className="cms-upload" aria-disabled={Boolean(batch) || undefined}>
            {batch || '上傳多張'}
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              disabled={Boolean(batch)}
              onChange={(e) => {
                uploadMany([...e.target.files])
                e.target.value = ''
              }}
            />
          </Button>
        </>
      }
    >
      {layout === 'work' ? (
        <>
          <CardField label="作品名" value={node.attrs.title} onChange={(title) => updateAttributes({ title })} placeholder="作品名" />
          <CardField label="創作者和說明" value={node.attrs.text} onChange={(text) => updateAttributes({ text })} placeholder="創作者和說明（選填）" />
        </>
      ) : null}
      {layout === 'gallery' ? (
        <label className="cms-check">
          <Switch checked={Boolean(node.attrs.collapsed)} onChange={(collapsed) => updateAttributes({ collapsed })} label="只露出前 5 張" />
          只露出前 5 張，其餘按「顯示全部」才打開
        </label>
      ) : null}
      <SortRows
        items={slides}
        keyOf={(s) => String(slides.indexOf(s))}
        nameOf={(s) => s.alt || `第 ${slides.indexOf(s) + 1} 張`}
        onMove={move}
        rowClassName="cms-ed-slide"
      >
        {(s, i) => (
          <>
            {s.src ? <img className="cms-ed-slide__thumb" src={s.src} alt="" /> : <span className="cms-ed-slide__thumb" />}
            <div className="cms-ed-slide__fields">
              <div className="cms-ed-card__row">
                <CardField label={`第 ${i + 1} 張的圖片網址`} value={s.src} onChange={(src) => setSlide(i, { src })} placeholder="圖片網址，或按右邊上傳" />
                <Button as="label" variant="ghost" className="cms-upload">
                  {busy === i ? '上傳中' : '上傳'}
                  <input type="file" accept="image/*" hidden onChange={(e) => upload(i, e.target.files?.[0])} />
                </Button>
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
          </>
        )}
      </SortRows>
      {err ? <div className="cms-row__error">{err}</div> : null}
      <Button variant="ghost" className="cms-ed-slide__add" onClick={() => setSlides([...slides, { src: '', alt: '', caption: '' }])}>
        ＋ 新增一張
      </Button>
    </CardShell>
  )
}


// Tiptap extensions for the journal editor. The node names and attributes match src/lib/richText.js,
// which documents the stored format, and RichText.jsx, which renders it on the site.

const attr = (name, fallback = '') => ({
  [name]: {
    default: fallback,
    parseHTML: (el) => el.getAttribute(`data-${name}`), // null keeps the default, or a parse rule's getAttrs
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
const CodeBlockNode = CodeBlock.extend({
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

const ImageCardNode = card('imageCard', { src: '', alt: '', caption: '', frame: false }, ImageCardView).extend({
  // <img> in pasted HTML becomes an image card. Relative URLs would point at this site, so skip them.
  parseHTML() {
    return [
      ...this.parent(),
      {
        tag: 'img[src]',
        getAttrs: (el) => (/^(https?:|data:image\/)/.test(el.getAttribute('src')) ? { src: el.getAttribute('src'), alt: el.getAttribute('alt') ?? '' } : false),
      },
    ]
  },
})

/** A set of pictures, shown as a carousel, a scroll stack or a gallery. `slides` is a list, so it goes through HTML as JSON. */
const CarouselNode = card('slidesCard', {}, CarouselView).extend({
  addAttributes: () => ({
    ...attr('layout', 'carousel'),
    ...attr('title'),
    ...attr('text'),
    collapsed: {
      default: false,
      parseHTML: (el) => el.getAttribute('data-collapsed') === 'true',
      renderHTML: (attrs) => ({ 'data-collapsed': String(Boolean(attrs.collapsed)) }),
    },
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
const VideoPlayerNode = card('videoCard', { src: '', poster: '', caption: '', loop: false }, VideoPlayerView)

/** "/" on a top-level paragraph opens the "+" menu's list at the cursor; typing after it filters the list. */
const SlashCommand = Extension.create({
  name: 'slashCommand',
  addOptions: () => ({ render: null }),
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from)
          return $from.depth === 1 && $from.parent.type.name === 'paragraph'
        },
        items: ({ query }) => slashItems(query),
        command: ({ editor, range, props }) => {
          editor.chain().focus().deleteRange(range).run()
          applyBlock(editor, props.value)
        },
        render: this.options.render,
      }),
    ]
  },
})

/**
 * Suggestion's render hooks for one "/" session. It keeps the list and the arrow-key row here,
 * and hands what to draw to `show` (the editor's state setter).
 */
function slashRender(show) {
  let s = null
  const open = (p) => {
    const rect = p.clientRect?.()
    const values = p.items.filter((it) => it !== 'divider').map((it) => it.value)
    s = rect && values.length ? { items: p.items, values, command: p.command, top: rect.bottom, above: rect.top, left: rect.left, active: values[0] } : null
    show(s)
  }
  return {
    onStart: open,
    onUpdate: open,
    onKeyDown: ({ event }) => {
      if (!s) return false
      const i = s.values.indexOf(s.active)
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        s = { ...s, active: s.values[(i + (event.key === 'ArrowDown' ? 1 : -1) + s.values.length) % s.values.length] }
        show(s)
      } else if (event.key === 'Enter' || event.key === 'Tab') s.command({ value: s.active })
      else if (event.key === 'Escape') show((s = null))
      else return false
      return true
    },
    onExit: () => show((s = null)),
  }
}

/** Matches the "/" keyword ("code", "h2") or the Chinese label. */
function slashItems(query) {
  const q = query.trim().toLowerCase()
  if (!q) return BLOCKS
  return BLOCKS.filter((it) => it !== 'divider' && (it.slash.includes(q) || it.label.includes(q)))
}

/**
 * @param {{ upload: (file: File) => Promise<string>, placeholder: string, slash: object }} opts
 *   upload stores an image and returns its URL. slash makes the "/" menu's render hooks (Tiptap Suggestion).
 */
function editorExtensions({ upload, placeholder, slash }) {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      blockquote: false,
      codeBlock: false,
      link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
    }),
    Lead,
    Quote,
    CodeBlockNode,
    ImageCardNode.configure({ upload }),
    CarouselNode.configure({ upload }),
    VideoPlayerNode,
    Placeholder.configure({ placeholder }),
    SlashCommand.configure({ render: slash }),
  ]
}


/**
 * Rich-text editor for a post body, with a Framer-style toolbar.
 * The document is the editor's own JSON (src/lib/richText.js). doc, onChange and upload are read once on mount;
 * remount with a new key to load a different post. Only `previewing` re-renders it, so typing upstream does not.
 * @param {{
 *   doc: object, onChange: (doc: object) => void, upload: (file: File) => Promise<string>,
 *   previewing?: boolean,
 * }} props
 *   previewing hides the editor and its toolbars but keeps it mounted. The caller draws the preview beside it.
 */
export const Editor = memo(function Editor({ doc, onChange, upload, previewing = false }) {
  const change = useRef(onChange)
  useEffect(() => {
    change.current = onChange
  })

  const root = useRef(null)
  const gutter = useRef(null)
  const [block, setBlock] = useState(null) // { pos, node, top, left } of the block under the pointer or cursor
  const place = (hit) => {
    if (!hit || !root.current || gutter.current?.querySelector('[aria-expanded="true"]')) return // not mounted yet, or the "+" menu is open
    const box = root.current.getBoundingClientRect()
    const top = hit.top - box.top
    const left = hit.left - box.left
    // Same block, same place: keep the old object so a mousemove does not re-render the editor.
    setBlock((b) => (b && b.pos === hit.pos && b.node === hit.node && b.top === top && b.left === left ? b : { ...hit, top, left }))
  }

  const [slash, setSlash] = useState(null) // the "/" menu on screen: { items, command, top, left, active }

  // Built once. New objects on each render would make Tiptap call setOptions on every keystroke.
  // The editor keeps the upload it was created with. That is fine: it unmounts when the login changes.
  const [options] = useState(() => ({
    extensions: editorExtensions({
      upload,
      placeholder: '開始寫……　輸入 / 插入區塊',
      slash: () => slashRender(setSlash),
    }),
    content: doc,
    editorProps: { attributes: { class: 'cms-ed-content', 'aria-label': '內文', spellcheck: 'false' }, ...imagePasteProps(upload) },
  }))
  const editor = useEditor({
    ...options,
    immediatelyRender: true,
    onUpdate: ({ editor: e }) => change.current(e.getJSON()),
    // Typing hides the gutter; the cursor on an empty line shows the "+" there, as in Notion.
    // On a phone that empty-line "+" is the only one (cms.css).
    onTransaction: ({ editor: e, transaction: tr }) => {
      const { $from, empty } = e.state.selection
      if (empty && $from.depth === 1 && $from.parent.type.name === 'paragraph' && !$from.parent.content.size)
        place(blockAt(e.view, e.view.coordsAtPos($from.pos).top + 1))
      else if (tr.docChanged) setBlock(null)
    },
  })

  // At most one measurement per frame; mousemove can fire several times between frames.
  const frame = useRef(0)
  const pointerY = useRef(0)
  const track = (e) => {
    pointerY.current = e.clientY
    frame.current ||= requestAnimationFrame(() => {
      frame.current = 0
      place(blockAt(editor.view, pointerY.current))
    })
  }
  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  return (
    <div className="cms-ed" ref={root} onMouseMove={track} hidden={previewing}>
      <EditorContent editor={editor} />
      {previewing ? null : (
        <>
          <BlockGutter editor={editor} block={block} gutterRef={gutter} />
          <Toolbar editor={editor} />
          {slash ? <SlashMenu slash={slash} /> : null}
        </>
      )}
    </div>
  )
}, (a, b) => a.previewing === b.previewing)

/** The "/" menu's list, under the cursor. Focus stays in the text, so `active` marks the row instead. */
function SlashMenu({ slash }) {
  const list = useRef(null)
  // Keeps the active row in view by scrolling the list only; scrollIntoView would also scroll the page.
  useEffect(() => {
    const box = list.current
    const row = box?.querySelector('[data-active]')
    if (!row) return
    if (row.offsetTop < box.scrollTop) box.scrollTop = row.offsetTop
    else if (row.offsetTop + row.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = row.offsetTop + row.offsetHeight - box.clientHeight
  }, [slash.active])
  // While it is open the page stays put, as in Notion: the wheel scrolls the list only.
  useEffect(() => {
    const stop = (e) => {
      if (!list.current?.contains(e.target)) e.preventDefault()
    }
    document.addEventListener('wheel', stop, { passive: false })
    document.addEventListener('touchmove', stop, { passive: false })
    return () => {
      document.removeEventListener('wheel', stop)
      document.removeEventListener('touchmove', stop)
    }
  }, [])
  // Opens upward when there is no room below the cursor.
  const above = slash.top + SLASH_MAX_H > window.innerHeight && slash.above > SLASH_MAX_H
  // In <body>: a transformed ancestor would move a fixed element away from the cursor.
  return createPortal(
    <div className="dropdown-menu cms-ed-slash" data-above={above || undefined} style={{ top: above ? slash.above : slash.top, left: slash.left }}>
      <div className="dropdown-menu__list" role="menu" aria-label="插入區塊" ref={list}>
        <MenuItems items={slash.items} active={slash.active} onPick={(value) => slash.command({ value })} />
      </div>
    </div>,
    document.body,
  )
}
const SLASH_MAX_H = 340 // px, the list's max-height (cms.css) plus its gap

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

const ICON = {
  paragraph: <Glyph d="M7 3h6M10 3v10M7 3a3 3 0 000 6h3" />,
  lead: <Glyph d="M3 4h10M3 8h10M3 12h6" />,
  h2: <Glyph d="M3 3v10M9 3v10M3 8h6M12 9.5a1.5 1.5 0 113 0c0 1-3 2-3 3.5h3" />,
  h3: <Glyph d="M3 3v10M9 3v10M3 8h6M12 8.5a1.5 1.2 0 113 .3c0 .7-1.5.7-1.5.7s1.5 0 1.5 .8a1.5 1.2 0 01-3 .2" />,
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

const INSERTS = [
  { value: 'code', label: '程式碼', icon: ICON.code },
  { value: 'image', label: '圖片', icon: ICON.image },
  { value: 'slides', label: '圖組', icon: ICON.slides },
  { value: 'video', label: '影片', icon: ICON.video },
  'divider',
  { value: 'hr', label: '分隔線', icon: ICON.hr },
]

// Text blocks a line can turn into (the selection bubble), then every kind the "+" can make.
const TEXT_BLOCKS = [
  ...STYLES,
  { value: 'quote', label: '引言', icon: <Glyph d="M3 4v8M6.5 5h6.5M6.5 8h6.5M6.5 11h4" />, kbd: `${MOD}${SHIFT}B` },
  { value: 'bullet', label: '項目清單', icon: <ListIcon />, kbd: `${MOD}${SHIFT}8` },
  { value: 'ordered', label: '編號清單', icon: <OrderedIcon />, kbd: `${MOD}${SHIFT}7` },
]
const TEXT_LABEL = Object.fromEntries(TEXT_BLOCKS.map((x) => [x.value, x.label]))
// The "+" and "/" menus show each block's "/" keyword where the text menus show a shortcut.
const SLASH_KEY = { paragraph: 'text', bullet: 'ul', ordered: 'ol' }
const BLOCKS = [...TEXT_BLOCKS, 'divider', ...INSERTS].map((it) => {
  if (it === 'divider') return it
  const slash = SLASH_KEY[it.value] ?? it.value
  return { ...it, slash, kbd: `/${slash}` }
})
// The "⠿" menu: what can be done to the block itself.
const BLOCK_ACTIONS = [
  { value: 'duplicate', label: '複製一份', icon: <DuplicateIcon /> },
  { value: 'delete', label: '刪除', icon: <TrashIcon /> },
]

/** Turns the block at the cursor into `kind`, or inserts a card there. Used by the bubble and the "+". */
function applyBlock(editor, kind) {
  const run = editor.chain().focus()
  if (kind === 'lead') run.setLead().run()
  else if (kind === 'h2') run.setHeading({ level: 2 }).run()
  else if (kind === 'h3') run.setHeading({ level: 3 }).run()
  else if (kind === 'paragraph') run.setParagraph().run()
  else if (kind === 'quote') (editor.isActive('blockquote') ? run : run.toggleBlockquote()).run()
  else if (kind === 'bullet') (editor.isActive('bulletList') ? run : run.toggleBulletList()).run()
  else if (kind === 'ordered') (editor.isActive('orderedList') ? run : run.toggleOrderedList()).run()
  else if (kind === 'code') run.setCodeBlock({ language: 'ts' }).run()
  else if (kind === 'hr') run.setHorizontalRule().run()
  // On an empty line, Tiptap replaces the line with the card.
  else run.insertContent({ type: { image: 'imageCard', slides: 'slidesCard', video: 'videoCard' }[kind] }).run()
}

// Block gutter: "+" and "⠿" beside the line under the pointer, as in Notion and Editor.js

const HANDLE = 24 // px, the gutter buttons' height (cms.css .cms-ed-gutter .btn--icon)

/** The top-level block at height `y` (client px), its left edge, and where its first line sits. */
function blockAt(view, y) {
  const { doc } = view.state
  for (let i = 0, pos = 0; i < doc.childCount; pos += doc.child(i).nodeSize, i++) {
    const node = doc.child(i)
    const dom = view.nodeDOM(pos)
    if (!(dom instanceof HTMLElement)) continue
    const r = dom.getBoundingClientRect()
    if (y >= r.bottom) continue // the gap above a block belongs to that block
    const cs = getComputedStyle(dom)
    const line = parseFloat(cs.lineHeight)
    const first = node.isAtom || !Number.isFinite(line) ? 0 : parseFloat(cs.paddingTop) + (line - HANDLE) / 2
    return { pos, node, top: r.top + first, left: r.left }
  }
  return null
}

/** The same hand-off ProseMirror makes for its own drags: the drop moves the selected block. */
function startBlockDrag(view, pos, data) {
  view.dragging = { slice: view.state.selection.content(), move: true }
  data.effectAllowed = 'move'
  data.setData('text/plain', '') // Firefox starts no drag without data
  const dom = view.nodeDOM(pos)
  if (dom instanceof HTMLElement) data.setDragImage(dom, 0, 0)
}

/** "+" opens the block menu for a new line under the block (or this line, when it is empty). "⠿" drags the block. */
function BlockGutter({ editor, block, gutterRef }) {
  if (!block) return null

  const add = (kind) => {
    const { node, pos } = block
    const chain = editor.chain()
    if (node.type.name === 'paragraph' && node.content.size === 0) chain.setTextSelection(pos + 1).run()
    else chain.insertContentAt(pos + node.nodeSize, { type: 'paragraph' }).setTextSelection(pos + node.nodeSize + 1).run()
    applyBlock(editor, kind)
  }

  const select = () => {
    const { view } = editor
    view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, block.pos)))
    view.focus()
  }

  const dragStart = (e) => {
    select()
    startBlockDrag(editor.view, block.pos, e.dataTransfer)
  }

  const act = (kind) => {
    const { node, pos } = block
    if (kind === 'delete') editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run()
    else if (kind === 'duplicate') editor.chain().focus().insertContentAt(pos + node.nodeSize, node.toJSON()).run()
  }

  return (
    <div
      className="cms-ed-gutter"
      ref={gutterRef}
      style={{ top: block.top, left: block.left }}
      data-empty={block.node.type.name === 'paragraph' && !block.node.content.size ? '' : undefined}
    >
      <DropdownMenu label="新增區塊" trigger={<PlusIcon />} items={BLOCKS} onSelect={add} triggerClassName="btn btn--icon" />
      <DropdownMenu
        label="拖曳移動這個區塊，點一下開啟選單"
        trigger={<GripIcon />}
        items={BLOCK_ACTIONS}
        onSelect={act}
        triggerClassName="btn btn--icon cms-ed-gutter__grip"
        triggerProps={{ draggable: true, onDragStart: dragStart }}
      />
    </div>
  )
}

/** The block kind at the cursor, as a TEXT_BLOCKS value. Lists and quotes win over the paragraph inside them. */
function blockKind(e) {
  if (e.isActive('bulletList')) return 'bullet'
  if (e.isActive('orderedList')) return 'ordered'
  if (e.isActive('blockquote')) return 'quote'
  if (e.isActive('lead')) return 'lead'
  if (e.isActive('heading', { level: 2 })) return 'h2'
  if (e.isActive('heading', { level: 3 })) return 'h3'
  return 'paragraph'
}

/**
 * Formatting bubble over selected text, as in Editor.js and Notion: block kind, then bold, italic,
 * underline, link and inline code. It shows while text is selected and the editor (or the bubble) has focus.
 */
function Toolbar({ editor }) {
  const bar = useRef(null)
  const [inside, setInside] = useState(false) // focus is in the bubble, e.g. in the block-kind menu
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const sel = e.state.selection
      return {
        text: sel instanceof TextSelection && !sel.empty,
        focused: e.isFocused,
        from: sel.from,
        style: blockKind(e),
        bold: e.isActive('bold'),
        italic: e.isActive('italic'),
        underline: e.isActive('underline'),
        code: e.isActive('code'),
        link: e.isActive('link'),
      }
    },
  })

  // A click anywhere outside hands focus back, so a stale bubble does not linger.
  useEffect(() => {
    if (!inside) return undefined
    const away = (e) => !bar.current?.contains(e.target) && setInside(false)
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [inside, bar])

  if (!s.text || !(s.focused || inside)) return null

  // Sit above the first selected line, left-aligned with it, inside the editor's own box.
  const box = editor.view.dom.closest('.cms-ed').getBoundingClientRect()
  const at = editor.view.coordsAtPos(s.from)

  const run = () => editor.chain().focus()
  const link = () => {
    if (s.link) return run().unsetLink().run()
    const input = window.prompt('連結網址', 'https://')
    if (input === null) return
    const href = safeHref(input)
    if (!href) return window.alert('這個網址不能用，請用 https://、mailto: 或 / 開頭的網址。')
    run().extendMarkRange('link').setLink({ href }).run()
  }

  return (
    <TooltipGroup
      ref={bar}
      className="cms-ed-bar"
      role="toolbar"
      aria-label="文字格式"
      style={{ top: at.top - box.top, left: at.left - box.left }}
      onPointerDownCapture={() => setInside(true)}
      onFocusCapture={() => setInside(true)}
    >
      <DropdownMenu
        label="轉換成"
        tip="轉換成"
        triggerClassName="cms-ed-style"
        trigger={
          <>
            {TEXT_LABEL[s.style]}
            <ChevronDown />
          </>
        }
        items={TEXT_BLOCKS}
        value={s.style}
        onSelect={(v) => applyBlock(editor, v)}
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
      <Btn label="行內程式碼" kbd={KEYS.code} on={s.code} onClick={() => run().toggleCode().run()}>
        {'<>'}
      </Btn>
    </TooltipGroup>
  )
}

function Btn({ on, label, kbd, onClick, children }) {
  return (
    <Button
      variant="icon"
      aria-label={label}
      aria-pressed={on}
      aria-keyshortcuts={kbd?.replace('⌘', 'Meta+').replace('Ctrl ', 'Control+').replace(/⇧|Shift /, 'Shift+')}
      data-tip={label}
      data-kbd={kbd}
      onMouseDown={(e) => e.preventDefault()} // keep the text selection
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function Glyph({ d }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      {[4.5, 8, 11.5].map((y) => [5.5, 10.5].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" />))}
    </svg>
  )
}

function DuplicateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.8" />
      <path d="M10.5 3.5v-.3A1.7 1.7 0 0 0 8.8 1.5H3.2A1.7 1.7 0 0 0 1.5 3.2v5.6c0 .94.76 1.7 1.7 1.7h.3" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" strokeLinecap="round" strokeLinejoin="round" />
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
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M6.5 9.5l3-3M7 4.5l1-1a2.8 2.8 0 014 4l-1 1M9 11.5l-1 1a2.8 2.8 0 01-4-4l1-1" strokeLinecap="round" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M6 4h8M6 8h8M6 12h8" strokeLinecap="round" />
      <circle cx="2.5" cy="4" r="1" fill="currentColor" stroke="none" />
      <circle cx="2.5" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="2.5" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function OrderedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
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
