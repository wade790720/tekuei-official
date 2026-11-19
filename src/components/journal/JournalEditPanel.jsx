import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TextInput, SidePanel, FormRow, PanelSection, TextArea } from '../SidePanel.jsx'
import { useAdmin, useAdminSave } from '../../context/admin.js'
import { useJournal } from '../../context/journal.js'
import { CMS_LABELS as T } from '../../data/admin.js'
import { useLang } from '../../i18n'
import { uploadSiteImage } from '../../lib/adminApi.js'
import { emptyDoc, getDoc } from '../../lib/richText.js'

// Tiptap is large; load it only when Wade opens a post in edit mode, not for every visitor.
const Editor = lazy(() => import('../Editor.jsx').then((m) => ({ default: m.Editor })))

const LANGS = ['zh', 'en']
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
// The number shown on the site (01, 02 …) follows the list order.
const renumber = (d) => {
  for (const l of LANGS) d.posts[l]?.forEach((p, i) => (p.num = String(i + 1).padStart(2, '0')))
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
    if (dirty && !window.confirm(T.logoutConfirm)) return
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
  // The editor saves its own document; the old block list goes away on the first edit.
  const setDoc = (doc) =>
    cms.updateDraft((d) => {
      d.content[lang][slug] = { doc }
    })
  const upload = async (file) => (await uploadSiteImage('journal', file, admin.getToken())).url

  return (
    <SidePanel title="編輯文章" subtitle={`/journal/${slug} · ${lang === 'zh' ? '中文' : 'English'}`} {...panelProps}>
      <FormRow label="標題" htmlFor="cms-title">
        <TextInput id="cms-title" value={post.title} onChange={(v) => setPost('title', v)} placeholder="文章標題" />
      </FormRow>
      <FormRow label="英文副標" htmlFor="cms-title-en">
        <TextInput id="cms-title-en" value={post.titleEn} onChange={(v) => setPost('titleEn', v)} placeholder="English subtitle" />
      </FormRow>
      <FormRow label="分類" htmlFor="cms-category" hint="中英文共用">
        <TextInput id="cms-category" value={post.category} onChange={(v) => setShared('category', v.toUpperCase())} />
      </FormRow>
      <FormRow label="日期" htmlFor="cms-date" hint="格式 2026.11.19，中英文共用">
        <TextInput id="cms-date" value={post.date} onChange={(v) => setShared('date', v)} />
      </FormRow>
      <FormRow label="閱讀時間" htmlFor="cms-read" hint="分鐘，中英文共用">
        <TextInput
          id="cms-read"
          type="number"
          min="1"
          value={post.readMin}
          onChange={(v) => setShared('readMin', Math.max(1, Number(v) || 1))}
        />
      </FormRow>
      <FormRow label="摘要" htmlFor="cms-excerpt" hint="顯示在列表和首頁">
        <TextArea id="cms-excerpt" value={post.excerpt} onChange={(v) => setPost('excerpt', v)} placeholder="一兩句話說明這篇文章" />
      </FormRow>
      <FormRow label="內文">
        <Suspense fallback={<div className="cms-ed--loading">載入編輯器……</div>}>
          <Editor key={`${slug}-${lang}`} doc={getDoc(body)} onChange={setDoc} upload={upload} />
        </Suspense>
      </FormRow>
    </SidePanel>
  )
}

// ── List page ──

export function JournalListEditPanel() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const { cms, ready, panelProps } = useJournalEditing()
  const [slug, setSlug] = useState('')
  const [drag, setDrag] = useState(null) // { from, gap } while a row is dragged; gap = insert before row `gap`
  const rows = useRef([])
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
      renumber(d)
    })

  const remove = (post) => {
    if (!window.confirm(`刪除「${post.title}」？中英文版本會一起刪除。儲存後才會生效。`)) return
    cms.updateDraft((d) => {
      for (const l of LANGS) {
        d.posts[l] = d.posts[l].filter((p) => p.slug !== post.slug)
        delete d.content[l]?.[post.slug]
      }
      renumber(d)
    })
  }

  // Drag a row by its handle. Pointer events cover mouse, pen and touch.
  // gap k (0..n) means "insert before row k"; n is after the last row.
  const gapAt = (y) => {
    const k = rows.current.slice(0, posts.length).findIndex((el) => el && y < el.getBoundingClientRect().top + el.offsetHeight / 2)
    return k < 0 ? posts.length : k
  }
  // Removing the dragged row first shifts the rows below it up by one.
  const target = (d) => (d.gap > d.from ? d.gap - 1 : d.gap)
  const dragStart = (e, i) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ from: i, gap: i })
  }
  const dragMove = (e) => drag && setDrag({ ...drag, gap: gapAt(e.clientY) })
  const dragEnd = () => {
    if (drag && target(drag) !== drag.from) reorder(drag.from, target(drag))
    setDrag(null)
  }
  // Keyboard: focus the handle, then ↑ / ↓ moves the post.
  const dragKey = (e, i) => {
    const to = e.key === 'ArrowUp' ? i - 1 : e.key === 'ArrowDown' ? i + 1 : -1
    if (to < 0 || to >= posts.length) return
    e.preventDefault()
    reorder(i, to)
    requestAnimationFrame(() => rows.current[to]?.querySelector('.cms-drag')?.focus())
  }

  const create = () => {
    if (!slug || slugError) return
    cms.updateDraft((d) => {
      for (const l of LANGS) {
        d.posts[l].unshift({
          slug,
          num: '01',
          category: 'NOTE',
          date: today(),
          readMin: 3,
          title: l === 'zh' ? '未命名文章' : 'Untitled',
          titleEn: '',
          excerpt: '',
        })
        d.content[l] = { ...d.content[l], [slug]: { doc: emptyDoc() } }
      }
      renumber(d)
    })
    setSlug('')
    navigate(`/journal/${slug}`)
  }

  return (
    <SidePanel title="編輯 Journal" subtitle={`${posts.length} 篇文章 · ${lang === 'zh' ? '中文' : 'English'}`} {...panelProps}>
      <PanelSection title="新增文章">
        <FormRow label="網址代稱" htmlFor="cms-new-slug" hint={slugError || `網址會是 /journal/${slug || 'my-post'}，之後不能改。`}>
          <div className="cms-inline">
            <TextInput
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
        </FormRow>
      </PanelSection>

      <PanelSection title="文章">
        <div className="cms-sort" data-dragging={drag ? '' : undefined}>
          {posts.map((post, i) => {
            const moved = drag && target(drag) !== drag.from
            const drop = !moved ? undefined : drag.gap === i ? 'before' : drag.gap === posts.length && i === posts.length - 1 ? 'after' : undefined
            return (
              <div
                className="cms-row cms-post"
                key={post.slug}
                ref={(el) => (rows.current[i] = el)}
                data-dragged={drag?.from === i || undefined}
                data-drop={drop}
              >
                <button
                  type="button"
                  className="cms-drag"
                  aria-label={`拖曳調整「${post.title}」的順序，或用上下鍵`}
                  onPointerDown={(e) => dragStart(e, i)}
                  onPointerMove={dragMove}
                  onPointerUp={dragEnd}
                  onPointerCancel={() => setDrag(null)}
                  onKeyDown={(e) => dragKey(e, i)}
                >
                  <GripIcon />
                </button>
                <div className="cms-post__num">{post.num}</div>
                <div className="cms-post__body">
                  <Link to={`/journal/${post.slug}`} className="cms-post__title">
                    {post.title || '（未命名）'}
                  </Link>
                  <div className="cms-post__meta">
                    {post.date} · {post.category} · /{post.slug}
                  </div>
                </div>
                <button type="button" className="cms-icon cms-icon--danger" onClick={() => remove(post)} aria-label={`刪除 ${post.title}`}>
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      </PanelSection>
    </SidePanel>
  )
}

function GripIcon() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden>
      {[2, 7, 12].flatMap((y) => [<circle key={`a${y}`} cx="2.5" cy={y} r="1.2" />, <circle key={`b${y}`} cx="7.5" cy={y} r="1.2" />])}
    </svg>
  )
}
