import { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { journalExtensions } from './extensions.js'
import { safeHref } from '../../../lib/postDoc.js'

const STYLES = [
  ['paragraph', '段落'],
  ['lead', '前言'],
  ['h2', '小標題'],
  ['h3', '次標題'],
]

const INSERTS = [
  ['code', '程式碼'],
  ['image', '圖片'],
  ['video', '影片'],
  ['hr', '分隔線'],
]

/**
 * Rich-text editor for a post body, with a Framer-style toolbar.
 * The document is the editor's own JSON (src/lib/postDoc.js). It is read once on mount;
 * remount with a new key to load a different post.
 * @param {{ doc: object, onChange: (doc: object) => void, upload: (file: File) => Promise<string> }} props
 */
export function PostEditor({ doc, onChange, upload }) {
  const change = useRef(onChange)
  useEffect(() => {
    change.current = onChange
  })

  // The editor keeps the upload it was created with. That is fine: it unmounts when the login changes.
  const editor = useEditor({
    extensions: journalExtensions({ upload, placeholder: '開始寫…' }),
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

function Toolbar({ editor }) {
  const [menu, setMenu] = useState(false)
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
    setMenu(false)
    if (kind === 'code') run().setCodeBlock({ language: 'ts' }).run()
    else if (kind === 'hr') run().setHorizontalRule().run()
    else
      run()
        .insertContent({ type: kind === 'image' ? 'imageCard' : 'videoCard' })
        .run()
  }

  const link = () => {
    if (s.link) return run().unsetLink().run()
    const input = window.prompt('連結網址', 'https://')
    if (input === null) return
    const href = safeHref(input)
    if (!href) return window.alert('這個網址不能用。請用 https://、mailto: 或 / 開頭的網址。')
    run().extendMarkRange('link').setLink({ href }).run()
  }

  return (
    <div className="cms-ed-bar" role="toolbar" aria-label="文字格式">
      <div className="cms-ed-insert cms-ed-group">
        <Btn label="插入" on={menu} onClick={() => setMenu((m) => !m)}>
          ＋
        </Btn>
        {menu ? (
          <div className="cms-ed-menu" role="menu">
            {INSERTS.map(([kind, label]) => (
              <button
                key={kind}
                type="button"
                role="menuitem"
                className="cms-ed-menu__item"
                onClick={() => insert(kind)}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="cms-ed-group">
        <select
          className="cms-ed-style"
          value={s.style}
          onChange={(e) => setStyle(e.target.value)}
          aria-label="段落樣式"
        >
          {STYLES.map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="cms-ed-group">
        <Btn label="連結" on={s.link} onClick={link}>
          <LinkIcon />
        </Btn>
        <Btn label="粗體" on={s.bold} onClick={() => run().toggleBold().run()}>
          <b>B</b>
        </Btn>
        <Btn label="斜體" on={s.italic} onClick={() => run().toggleItalic().run()}>
          <i>I</i>
        </Btn>
        <Btn label="引言" on={s.quote} onClick={() => run().toggleBlockquote().run()}>
          ❝
        </Btn>
        <Btn label="行內程式碼" on={s.code} onClick={() => run().toggleCode().run()}>
          {'<>'}
        </Btn>
        <Btn label="項目清單" on={s.bullet} onClick={() => run().toggleBulletList().run()}>
          <ListIcon />
        </Btn>
        <Btn label="編號清單" on={s.ordered} onClick={() => run().toggleOrderedList().run()}>
          <OrderedIcon />
        </Btn>
      </div>
    </div>
  )
}

function Btn({ on, label, onClick, children }) {
  return (
    <button
      type="button"
      className="cms-ed-btn"
      aria-label={label}
      aria-pressed={on}
      title={label}
      onMouseDown={(e) => e.preventDefault()} // keep the text selection
      onClick={onClick}
    >
      {children}
    </button>
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
