import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CmsInput, CmsPanel, CmsRow, CmsSection, CmsSwitch, CmsTextarea } from '../admin/CmsPanel.jsx'
import { useAdmin, useAdminSave } from '../../context/admin.js'
import { useJournal } from '../../context/journal.js'
import { CMS_LABELS as T } from '../../data/admin.js'
import { useLang } from '../../i18n'
import { uploadSiteImage } from '../../lib/adminApi.js'

const LANGS = ['zh', 'en']
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_IMAGE_BYTES = 1024 * 1024 // functions/api/upload.js rejects larger files

const BLOCK_TYPES = [
  ['p', '段落'],
  ['lead', '前言'],
  ['h2', '小標題'],
  ['quote', '引言'],
  ['code', '程式碼'],
  ['image', '圖片'],
  ['video', '影片'],
]
const BLOCK_LABEL = Object.fromEntries(BLOCK_TYPES)

const NEW_BLOCK = {
  p: () => ({ type: 'p', text: '' }),
  lead: () => ({ type: 'lead', text: '' }),
  h2: () => ({ type: 'h2', text: '' }),
  quote: () => ({ type: 'quote', text: '', attr: '' }),
  code: () => ({ type: 'code', lang: 'ts', filename: '', code: '' }),
  image: () => ({ type: 'image', src: '', alt: '', caption: '', frame: false }),
  video: () => ({ type: 'video', src: '', poster: '', caption: '', loop: false }),
}

// Local date, not toISOString (UTC): in Taipei that would be yesterday until 08:00.
const today = () => {
  const d = new Date()
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()].map((n) => String(n).padStart(2, '0')).join('.')
}

/**
 * Edit mode glue for journal pages: starts the journal draft when edit mode turns on,
 * saves on Ctrl/⌘+S, and asks before throwing away unsaved changes.
 */
function useJournalEditing() {
  const admin = useAdmin()
  const cms = useJournal()
  const dirty = Boolean(cms.draft) && JSON.stringify(cms.draft) !== JSON.stringify(cms.savedContent)

  useEffect(() => {
    if (admin.editing && !cms.isEditing && !cms.loading) cms.startEditing()
  }, [admin.editing, cms])

  const save = async () => {
    if (!dirty || cms.saving) return
    try {
      await cms.saveDraft(admin.getToken())
    } catch {
      /* cms.error holds the message */
    }
  }
  useAdminSave(admin.editing ? save : null)

  const leave = (then) => {
    if (dirty && !window.confirm(T.exitConfirm)) return
    cms.cancelEditing()
    then()
  }

  return {
    admin,
    cms,
    ready: admin.editing && cms.isEditing,
    panelProps: {
      dirty,
      saving: cms.saving,
      error: cms.error,
      onSave: save,
      onExit: () => leave(() => admin.setEditing(false)),
      onLogout: () => leave(admin.logout),
    },
  }
}

// ── Post page ──

export function JournalPostEditPanel({ slug }) {
  const { lang } = useLang()
  const { cms, ready, panelProps, admin } = useJournalEditing()
  if (!ready) return null

  const post = cms.draft.posts[lang]?.find((p) => p.slug === slug)
  const body = cms.draft.content[lang]?.[slug]
  if (!post || !body) return null

  // Title and text belong to one language. Date, reading time and category are shared.
  const setPost = (key, value) =>
    cms.updateDraft((d) => {
      d.posts[lang].find((p) => p.slug === slug)[key] = value
    })
  const setShared = (key, value) =>
    cms.updateDraft((d) => {
      for (const l of LANGS) {
        const p = d.posts[l]?.find((x) => x.slug === slug)
        if (p) p[key] = value
      }
    })
  const editBlocks = (fn) =>
    cms.updateDraft((d) => {
      fn(d.content[lang][slug].blocks)
    })

  return (
    <CmsPanel title="編輯文章" subtitle={`/journal/${slug} · ${lang === 'zh' ? '中文' : 'English'}`} {...panelProps}>
      <CmsSection title="文章資訊">
        <CmsRow label="標題" htmlFor="cms-title">
          <CmsInput id="cms-title" value={post.title} onChange={(v) => setPost('title', v)} />
        </CmsRow>
        <CmsRow label="英文副標" htmlFor="cms-title-en">
          <CmsInput id="cms-title-en" value={post.titleEn} onChange={(v) => setPost('titleEn', v)} />
        </CmsRow>
        <CmsRow label="摘要" htmlFor="cms-excerpt" hint="顯示在列表和首頁。">
          <CmsTextarea id="cms-excerpt" value={post.excerpt} onChange={(v) => setPost('excerpt', v)} />
        </CmsRow>
        <CmsRow label="分類" htmlFor="cms-category" hint="中英文共用。">
          <CmsInput id="cms-category" value={post.category} onChange={(v) => setShared('category', v.toUpperCase())} />
        </CmsRow>
        <CmsRow label="日期" htmlFor="cms-date" hint="格式 2026.11.19，中英文共用。">
          <CmsInput id="cms-date" value={post.date} onChange={(v) => setShared('date', v)} />
        </CmsRow>
        <CmsRow label="閱讀時間" htmlFor="cms-read" hint="分鐘，中英文共用。">
          <CmsInput
            id="cms-read"
            type="number"
            min="1"
            value={post.readMin}
            onChange={(v) => setShared('readMin', Math.max(1, Number(v) || 1))}
          />
        </CmsRow>
      </CmsSection>

      <CmsSection title={`內容 · ${body.blocks.length} 個區塊`}>
        {body.blocks.map((block, i) => (
          <BlockRow
            key={i}
            block={block}
            index={i}
            count={body.blocks.length}
            getToken={admin.getToken}
            onChange={(next) => editBlocks((b) => (b[i] = next))}
            onMove={(dir) => editBlocks((b) => b.splice(i + dir, 0, b.splice(i, 1)[0]))}
            onRemove={() => editBlocks((b) => b.splice(i, 1))}
            onType={(type) => editBlocks((b) => (b[i] = { ...NEW_BLOCK[type](), text: block.text ?? '' }))}
          />
        ))}
        <div className="cms-add">
          <span className="cms-add__label">新增區塊</span>
          {BLOCK_TYPES.map(([type, label]) => (
            <button key={type} type="button" className="cms-chip" onClick={() => editBlocks((b) => b.push(NEW_BLOCK[type]()))}>
              ＋ {label}
            </button>
          ))}
        </div>
      </CmsSection>
    </CmsPanel>
  )
}

function BlockRow({ block, index, count, getToken, onChange, onMove, onRemove, onType }) {
  const set = (key, value) => onChange({ ...block, [key]: value })
  const id = `cms-block-${index}`

  return (
    <div className="cms-row cms-block">
      <div className="cms-row__label">
        <select
          className="cms-select"
          value={block.type}
          onChange={(e) => onType(e.target.value)}
          aria-label={`第 ${index + 1} 個區塊的類型`}
        >
          {BLOCK_TYPES.map(([type, label]) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </select>
        <div className="cms-block__tools">
          <button type="button" className="cms-icon" onClick={() => onMove(-1)} disabled={index === 0} aria-label="往上移">
            ↑
          </button>
          <button type="button" className="cms-icon" onClick={() => onMove(1)} disabled={index === count - 1} aria-label="往下移">
            ↓
          </button>
          <button
            type="button"
            className="cms-icon cms-icon--danger"
            onClick={() => window.confirm(`刪除這個${BLOCK_LABEL[block.type] ?? '區塊'}？`) && onRemove()}
            aria-label="刪除區塊"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="cms-row__value cms-block__fields">
        <BlockFields block={block} id={id} set={set} getToken={getToken} />
      </div>
    </div>
  )
}

function BlockFields({ block, id, set, getToken }) {
  switch (block.type) {
    case 'h2':
      return <CmsInput id={id} value={block.text} onChange={(v) => set('text', v)} placeholder="小標題" />
    case 'quote':
      return (
        <>
          <CmsTextarea id={id} value={block.text} onChange={(v) => set('text', v)} placeholder="引言" />
          <CmsInput value={block.attr} onChange={(v) => set('attr', v)} placeholder="出處（選填）" aria-label="引言出處" />
        </>
      )
    case 'code':
      return (
        <>
          <div className="cms-inline">
            <CmsInput value={block.lang} onChange={(v) => set('lang', v)} placeholder="語言 ts" aria-label="程式語言" />
            <CmsInput value={block.filename} onChange={(v) => set('filename', v)} placeholder="檔名（選填）" aria-label="檔名" />
          </div>
          <CmsTextarea id={id} mono value={block.code} onChange={(v) => set('code', v)} placeholder="程式碼" spellCheck={false} />
        </>
      )
    case 'image':
      return <ImageFields block={block} set={set} getToken={getToken} />
    case 'video':
      return (
        <>
          <CmsInput id={id} value={block.src} onChange={(v) => set('src', v)} placeholder="影片網址（mp4）" aria-label="影片網址" />
          <CmsInput value={block.poster} onChange={(v) => set('poster', v)} placeholder="封面圖網址（選填）" aria-label="封面圖網址" />
          <CmsInput value={block.caption} onChange={(v) => set('caption', v)} placeholder="說明（選填）" aria-label="影片說明" />
          <label className="cms-check">
            <CmsSwitch checked={block.loop} onChange={(v) => set('loop', v)} label="重複播放" />
            重複播放
          </label>
        </>
      )
    default:
      return (
        <CmsTextarea
          id={id}
          value={block.text}
          onChange={(v) => set('text', v)}
          placeholder={block.type === 'lead' ? '前言' : '段落'}
        />
      )
  }
}

function ImageFields({ block, set, getToken }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function upload(file) {
    setErr('')
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setErr('只支援 JPG、PNG、WEBP')
    if (file.size > MAX_IMAGE_BYTES) return setErr('檔案超過 1MB')
    setBusy(true)
    try {
      const { url } = await uploadSiteImage('journal', file, getToken())
      set('src', url)
    } catch (e) {
      setErr(e.message || '上傳失敗')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="cms-inline">
        <CmsInput value={block.src} onChange={(v) => set('src', v)} placeholder="圖片網址" aria-label="圖片網址" />
        <label className="cms-btn cms-btn--ghost cms-upload">
          {busy ? '上傳中' : '上傳'}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => upload(e.target.files?.[0])} hidden />
        </label>
      </div>
      {err ? <div className="cms-row__error">{err}</div> : null}
      <CmsInput value={block.alt} onChange={(v) => set('alt', v)} placeholder="替代文字（必填，說明圖片內容）" aria-label="替代文字" />
      <CmsInput value={block.caption} onChange={(v) => set('caption', v)} placeholder="圖說（選填）" aria-label="圖說" />
      <label className="cms-check">
        <CmsSwitch checked={block.frame} onChange={(v) => set('frame', v)} label="小圖置中" />
        小圖置中（手機截圖用）
      </label>
    </>
  )
}

// ── List page ──

export function JournalListEditPanel() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const { cms, ready, panelProps } = useJournalEditing()
  const [slug, setSlug] = useState('')
  if (!ready) return null

  const posts = cms.draft.posts[lang]
  const slugError = !slug
    ? ''
    : !SLUG.test(slug)
      ? '只能用小寫英文、數字和 -'
      : posts.some((p) => p.slug === slug)
        ? '這個代稱已經有人用了'
        : ''

  // Order and deletion apply to both languages, so the lists stay in step.
  const reorder = (from, to) =>
    cms.updateDraft((d) => {
      for (const l of LANGS) {
        const list = d.posts[l]
        const i = list.findIndex((p) => p.slug === posts[from].slug)
        const j = list.findIndex((p) => p.slug === posts[to].slug)
        if (i >= 0 && j >= 0) list.splice(j, 0, list.splice(i, 1)[0])
      }
    })

  const remove = (post) => {
    if (!window.confirm(`刪除「${post.title}」？中英文版本會一起刪除。儲存後才會生效。`)) return
    cms.updateDraft((d) => {
      for (const l of LANGS) {
        d.posts[l] = d.posts[l].filter((p) => p.slug !== post.slug)
        delete d.content[l]?.[post.slug]
      }
    })
  }

  const create = () => {
    if (!slug || slugError) return
    const num = String(posts.length + 1).padStart(2, '0')
    cms.updateDraft((d) => {
      for (const l of LANGS) {
        d.posts[l].unshift({
          slug,
          num,
          category: 'NOTE',
          date: today(),
          readMin: 3,
          title: l === 'zh' ? '未命名文章' : 'Untitled',
          titleEn: '',
          excerpt: '',
        })
        d.content[l] = { ...d.content[l], [slug]: { blocks: [NEW_BLOCK.p()] } }
      }
    })
    setSlug('')
    navigate(`/journal/${slug}`)
  }

  return (
    <CmsPanel title="編輯 Journal" subtitle={`${posts.length} 篇文章 · ${lang === 'zh' ? '中文' : 'English'}`} {...panelProps}>
      <CmsSection title="新增文章">
        <CmsRow label="網址代稱" htmlFor="cms-new-slug" hint={slugError || `網址會是 /journal/${slug || 'my-post'}，之後不能改。`}>
          <div className="cms-inline">
            <CmsInput
              id="cms-new-slug"
              value={slug}
              onChange={(v) => setSlug(v.trim().toLowerCase())}
              placeholder="my-post"
              aria-invalid={Boolean(slugError) || undefined}
              onKeyDown={(e) => e.key === 'Enter' && create()}
            />
            <button type="button" className="cms-btn" onClick={create} disabled={!slug || Boolean(slugError)}>
              建立
            </button>
          </div>
        </CmsRow>
      </CmsSection>

      <CmsSection title="文章">
        {posts.map((post, i) => (
          <div className="cms-row cms-post" key={post.slug}>
            <div className="cms-row__label cms-post__num">{post.num}</div>
            <div className="cms-row__value cms-post__body">
              <Link to={`/journal/${post.slug}`} className="cms-post__title">
                {post.title || '（未命名）'}
              </Link>
              <div className="cms-post__meta">
                {post.date} · {post.category} · /{post.slug}
              </div>
            </div>
            <div className="cms-block__tools">
              <button type="button" className="cms-icon" onClick={() => reorder(i, i - 1)} disabled={i === 0} aria-label="往上移">
                ↑
              </button>
              <button type="button" className="cms-icon" onClick={() => reorder(i, i + 1)} disabled={i === posts.length - 1} aria-label="往下移">
                ↓
              </button>
              <button type="button" className="cms-icon cms-icon--danger" onClick={() => remove(post)} aria-label={`刪除 ${post.title}`}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </CmsSection>
    </CmsPanel>
  )
}
