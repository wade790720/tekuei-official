import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SidePanel, EyeOffIcon, PublishIcon, FormRow, PanelSection, SortRows, TagsInput } from '../SidePanel.jsx'
import { TextField } from '../TextField.jsx'
import { Button } from '../Button.jsx'
import { DropdownMenu } from '../DropdownMenu.jsx'
import { TranslateSection } from '../admin/TranslateSection.jsx'
import { useWork } from '../../context/work.js'
import { CODE_PROJECT_IDS, PROJECT_SECTIONS, projectBody, projectLink, projectTitle, projectType } from '../../data/work.ts'
import { projectCover } from '../../data/workMedia.ts'
import { LABS } from '../../labs/index.js'
import { CMS_LABELS as T } from '../../data/admin.ts'
import { useCmsEditing } from '../../hooks/useCmsEditing.js'
import { useLang } from '../../i18n'
import { uploadSiteImage } from '../../lib/adminApi.ts'
import { emptyDoc, getDoc } from '../../lib/richText.ts'

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
// Ids a new project cannot take: a project that began in code keeps its id even after it is deleted, and each lab has a card.
const TAKEN = new Set([...CODE_PROJECT_IDS, ...LABS.map((lab) => lab.id)])
const SECTION_ITEMS = PROJECT_SECTIONS.map((s) => ({ value: s.id, label: s.zh }))
const sectionOf = projectType
const sectionName = (id) => PROJECT_SECTIONS.find((s) => s.id === id)?.zh
const parseTags = (text) => [...new Set(text.split(/[,，、]/).map((t) => t.trim()).filter(Boolean))]

function useWorkEditing() {
  const cms = useWork()
  return { cms, ...useCmsEditing(cms) }
}

function SectionPicker({ value, onSelect }) {
  return (
    <DropdownMenu
      label="區段"
      trigger={sectionName(value)}
      items={SECTION_ITEMS}
      value={value}
      onSelect={onSelect}
    />
  )
}

/** The Projects list: add a project, reorder and delete. A project's own fields are edited on its page. */
export function WorkListEditPanel() {
  const navigate = useNavigate()
  const { cms, ready, panelProps } = useWorkEditing()
  const [slug, setSlug] = useState('')
  const [type, setType] = useState('web')
  if (!ready) return null

  const items = cms.draft.items
  const slugError = !slug
    ? ''
    : !SLUG.test(slug)
      ? '只能用小寫英文、數字和 -'
      : TAKEN.has(slug) || items.some((item) => item.id === slug)
        ? '這個代稱已經有人用了'
        : ''

  const create = () => {
    if (!slug || slugError) return
    cms.updateDraft((d) => {
      d.items.push({ id: slug, type, draft: true, client: '', title: '未命名專案', tags: [], link: '', thumbImage: { url: '' }, en: { client: '', title: '' } })
      d.content = { zh: { ...d.content?.zh, [slug]: { doc: emptyDoc() } }, en: { ...d.content?.en, [slug]: { doc: emptyDoc() } } }
    })
    setSlug('')
    navigate(`/projects/${slug}`)
  }

  const remove = (item) => {
    if (!window.confirm(`刪除「${projectTitle(item)}」？內頁的中英文內容會一起刪除，儲存後才會生效。`)) return
    cms.updateDraft((d) => {
      d.items = d.items.filter((x) => x.id !== item.id)
      // Or the next load would add it back
      if (CODE_PROJECT_IDS.includes(item.id)) d.removed = [...(d.removed ?? []), item.id]
      delete d.content?.zh?.[item.id]
      delete d.content?.en?.[item.id]
    })
  }

  return (
    <SidePanel title="編輯 Projects" subtitle={`${items.length} 個專案`} {...panelProps}>
      <PanelSection title="新增專案">
        <FormRow label="區段">
          <SectionPicker value={type} onSelect={setType} />
        </FormRow>
        <FormRow label="網址代稱" htmlFor="cms-new-project" hint={slugError || `網址會是 /projects/${slug || 'my-project'}，之後不能改`}>
          <div className="cms-inline">
            <TextField
              id="cms-new-project"
              value={slug}
              onChange={(v) => setSlug(v.trim().toLowerCase())}
              placeholder="my-project"
              aria-invalid={Boolean(slugError) || undefined}
              onKeyDown={(e) => e.key === 'Enter' && create()}
            />
            <Button onClick={create} disabled={!slug || Boolean(slugError)}>
              建立
            </Button>
          </div>
        </FormRow>
      </PanelSection>

      <PanelSection title="專案">
        <SortRows
          items={items}
          keyOf={(item) => item.id}
          nameOf={projectTitle}
          onMove={(from, to) => cms.updateDraft((d) => d.items.splice(to, 0, d.items.splice(from, 1)[0]))}
        >
          {(item, i) => (
            <>
              <div className="cms-post__num">{String(i + 1).padStart(2, '0')}</div>
              <div className="cms-post__body">
                <Link to={`/projects/${item.id}`} className="cms-post__title">
                  {projectTitle(item) || '（未命名）'}
                </Link>
                <div className="cms-post__meta">
                  {item.draft ? '草稿 · ' : ''}
                  {sectionName(sectionOf(item))} · /{item.id}
                </div>
              </div>
              <button type="button" className="cms-icon cms-icon--danger" onClick={() => remove(item)} aria-label={`刪除「${projectTitle(item)}」`}>
                ✕
              </button>
            </>
          )}
        </SortRows>
        <p className="cms-row__hint">順序是每一區裡面的先後。Labs 寫在程式碼裡，不在這裡編輯。</p>
      </PanelSection>
    </SidePanel>
  )
}

/** One project: the card's fields, and for a project with an editable page, publishing and translation. */
export function ProjectEditPanel({ id, coded = false }) {
  const { lang } = useLang()
  const { admin, cms, ready, panelProps, saveWith } = useWorkEditing()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  if (!ready) return null

  const item = cms.draft.items.find((x) => x.id === id)
  if (!item) return null

  const hasPage = Boolean(projectBody(cms.draft, id, 'zh'))
  const set = (change) =>
    cms.updateDraft((d) => {
      change(d.items.find((x) => x.id === id))
    })
  // Title and client belong to one language. The rest is shared.
  const text = lang === 'en' ? { title: item.en?.title ?? '', client: item.en?.client ?? '' } : { title: projectTitle(item), client: item.client }
  const setText = (key, value) =>
    set((x) => {
      if (lang === 'en') x.en = { ...x.en, [key]: value }
      else {
        x[key] = value
        // The first three cases store the title in two halves; an edited title is one string.
        if (key === 'title') x.titleEmWord = ''
      }
    })

  const upload = async (file) => {
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      const { url } = await uploadSiteImage(file, admin.getToken())
      set((x) => {
        x.thumbImage = { url }
      })
    } catch (err) {
      setUploadError(err.message || '上傳失敗')
    } finally {
      setUploading(false)
    }
  }

  const addPage = () =>
    cms.updateDraft((d) => {
      d.content = { zh: { ...d.content?.zh, [id]: { doc: emptyDoc() } }, en: { ...d.content?.en, [id]: { doc: emptyDoc() } } }
    })

  const markDraft = (draft) => (d) => {
    d.items.find((x) => x.id === id).draft = draft
  }
  // Saving never changes whether the project is public. Publishing and unpublishing are their own actions in the menu.
  const actions = item.draft
    ? {
        saveLabel: T.saveDraft,
        labels: { dirty: T.unsaved, saved: T.projectDraft },
        menu: [{ value: 'publish', label: T.publish, icon: <PublishIcon />, onSelect: () => saveWith(markDraft(false)) }],
      }
    : {
        saveLabel: T.update,
        labels: { dirty: T.publishedDirty, saved: T.published },
        menu: [{ value: 'unpublish', label: T.unpublish, icon: <EyeOffIcon />, onSelect: () => saveWith(markDraft(true)) }],
      }

  return (
    <SidePanel
      title="編輯專案"
      subtitle={`/projects/${id} · ${lang === 'zh' ? '中文' : 'English'}`}
      preview={hasPage}
      {...panelProps}
      {...actions}
      actions={
        hasPage ? (
            <TranslateSection
              zhDoc={getDoc(projectBody(cms.draft, id, 'zh'))}
              enDoc={getDoc(projectBody(cms.draft, id, 'en'))}
              fields={{ title: projectTitle(item), client: item.client }}
              onDone={({ doc, fields }) => {
                cms.updateDraft((d) => {
                  d.content.en = { ...d.content.en, [id]: { doc } }
                  const x = d.items.find((y) => y.id === id)
                  x.en = { ...x.en, ...fields }
                })
                admin.reloadEditor()
              }}
            />
        ) : null
      }
    >
      <FormRow label="區段" hint="中英文共用">
        <SectionPicker value={sectionOf(item)} onSelect={(v) => set((x) => (x.type = v))} />
      </FormRow>
      <FormRow label="標題" htmlFor="cms-project-title" hint={lang === 'en' ? '留空時顯示中文標題' : undefined}>
        <TextField id="cms-project-title" value={text.title} onChange={(v) => setText('title', v)} placeholder="專案名稱" />
      </FormRow>
      <FormRow label="單位" htmlFor="cms-project-client" hint="卡片上方的小字，例如客戶或展覽地點">
        <TextField id="cms-project-client" value={text.client} onChange={(v) => setText('client', v)} />
      </FormRow>
      <FormRow label="標籤" htmlFor="cms-project-tags" hint="用逗號分開，中英文共用">
        <TagsInput key={id} id="cms-project-tags" tags={item.tags ?? []} parse={parseTags} onChange={(tags) => set((x) => (x.tags = tags))} />
      </FormRow>
      <FormRow
        label="封面圖"
        hint={projectCover(item) === item.thumbImage?.url ? '列表卡片和內頁的開場都用這張。橫式、寬 2000px 以上最合適，中英文共用' : '現在顯示的是程式碼裡的圖。在這裡上傳之後，就改用你上傳的'}
        error={uploadError}
      >
        <div className="cms-inline">
          {item.thumbImage?.url ? <img className="cms-thumb" src={item.thumbImage.url} alt="" /> : null}
          <Button as="label" variant="ghost">
            {uploading ? '上傳中' : item.thumbImage?.url ? '更換' : '上傳'}
            <input type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files[0])} />
          </Button>
        </div>
      </FormRow>
      <FormRow label="外部連結" htmlFor="cms-project-link" hint={hasPage ? '專案的網站。顯示在內頁的標題下方' : coded ? '內頁寫在程式碼裡，這個欄位目前用不到' : '沒有內頁時，卡片直接連到這個網址'}>
        <TextField id="cms-project-link" value={item.link ?? ''} onChange={(v) => set((x) => (x.link = v.trim()))} placeholder="https://" />
      </FormRow>
      <p className="cms-row__hint">卡片現在連到 {projectLink(item, cms.draft)}</p>
      {hasPage || coded ? null : (
        <FormRow label="內頁" hint="這個專案沒有內頁。建立之後可以在頁面上寫內文">
          <Button variant="ghost" onClick={addPage}>
            建立內頁
          </Button>
        </FormRow>
      )}
    </SidePanel>
  )
}
