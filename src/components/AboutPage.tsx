import { lazy, Suspense, useEffect, useRef } from 'react'
import { RichText } from './RichText.tsx'
import { Marquee } from './Marquee.tsx'
import { PageHead } from './PageHead.tsx'
import { firstImage, profileLd } from '../lib/seo.ts'
import { SiteFooter } from './SiteFooter.tsx'
import { useAdmin } from '../context/admin.ts'
import { useCmsSection } from '../hooks/useCmsSection.ts'
import { ABOUT_CLIENTS, ABOUT_META, cloneAbout, getDefaultAbout } from '../data/about.ts'
import { uploadSiteImage } from '../lib/adminApi.ts'
import { docText, getDoc, hasBody } from '../lib/richText.ts'
import { mountGrainHaze } from '../lib/grainHaze.ts'
import { useLang } from '../i18n'
import type { AboutPageData, Doc } from '../lib/siteData.ts'
import '../styles/journal.css'
import '../styles/about.css'

// Only Wade edits, so Tiptap, the panel and cms.css load in edit mode, not for every visitor.
const LOGOS = import.meta.glob<string>('../assets/about/clients/*', { eager: true, import: 'default' })

/** A client in the marquee: its logo in the text colour (the file is used as a mask), or its name. */
interface ClientProps {
  name: string
  logo?: string
  /** The logo's height in px, when it differs from the default. */
  height?: number
}

function Client({ name, logo, height }: ClientProps) {
  const src = logo && LOGOS[`../assets/about/clients/${logo}`]
  if (!src) return name
  return (
    <span className="about-clients__logo" style={{ '--logo': `url("${src}")`, '--logo-h': height && `${height}px` }}>
      <img src={src} alt={name} />
    </span>
  )
}

const Editor = lazy(() => import('./Editor.tsx').then((m) => ({ default: m.Editor })))
const AboutEditPanel = lazy(() => import('./about/AboutEditPanel.tsx').then((m) => ({ default: m.AboutEditPanel })))

/** The About page: one rich-text document per language, set out in the Journal post column. */
/** @param about  the loader's document */
export default function AboutPage({ about }: { about: AboutPageData }) {
  const { lang } = useLang()
  const admin = useAdmin()
  const cms = useCmsSection('aboutPage',getDefaultAbout, cloneAbout)
  const meta = ABOUT_META[lang]
  const haze = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!haze.current) return
    return mountGrainHaze(haze.current)
  }, [])

  const editing = admin.editing && cms.isEditing
  const shown = editing ? cms.content : about
  // Like an untranslated post: readers of an empty English page see the Chinese one.
  const untranslated = !editing && lang === 'en' && !hasBody(shown.en)
  const doc = getDoc(shown[untranslated ? 'zh' : lang])

  const setDoc = (next: Doc) =>
    cms.updateDraft((d) => {
      d[lang] = { doc: next }
    })
  const upload = async (file: File) => (await uploadSiteImage(file, admin.getToken())).url
  const saved = <RichText doc={doc} />

  return (
    <div className="journal-page journal-page--post about-page">
      <PageHead
        title={meta.documentTitle}
        description={docText(doc).slice(0, 120)}
        path="/about"
        type="profile"
        image={firstImage(doc)}
        ld={profileLd(untranslated ? 'zh' : lang)}
        chineseOnly={untranslated}
      />
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
            {editing ? (
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
