import { useEffect, useEffectEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SidePanel, EyeOffIcon, FormRow, PanelSection, SortRows, TagsInput } from '../SidePanel.tsx'
import { TextArea } from '../TextArea.tsx'
import { TextField } from '../TextField.tsx'
import { Button } from '../Button.tsx'
import { TranslateSection } from '../admin/TranslateSection.tsx'
import { useJournal } from '../../context/journal.ts'
import { differsOnlyIn, parseTags, postTags, today } from '../../data/journal.ts'
import { CMS_LABELS as T } from '../../data/admin.ts'
import { useCmsEditing } from '../../hooks/useCmsEditing.ts'
import { useLang } from '../../i18n'
import { emptyDoc, getDoc } from '../../lib/richText.ts'
import { LANGS } from '../../lib/siteData.ts'
import type { Doc, JournalData, JournalPost } from '../../lib/siteData.ts'

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
// The number shown on the site (01, 02 …) follows the list order.
const renumber = (d: JournalData) => {
  for (const l of LANGS) d.posts[l]?.forEach((p, i) => (p.num = String(i + 1).padStart(2, '0')))
}

function useJournalEditing() {
  const cms = useJournal()
  return { cms, ...useCmsEditing(cms) }
}

const AUTOSAVE_MS = 3000

export function JournalPostEditPanel({ slug }: { slug: string }) {
  const { lang } = useLang()
  const { admin, cms, ready, panelProps, saveWith } = useJournalEditing()
  const draft = ready ? cms.draft : null

  // A draft saves itself once typing pauses. A published post never does: half an edit would go live.
  const isDraft = Boolean(draft?.posts.zh?.find((p) => p.slug === slug)?.draft)
  const autosave = isDraft && draft !== null && differsOnlyIn(draft, cms.savedContent, slug)
  const saveNow = useEffectEvent(() => panelProps.onSave())
  useEffect(() => {
    if (!autosave) return undefined
    const timer = setTimeout(saveNow, AUTOSAVE_MS)
    return () => clearTimeout(timer)
  }, [autosave, cms.draft])

  if (!draft) return null

  const post = draft.posts[lang]?.find((p) => p.slug === slug)
  if (!post) return null

  const zhPost = draft.posts.zh?.find((p) => p.slug === slug)

  // Title and text belong to one language. Date and tags are shared.
  const setPost = (key: 'title' | 'titleEn' | 'excerpt', value: string) =>
    cms.updateDraft((d) => {
      const p = d.posts[lang].find((x) => x.slug === slug)
      if (p) p[key] = value
    })
  const setShared = <K extends 'tags' | 'date'>(key: K, value: JournalPost[K]) =>
    cms.updateDraft((d) => {
      for (const l of LANGS) {
        const p = d.posts[l]?.find((x) => x.slug === slug)
        if (p) p[key] = value
      }
    })
  const markDraft = (asDraft: boolean) => (d: JournalData) => {
    for (const l of LANGS) {
      const p = d.posts[l]?.find((x) => x.slug === slug)
      if (p) p.draft = asDraft
    }
  }
  const actions = isDraft
    ? { saveLabel: T.publish, saveAlways: true, onSave: () => saveWith(markDraft(false)), labels: { dirty: T.draftDirty, saved: T.draftSaved } }
    : {
        saveLabel: T.update,
        labels: { dirty: T.publishedDirty, saved: T.published },
        menu: [{ value: 'unpublish', label: T.unpublish, icon: <EyeOffIcon />, onSelect: () => saveWith(markDraft(true)) }],
      }

  return (
    <SidePanel
      title="編輯文章"
      subtitle={`/journal/${slug} · ${lang === 'zh' ? '中文' : 'English'}`}
      preview
      {...panelProps}
      {...actions}
      actions={
          <TranslateSection
            zhDoc={getDoc(draft.content.zh?.[slug])}
            enDoc={getDoc(draft.content.en?.[slug])}
            fields={{ title: zhPost?.title, excerpt: zhPost?.excerpt }}
            onDone={({ doc, fields }: { doc: Doc; fields: Record<string, string> }) => {
              cms.updateDraft((d) => {
                d.content.en = { ...d.content.en, [slug]: { doc } }
                const en = d.posts.en?.find((p) => p.slug === slug)
                if (en) Object.assign(en, fields)
              })
              admin.reloadEditor()
            }}
          />
      }
    >
      <FormRow label="標題" htmlFor="cms-title">
        <TextField id="cms-title" value={post.title} onChange={(v) => setPost('title', v)} placeholder="文章標題" />
      </FormRow>
      <FormRow label="英文副標" htmlFor="cms-title-en">
        <TextField id="cms-title-en" value={post.titleEn} onChange={(v) => setPost('titleEn', v)} placeholder="English subtitle" />
      </FormRow>
      <FormRow label="標籤" htmlFor="cms-tags" hint="用逗號分開，例如 AI, MARKETING。中英文共用">
        <TagsInput key={slug} id="cms-tags" tags={postTags(post)} parse={parseTags} onChange={(tags: string[]) => setShared('tags', tags)} />
      </FormRow>
      <FormRow label="日期" htmlFor="cms-date" hint="格式 2026.11.19，中英文共用">
        <TextField id="cms-date" value={post.date} onChange={(v) => setShared('date', v)} />
      </FormRow>
      <FormRow label="摘要" htmlFor="cms-excerpt" hint="顯示在列表和首頁">
        <TextArea id="cms-excerpt" value={post.excerpt} onChange={(v) => setPost('excerpt', v)} placeholder="一兩句話說明這篇文章" />
      </FormRow>
    </SidePanel>
  )
}

export function JournalListEditPanel() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const { cms, ready, panelProps } = useJournalEditing()
  const [slug, setSlug] = useState('')
  if (!ready || !cms.draft) return null

  const posts = cms.draft.posts[lang]
  const slugError = !slug
    ? ''
    : !SLUG.test(slug)
      ? '只能用小寫英文、數字和 -'
      : posts.some((p) => p.slug === slug)
        ? '這個代稱已經有人用了'
        : ''

  // Order and deletion apply to both languages, so the lists stay in step.
  const reorder = (from: number, to: number) =>
    cms.updateDraft((d) => {
      for (const l of LANGS) {
        const list = d.posts[l]
        const i = list.findIndex((p) => p.slug === posts[from].slug)
        const j = list.findIndex((p) => p.slug === posts[to].slug)
        if (i >= 0 && j >= 0) list.splice(j, 0, list.splice(i, 1)[0])
      }
      renumber(d)
    })

  const remove = (post: JournalPost) => {
    if (!window.confirm(`刪除「${post.title}」？中英文版本會一起刪除，儲存後才會生效。`)) return
    cms.updateDraft((d) => {
      for (const l of LANGS) {
        d.posts[l] = d.posts[l].filter((p) => p.slug !== post.slug)
        delete d.content[l]?.[post.slug]
      }
      renumber(d)
    })
  }

  const create = () => {
    if (!slug || slugError) return
    cms.updateDraft((d) => {
      for (const l of LANGS) {
        d.posts[l].unshift({
          slug,
          num: '01',
          tags: ['NOTE'],
          draft: true,
          date: today(),
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
        <FormRow label="網址代稱" htmlFor="cms-new-slug" hint={slugError || `網址會是 /journal/${slug || 'my-post'}，之後不能改`}>
          <div className="cms-inline">
            <TextField
              id="cms-new-slug"
              value={slug}
              onChange={(v) => setSlug(v.trim().toLowerCase())}
              placeholder="my-post"
              aria-invalid={Boolean(slugError) || undefined}
              onKeyDown={(e) => e.key === 'Enter' && create()}
            />
            <Button onClick={create} disabled={!slug || Boolean(slugError)}>
              建立
            </Button>
          </div>
        </FormRow>
      </PanelSection>

      <PanelSection title="文章">
        <SortRows items={posts} keyOf={(post: JournalPost) => post.slug} nameOf={(post: JournalPost) => post.title} onMove={reorder}>
          {(post: JournalPost) => (
            <>
              <div className="cms-post__num">{post.num}</div>
              <div className="cms-post__body">
                <Link to={`/journal/${post.slug}`} className="cms-post__title">
                  {post.title || '（未命名）'}
                </Link>
                <div className="cms-post__meta">
                  {post.draft ? '草稿 · ' : ''}
                  {post.date} · {postTags(post).join(', ')} · /{post.slug}
                </div>
              </div>
              <button type="button" className="cms-icon cms-icon--danger" onClick={() => remove(post)} aria-label={`刪除「${post.title}」`}>
                ✕
              </button>
            </>
          )}
        </SortRows>
      </PanelSection>
    </SidePanel>
  )
}

