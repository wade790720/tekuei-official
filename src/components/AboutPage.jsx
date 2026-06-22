import { useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AboutEditPanel } from './about/AboutEditPanel.jsx'
import { AboutLine, AboutParts } from './AboutRichText.jsx'
import { AdminEditToolbar } from './admin/AdminEditToolbar.jsx'
import { AdminLoginGate } from './admin/AdminLoginGate.jsx'
import { HomeFadeIn } from './HomeFadeIn.jsx'
import { downloadDataJson, useAboutContent } from '../hooks/useAboutContent.js'
import { useSiteAdmin } from '../hooks/useSiteAdmin.js'
import '../styles/tekueiWork.css'
import '../styles/tekueiAbout.css'
import '../styles/tekueiAdmin.css'

function AboutCopy({ value, className }) {
  if (typeof value === 'string') {
    return <HomeFadeIn className={className}>{value}</HomeFadeIn>
  }
  return (
    <HomeFadeIn className={className}>
      <AboutParts parts={value.parts} />
    </HomeFadeIn>
  )
}

export default function AboutPage() {
  const {
    content,
    siteData,
    draft,
    loading,
    saving,
    error,
    setError,
    isEditing,
    startEditing,
    cancelEditing,
    updateDraft,
    saveDraft,
  } = useAboutContent()

  const handleEnterEdit = useCallback(() => {
    if (!isEditing) startEditing()
  }, [isEditing, startEditing])

  const admin = useSiteAdmin({ onEnterEdit: handleEnterEdit })

  const {
    meta,
    hero,
    intro,
    founder,
    approach,
    beliefs,
    quote,
    services,
    cta,
  } = content

  const founderImageUrl = founder.image?.url || ''
  const founderSignatureUrl = founder.signature?.url || ''

  useEffect(() => {
    document.title = meta.title
    const el = document.querySelector('meta[name="description"]')
    if (el) el.setAttribute('content', meta.description)
  }, [meta.title, meta.description])

  async function handleSave() {
    const token = admin.getToken()
    if (!token) {
      setError('請先登入')
      admin.openLogin()
      return
    }
    try {
      await saveDraft(token)
    } catch {
      /* error set in hook */
    }
  }

  function handleDownload() {
    downloadDataJson(siteData, draft ?? content)
  }

  function handleLogout() {
    admin.logout()
    cancelEditing()
  }

  return (
    <div
      className={[
        'tekuei-about-page',
        isEditing ? 'is-admin-editing' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <AdminLoginGate
        open={admin.showLogin}
        error={admin.loginError}
        loggingIn={admin.loggingIn}
        onClose={admin.closeLogin}
        onLogin={admin.login}
      />

      {isEditing && draft && (
        <>
          <AboutEditPanel
            draft={draft}
            updateDraft={updateDraft}
            getToken={admin.getToken}
          />
          <AdminEditToolbar
            saving={saving}
            error={error}
            onSave={handleSave}
            onCancel={cancelEditing}
            onLogout={handleLogout}
            onDownload={handleDownload}
          />
        </>
      )}

      {loading ? (
        <div className="about-loading">載入中⋯</div>
      ) : (
        <div className="about-content">
          <header className="about-header">
            <div className="about-header__inner">
              <div>
                <div className="about-header__pre">{hero.pre}</div>
                <h1 className="about-header__title">{hero.title}</h1>
                <div className="about-header__subtitle">{hero.subtitle}</div>
              </div>
              <div className="about-header__aside">
                <div className="about-header__tagline">{hero.tagline}</div>
                <div className="about-header__belief">
                  <AboutParts parts={hero.belief.parts} />
                </div>
              </div>
            </div>
          </header>

          <div className="about-rule" aria-hidden>
            <div className="about-rule__line" />
          </div>

          <section className="about-intro" aria-labelledby="about-intro-title">
            <div className="about-section-inner about-intro__layout">
              <HomeFadeIn className="about-intro__head">
                <div className="about-label">{intro.label}</div>
                <h2 className="about-title" id="about-intro-title">
                  {intro.title.map((line) => (
                    <span key={typeof line === 'string' ? line : line.parts.map((p) => p.t).join('')}>
                      <AboutLine line={line} />
                      <br />
                    </span>
                  ))}
                </h2>
              </HomeFadeIn>
              <div className="about-intro__body">
                {intro.paragraphs.map((p) => (
                  <AboutCopy
                    key={typeof p === 'string' ? p.slice(0, 20) : p.parts[0].t.slice(0, 12)}
                    value={p}
                    className="about-intro__para"
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="about-founder" aria-labelledby="about-founder-title">
            <div className="about-section-inner about-founder__grid">
              <HomeFadeIn className="about-founder__visual" aria-hidden={!founderImageUrl}>
                <div
                  className={[
                    'about-founder__frame',
                    founderImageUrl ? 'about-founder__frame--has-image' : '',
                    founderSignatureUrl ? 'about-founder__frame--has-signature' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {founderImageUrl ? (
                    <div className="about-founder__media">
                      <img
                        className="about-founder__photo"
                        src={founderImageUrl}
                        alt={founder.name}
                      />
                    </div>
                  ) : null}
                  {founderSignatureUrl ? (
                    <img
                      className="about-founder__signature"
                      src={founderSignatureUrl}
                      alt=""
                      aria-hidden="true"
                    />
                  ) : null}
                  {!founderImageUrl ? (
                    <div className="about-founder__name">{founder.name}</div>
                  ) : null}
                </div>
              </HomeFadeIn>
              <div className="about-founder__copy">
                <HomeFadeIn>
                  <div className="about-label">{founder.label}</div>
                  <h2 className="about-title about-title--sm" id="about-founder-title">
                    {founder.title}
                  </h2>
                  <div className="about-founder__role">{founder.role}</div>
                </HomeFadeIn>
                {founder.paragraphs.map((p) => (
                  <AboutCopy
                    key={typeof p === 'string' ? p.slice(0, 24) : p.parts[0].t.slice(0, 12)}
                    value={p}
                    className="about-founder__para"
                  />
                ))}
                <HomeFadeIn className="about-founder__traits">
                  {founder.traits.map((t) => (
                    <span key={t} className="about-founder__trait">
                      {t}
                    </span>
                  ))}
                </HomeFadeIn>
              </div>
            </div>
          </section>

          <section className="about-approach" aria-labelledby="about-approach-title">
            <div className="about-section-inner">
              <div className="about-approach__layout">
                <HomeFadeIn className="about-approach__head">
                  <div className="about-label">{approach.label}</div>
                  <h2 className="about-title about-title--approach" id="about-approach-title">
                    {approach.title.map((line) => (
                      <span
                        key={typeof line === 'string' ? line : line.parts.map((p) => p.t).join('')}
                      >
                        <AboutLine line={line} />
                        <br />
                      </span>
                    ))}
                  </h2>
                </HomeFadeIn>
                <ol className="about-approach__steps">
                  {approach.items.map((item) => (
                    <HomeFadeIn key={item.num} as="li" className="about-approach__step">
                      <div className="about-approach__marker" aria-hidden="true">
                        <span className="about-approach__num">{item.num}</span>
                      </div>
                      <div className="about-approach__step-body">
                        <h3 className="about-approach__step-title">
                          {item.title}
                          <span className="about-approach__step-en">{item.en}</span>
                        </h3>
                        <p className="about-approach__step-desc">{item.desc}</p>
                      </div>
                    </HomeFadeIn>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          <section className="about-beliefs" aria-labelledby="about-beliefs-title">
            <div className="about-section-inner">
              <HomeFadeIn>
                <div className="about-label about-label--dim">{beliefs.label}</div>
                <h2 className="about-title about-title--sr-only" id="about-beliefs-title">
                  我們相信
                </h2>
              </HomeFadeIn>
              <div className="about-beliefs__list">
                {beliefs.items.map((item) => (
                  <HomeFadeIn key={item.num} className="about-belief">
                    <div className="about-belief__num">{item.num}</div>
                    <div className="about-belief__content">
                      <h3 className="about-belief__title">{item.title}</h3>
                      <p className="about-belief__desc">
                        {typeof item.desc === 'string' ? (
                          item.desc
                        ) : (
                          <AboutParts parts={item.desc.parts} />
                        )}
                      </p>
                    </div>
                  </HomeFadeIn>
                ))}
              </div>
            </div>
          </section>

          <section className="about-quote" aria-label="引言">
            <HomeFadeIn className="about-quote__inner">
              <blockquote className="about-quote__text">
                {quote.lines.map((line) => (
                  <span key={typeof line === 'string' ? line : line.parts.map((p) => p.t).join('')}>
                    <AboutLine line={line} />
                    <br />
                  </span>
                ))}
              </blockquote>
              <div className="about-quote__en">
                <em>{quote.en}</em>
              </div>
            </HomeFadeIn>
          </section>

          <section className="about-services" aria-label="服務項目">
            <div className="about-section-inner">
              <HomeFadeIn>
                <div className="about-label">S E R V I C E S</div>
                <ul className="about-services__list">
                  {services.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </HomeFadeIn>
            </div>
          </section>

          <section className="about-cta" aria-label="聯絡">
            <HomeFadeIn className="about-cta__inner">
              <div className="about-label about-label--center">{cta.label}</div>
              <h2 className="about-cta__title">
                {cta.title.map((line) => (
                  <span key={typeof line === 'string' ? line : line.parts.map((p) => p.t).join('')}>
                    <AboutLine line={line} />
                    <br />
                  </span>
                ))}
              </h2>
              <div className="about-cta__actions">
                <a href={`mailto:${cta.email}`} className="about-cta__btn">
                  GET IN TOUCH <span aria-hidden>→</span>
                </a>
                <Link to="/work" className="about-cta__btn about-cta__btn--ghost">
                  查看精選案例
                </Link>
              </div>
            </HomeFadeIn>
          </section>

          <footer className="about-footer">
            <div className="about-footer__belief">
              為創作者建構美學語言，
              <br />
              讓每一束光照到它該照的地方。
            </div>
            <div className="about-footer__mark">T E K U E I · 2 0 2 6</div>
          </footer>
        </div>
      )}
    </div>
  )
}
