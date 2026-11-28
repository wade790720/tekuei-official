import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { Button } from '../Button.tsx'
import { CheckIcon } from '../CodeBlock.tsx'
import { SOCIAL_ICONS } from '../socialIcons.tsx'
import { TooltipGroup } from '../Tooltip.tsx'
import { JOURNAL_POST_LABELS } from '../../data/journal.ts'
import { useLang } from '../../i18n'
import { writeClipboard } from '../../lib/clipboard.ts'
import { SITE_URL } from '../../lib/siteUrl.ts'

const SHOWN_MS = 1600

const SERVICES = [
  { name: 'LINE', icon: <LineIcon />, href: (url: string) => `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}` },
  {
    name: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {SOCIAL_ICONS.Facebook}
      </svg>
    ),
    href: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
]

/** Share this page: copy its link, or open LINE's or Facebook's share window with it. */
export function ShareLinks() {
  const { lang } = useLang()
  const t = JOURNAL_POST_LABELS[lang]
  const [result, setResult] = useState<'copied' | 'failed' | ''>('')
  const url = `${SITE_URL}${useLocation().pathname}`

  useEffect(() => {
    if (!result) return undefined
    const id = setTimeout(() => setResult(''), SHOWN_MS)
    return () => clearTimeout(id)
  }, [result])

  const copy = async () => setResult((await writeClipboard(url)) ? 'copied' : 'failed')
  const copied = result === 'copied'

  return (
    <TooltipGroup className="journal-post__share" role="group" aria-label={t.share}>
      <Button variant="icon" onClick={copy} aria-label={t.copy} data-tip={result === 'failed' ? t.copyFailed : copied ? t.copied : t.copy}>
        <span className="icon-swap">
          <span data-off={copied || undefined}>
            <LinkIcon />
          </span>
          <span data-off={!copied || undefined}>
            <CheckIcon />
          </span>
        </span>
      </Button>
      <span className="card__sr" role="status">
        {result === 'failed' ? t.copyFailed : copied ? t.copied : ''}
      </span>
      {SERVICES.map((service) => (
        <Button
          key={service.name}
          as="a"
          variant="icon"
          href={service.href(url)}
          target="_blank"
          rel="noreferrer"
          aria-label={`${t.shareTo} ${service.name}`}
          data-tip={service.name}
        >
          {service.icon}
        </Button>
      ))}
    </TooltipGroup>
  )
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6.7 9.3a3 3 0 0 0 4.2 0l2.2-2.2a3 3 0 0 0-4.2-4.2l-.9.9" />
      <path d="M9.3 6.7a3 3 0 0 0-4.2 0L2.9 8.9a3 3 0 0 0 4.2 4.2l.9-.9" />
    </svg>
  )
}

// LINE's mark is a solid shape, so it is filled where the other icons are drawn in line. Path from Simple Icons (CC0).
function LineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  )
}
