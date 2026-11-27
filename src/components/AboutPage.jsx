import { lazy, Suspense, useEffect, useRef } from 'react'
import { RichText } from './RichText.jsx'
import { Marquee } from './Marquee.jsx'
import { SiteFooter } from './SiteFooter.jsx'
import { useAdmin } from '../context/admin.js'
import { useCmsSection } from '../hooks/useCmsSection.js'
import { ABOUT_CLIENTS, ABOUT_META, cloneAbout, getDefaultAbout } from '../data/about.js'
import { uploadSiteImage } from '../lib/adminApi.js'
import { getDoc, hasBody } from '../lib/richText.js'
import { mountGrainHaze } from '../lib/grainHaze.js'
import { useLang } from '../i18n'
import '../styles/journal.css'
import '../styles/about.css'

// Only Wade edits, so Tiptap, the panel and cms.css load in edit mode, not for every visitor.
const LOGOS = import.meta.glob('../assets/about/clients/*', { eager: true, import: 'default' })

/** A client in the marquee: its logo in the text colour (the file is used as a mask), or its name. */
function Client({ name, logo, height }) {
  const src = logo && LOGOS[`../assets/about/clients/${logo}`]
  if (!src) return name
  return (
    <span className="about-clients__logo" style={{ '--logo': `url("${src}")`, '--logo-h': height && `${height}px` }}>
      <img src={src} alt={name} />
    </span>
  )
}

const Editor = lazy(() => import('./Editor.jsx').then((m) => ({ default: m.Editor })))
const AboutEditPanel = lazy(() => import('./about/AboutEditPanel.jsx').then((m) => ({ default: m.AboutEditPanel })))

/** The About page: one rich-text document per language, set out in the Journal post column. */
export default function AboutPage() {
  const { lang } = useLang()
  const admin = useAdmin()
  const cms = useCmsSection('aboutPage',getDefaultAbout, cloneAbout)
  const meta = ABOUT_META[lang]
  const haze = useRef(null)

  useEffect(() => mountGrainHaze(haze.current), [])

  useEffect(() => {
    document.title = meta.documentTitle
  }, [meta.documentTitle])

  const editing = admin.editing && cms.isEditing
  // Like an untranslated post: readers of an empty English page see the Chinese one.
  const untranslated = !editing && lang === 'en' && !hasBody(cms.content.en)
  const doc = getDoc(cms.content[untranslated ? 'zh' : lang])

  const setDoc = (next) =>
    cms.updateDraft((d) => {
      d[lang] = { doc: next }
    })
  const upload = async (file) => (await uploadSiteImage(file, admin.getToken())).url
  const saved = <RichText doc={doc} />

  return (
    <div className="journal-page journal-page--post about-page">
      <div className="about-backdrop" aria-hidden>
        <canvas className="about-backdrop__haze" ref={haze} />
      </div>
      <main>
        <article className="journal-post" lang={untranslated ? 'zh-Hant' : undefined}>
          <header className="journal-post__header">
            <h1 className="journal-post__title fade-in">{meta.title}</h1>
          </header>
          <div className="journal-post__rule" aria-hidden />
          <div className="journal-post__body">
            {cms.loading ? null : editing ? (
              <Suspense fallback={saved}>
                {/* The editor stays mounted while previewing, so the cursor and undo history survive. */}
                <Editor key={`${lang}-${admin.editorKey}`} doc={doc} onChange={setDoc} upload={upload} previewing={admin.previewing} />
                {admin.previewing ? saved : null}
              </Suspense>
            ) : (
              saved
            )}
          </div>
        </article>
        <section className="about-clients" aria-labelledby="about-clients-title">
          <h2 id="about-clients-title" className="about-clients__title">{meta.clients}</h2>
          <div className="about-clients__rows">
            {ABOUT_CLIENTS.map((row, i) => (
              <Marquee
                key={i}
                reverse={i % 2 === 1}
                items={row
                  .filter((c) => c[lang] || c.logo)
                  .map((c) => <Client key={c.zh} name={c[lang] ?? c.zh} logo={c.logo} height={c.height} />)}
              />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
      {admin.editing ? (
        <Suspense fallback={null}>
          <AboutEditPanel cms={cms} />
        </Suspense>
      ) : null}
    </div>
  )
}
