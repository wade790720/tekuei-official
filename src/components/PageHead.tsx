import { useLang } from '../i18n'
import { headLinks, ldJson, siteLd } from '../lib/seo.ts'
import { SITE_URL } from '../lib/siteUrl.ts'

const DEFAULT_IMAGE = `${SITE_URL}/og.jpg`

export interface PageHeadProps {
  title: string
  description: string | undefined
  /** The page's path without its language, as written in src/data: "/journal/abc". */
  path: string
  /** og:type */
  type?: 'website' | 'article' | 'profile'
  /** A full URL; the site's preview image (public/og.jpg) when there is none. */
  image?: string
  /** The page's own JSON-LD. The site's WebSite and Person are added here, in the language the page shows. */
  ld?: object
  /**
   * The page has an English version of its own (postInEnglish, projectInEnglish, aboutInEnglish: the sitemap's
   * rule). Without one, both of its URLs point search engines at the Chinese page.
   */
  english?: boolean
  /** /checkin and a lab's live page: one URL for both languages. */
  oneUrl?: boolean
  /** Kept out of search results: a lab's live page, whose own page is /labs/<id>. */
  noindex?: boolean
}

/** A page's head as search engines and link previews read it. The server draws it; React keeps it in <head>. */
export function PageHead({ title, description, path, type = 'website', image, ld, english = true, oneUrl = false, noindex = false }: PageHeadProps) {
  const { lang } = useLang()
  const shown = oneUrl || english ? lang : 'zh'
  const links = oneUrl ? { canonical: `${SITE_URL}${path}`, alternates: [], locale: headLinks(path, lang, true).locale } : headLinks(path, lang, english)
  return (
    <>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      {noindex ? <meta name="robots" content="noindex" /> : null}
      <link rel="canonical" href={links.canonical} />
      {links.alternates.map(([hrefLang, href]) => (
        <link key={hrefLang} rel="alternate" hrefLang={hrefLang} href={href} />
      ))}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={links.canonical} />
      <meta property="og:title" content={title} />
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:locale" content={links.locale} />
      {'localeAlternate' in links && links.localeAlternate ? <meta property="og:locale:alternate" content={links.localeAlternate} /> : null}
      <meta property="og:image" content={image ?? DEFAULT_IMAGE} />
      {image ? null : <meta property="og:image:width" content="1200" />}
      {image ? null : <meta property="og:image:height" content="630" />}
      <meta name="twitter:title" content={title} />
      {description ? <meta name="twitter:description" content={description} /> : null}
      <meta name="twitter:image" content={image ?? DEFAULT_IMAGE} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(siteLd(shown)) }} />
      {ld ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(ld) }} /> : null}
    </>
  )
}
