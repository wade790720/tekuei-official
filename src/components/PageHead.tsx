import { useLang } from '../i18n'
import { ldJson, pageUrl } from '../lib/seo.ts'
import { SITE_URL } from '../lib/siteUrl.ts'

const DEFAULT_IMAGE = `${SITE_URL}/og.jpg`
const OG_LOCALE = { zh: 'zh_TW', en: 'en_US' }

export interface PageHeadProps {
  title: string
  description: string | undefined
  /** The page's path without its language, as written in src/data: "/journal/abc". */
  path: string
  /** og:type */
  type?: 'website' | 'article' | 'profile'
  /** A full URL; the site's preview image (public/og.jpg) when there is none. */
  image?: string
  /** The page's own JSON-LD. The site's WebSite and Person are in the root layout. */
  ld?: object
  /**
   * The English page still shows the Chinese text: it points search engines at the Chinese URL and names no
   * English version, so the two are not taken for duplicates.
   */
  chineseOnly?: boolean
  /** /checkin and a lab's live page: one URL for both languages. */
  oneUrl?: boolean
}

/** A page's head as search engines and link previews read it. The server draws it; React keeps it in <head>. */
export function PageHead({ title, description, path, type = 'website', image, ld, chineseOnly = false, oneUrl = false }: PageHeadProps) {
  const { lang } = useLang()
  const zh = pageUrl(path, 'zh')
  const en = pageUrl(path, 'en')
  const canonical = oneUrl ? `${SITE_URL}${path}` : lang === 'en' && !chineseOnly ? en : zh
  const hasEnglish = !oneUrl && !chineseOnly
  return (
    <>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      <link rel="canonical" href={canonical} />
      {oneUrl ? null : <link rel="alternate" hrefLang="zh-Hant" href={zh} />}
      {hasEnglish ? <link rel="alternate" hrefLang="en" href={en} /> : null}
      {oneUrl ? null : <link rel="alternate" hrefLang="x-default" href={zh} />}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:locale" content={OG_LOCALE[chineseOnly ? 'zh' : lang]} />
      {hasEnglish ? <meta property="og:locale:alternate" content={OG_LOCALE[lang === 'zh' ? 'en' : 'zh']} /> : null}
      <meta property="og:image" content={image ?? DEFAULT_IMAGE} />
      {/* The sizes of og.jpg; a page's own picture has others. */}
      {image ? null : <meta property="og:image:width" content="1200" />}
      {image ? null : <meta property="og:image:height" content="630" />}
      <meta name="twitter:title" content={title} />
      {description ? <meta name="twitter:description" content={description} /> : null}
      <meta name="twitter:image" content={image ?? DEFAULT_IMAGE} />
      {ld ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(ld) }} /> : null}
    </>
  )
}
