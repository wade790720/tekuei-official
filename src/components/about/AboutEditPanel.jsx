import { useState } from 'react'
import { ABOUT_IMAGE_SLOTS } from '../../data/aboutImageSlots.js'
import {
  editStringToLine,
  editStringToParts,
  editStringToRichValue,
  lineToEditString,
  partsToEditString,
  richValueToEditString,
} from '../../lib/aboutRichText.js'
import { uploadAboutImage } from '../../lib/adminApi.js'
import { AdminField } from '../admin/AdminField.jsx'
import { AdminImageField } from '../admin/AdminImageField.jsx'
import { AdminRichField } from '../admin/AdminRichField.jsx'

function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="admin-section">
      <button
        type="button"
        className="admin-section__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {title}
        <span aria-hidden>{open ? '−' : '+'}</span>
      </button>
      {open && <div className="admin-section__body">{children}</div>}
    </section>
  )
}

export function AboutEditPanel({ draft, updateDraft, getToken }) {
  const [uploadingPortrait, setUploadingPortrait] = useState(false)
  const [uploadingSignature, setUploadingSignature] = useState(false)

  if (!draft) return null

  async function handlePortraitUpload(file) {
    const token = getToken()
    if (!token) throw new Error('請先登入')
    setUploadingPortrait(true)
    try {
      const { url } = await uploadAboutImage('founder', file, token)
      updateDraft((c) => {
        c.founder.image.url = `${url}?t=${Date.now()}`
      })
    } finally {
      setUploadingPortrait(false)
    }
  }

  async function handleSignatureUpload(file) {
    const token = getToken()
    if (!token) throw new Error('請先登入')
    setUploadingSignature(true)
    try {
      const { url } = await uploadAboutImage('founder-signature', file, token)
      updateDraft((c) => {
        if (!c.founder.signature) {
          c.founder.signature = { slot: 'founder-signature', url: '' }
        }
        c.founder.signature.url = `${url}?t=${Date.now()}`
      })
    } finally {
      setUploadingSignature(false)
    }
  }

  return (
    <aside className="admin-edit-panel" aria-label="About 編輯面板">
      <Section title="SEO / Meta" defaultOpen>
        <AdminField
          label="頁面標題"
          value={draft.meta.title}
          onChange={(v) => updateDraft((c) => { c.meta.title = v })}
        />
        <AdminField
          label="Meta 描述"
          value={draft.meta.description}
          onChange={(v) => updateDraft((c) => { c.meta.description = v })}
          multiline
        />
      </Section>

      <Section title="Hero">
        <AdminField
          label="Pre"
          value={draft.hero.pre}
          onChange={(v) => updateDraft((c) => { c.hero.pre = v })}
        />
        <AdminField
          label="標題"
          value={draft.hero.title}
          onChange={(v) => updateDraft((c) => { c.hero.title = v })}
        />
        <AdminField
          label="副標"
          value={draft.hero.subtitle}
          onChange={(v) => updateDraft((c) => { c.hero.subtitle = v })}
        />
        <AdminField
          label="Tagline"
          value={draft.hero.tagline}
          onChange={(v) => updateDraft((c) => { c.hero.tagline = v })}
        />
        <AdminRichField
          label="Belief"
          value={partsToEditString(draft.hero.belief.parts)}
          onChange={(v) =>
            updateDraft((c) => {
              c.hero.belief = { parts: editStringToParts(v) }
            })
          }
        />
      </Section>

      <Section title="Intro">
        <AdminField
          label="Label"
          value={draft.intro.label}
          onChange={(v) => updateDraft((c) => { c.intro.label = v })}
        />
        {draft.intro.title.map((line, i) => (
          <AdminRichField
            key={`intro-title-${i}`}
            label={`標題行 ${i + 1}`}
            value={lineToEditString(line)}
            onChange={(v) =>
              updateDraft((c) => {
                c.intro.title[i] = editStringToLine(v)
              })
            }
          />
        ))}
        {draft.intro.paragraphs.map((p, i) => (
          <AdminRichField
            key={`intro-p-${i}`}
            label={`段落 ${i + 1}`}
            value={richValueToEditString(p)}
            onChange={(v) =>
              updateDraft((c) => {
                c.intro.paragraphs[i] = editStringToRichValue(v)
              })
            }
          />
        ))}
      </Section>

      <Section title="Founder">
        <AdminImageField
          slotConfig={ABOUT_IMAGE_SLOTS.founder}
          currentUrl={draft.founder.image?.url || ''}
          onUpload={handlePortraitUpload}
          uploading={uploadingPortrait}
        />
        <AdminImageField
          slotConfig={ABOUT_IMAGE_SLOTS.founderSignature}
          currentUrl={draft.founder.signature?.url || ''}
          onUpload={handleSignatureUpload}
          uploading={uploadingSignature}
        />
        <AdminField
          label="Label"
          value={draft.founder.label}
          onChange={(v) => updateDraft((c) => { c.founder.label = v })}
        />
        <AdminField
          label="標題"
          value={draft.founder.title}
          onChange={(v) => updateDraft((c) => { c.founder.title = v })}
        />
        <AdminField
          label="姓名"
          value={draft.founder.name}
          onChange={(v) => updateDraft((c) => { c.founder.name = v })}
        />
        <AdminField
          label="職稱"
          value={draft.founder.role}
          onChange={(v) => updateDraft((c) => { c.founder.role = v })}
        />
        {draft.founder.paragraphs.map((p, i) => (
          <AdminRichField
            key={`founder-p-${i}`}
            label={`段落 ${i + 1}`}
            value={richValueToEditString(p)}
            onChange={(v) =>
              updateDraft((c) => {
                c.founder.paragraphs[i] = editStringToRichValue(v)
              })
            }
          />
        ))}
        <AdminField
          label="Traits（每行一項）"
          value={draft.founder.traits.join('\n')}
          onChange={(v) =>
            updateDraft((c) => {
              c.founder.traits = v.split('\n').map((s) => s.trim()).filter(Boolean)
            })
          }
          multiline
        />
      </Section>

      <Section title="Approach">
        <AdminField
          label="Label"
          value={draft.approach.label}
          onChange={(v) => updateDraft((c) => { c.approach.label = v })}
        />
        {draft.approach.title.map((line, i) => (
          <AdminRichField
            key={`approach-title-${i}`}
            label={`標題行 ${i + 1}`}
            value={lineToEditString(line)}
            onChange={(v) =>
              updateDraft((c) => {
                c.approach.title[i] = editStringToLine(v)
              })
            }
          />
        ))}
        {draft.approach.items.map((item, i) => (
          <div key={item.num} className="admin-subgroup">
            <div className="admin-subgroup__label">步驟 {item.num}</div>
            <AdminField
              label="標題"
              value={item.title}
              onChange={(v) =>
                updateDraft((c) => {
                  c.approach.items[i].title = v
                })
              }
            />
            <AdminField
              label="英文"
              value={item.en}
              onChange={(v) =>
                updateDraft((c) => {
                  c.approach.items[i].en = v
                })
              }
            />
            <AdminField
              label="說明"
              value={item.desc}
              onChange={(v) =>
                updateDraft((c) => {
                  c.approach.items[i].desc = v
                })
              }
              multiline
            />
          </div>
        ))}
      </Section>

      <Section title="Beliefs">
        <AdminField
          label="Label"
          value={draft.beliefs.label}
          onChange={(v) => updateDraft((c) => { c.beliefs.label = v })}
        />
        {draft.beliefs.items.map((item, i) => (
          <div key={item.num} className="admin-subgroup">
            <div className="admin-subgroup__label">信念 {item.num}</div>
            <AdminField
              label="標題"
              value={item.title}
              onChange={(v) =>
                updateDraft((c) => {
                  c.beliefs.items[i].title = v
                })
              }
            />
            <AdminRichField
              label="說明"
              value={richValueToEditString(item.desc)}
              onChange={(v) =>
                updateDraft((c) => {
                  c.beliefs.items[i].desc = editStringToRichValue(v)
                })
              }
            />
          </div>
        ))}
      </Section>

      <Section title="Quote">
        {draft.quote.lines.map((line, i) => (
          <AdminRichField
            key={`quote-line-${i}`}
            label={`引言行 ${i + 1}`}
            value={lineToEditString(line)}
            onChange={(v) =>
              updateDraft((c) => {
                c.quote.lines[i] = editStringToLine(v)
              })
            }
          />
        ))}
        <AdminField
          label="英文"
          value={draft.quote.en}
          onChange={(v) => updateDraft((c) => { c.quote.en = v })}
        />
      </Section>

      <Section title="Services">
        <AdminField
          label="服務項目（每行一項）"
          value={draft.services.join('\n')}
          onChange={(v) =>
            updateDraft((c) => {
              c.services = v.split('\n').map((s) => s.trim()).filter(Boolean)
            })
          }
          multiline
        />
      </Section>

      <Section title="CTA">
        <AdminField
          label="Label"
          value={draft.cta.label}
          onChange={(v) => updateDraft((c) => { c.cta.label = v })}
        />
        {draft.cta.title.map((line, i) => (
          <AdminRichField
            key={`cta-title-${i}`}
            label={`標題行 ${i + 1}`}
            value={lineToEditString(line)}
            onChange={(v) =>
              updateDraft((c) => {
                c.cta.title[i] = editStringToLine(v)
              })
            }
          />
        ))}
        <AdminField
          label="Email"
          value={draft.cta.email}
          onChange={(v) => updateDraft((c) => { c.cta.email = v })}
        />
      </Section>
    </aside>
  )
}
