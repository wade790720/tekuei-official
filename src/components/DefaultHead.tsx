import { HOME_META } from '../data/homepage.ts'
import { SITE_LOGO } from '../data/nav.ts'
import { useLang } from '../i18n'

/**
 * The site's title and description, for a page state that has no text of its own (loading, not found, an error).
 * The layout carries none, so every state renders exactly one of each: React adds a second element instead of replacing.
 */
export function DefaultHead({ title, description }: { title?: string; description?: string }) {
  const { lang } = useLang()
  return (
    <>
      <title>{title ?? SITE_LOGO}</title>
      <meta name="description" content={description ?? HOME_META[lang].description} />
    </>
  )
}
