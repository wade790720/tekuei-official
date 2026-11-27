import { Children } from 'react'
import { Link } from 'react-router-dom'
import '../styles/breadcrumbs.css'

/**
 * Where the page sits in the site: links to each level above, then the current page.
 * A chevron separates the items. The current item shrinks with an ellipsis when the row is too narrow.
 * @param {{
 *   label: string,                          // accessible name of the nav, e.g. 「導覽路徑」
 *   separator?: import('react').ReactNode,  // replaces the chevron
 *   className?: string,
 *   children: import('react').ReactNode,    // BreadcrumbsItem elements
 * }} props
 */
export function Breadcrumbs({ label, separator = <ChevronIcon />, className = '', children }) {
  const items = Children.toArray(children)
  return (
    <nav className={`breadcrumbs ${className}`.trim()} aria-label={label}>
      <ol className="breadcrumbs__list">
        {items.map((item, i) => (
          <li key={item.key ?? i} className="breadcrumbs__item">
            {item}
            {i < items.length - 1 ? (
              <span className="breadcrumbs__separator" aria-hidden>
                {separator}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/**
 * One level. With `href` it is a link; without it is the current page (aria-current="page").
 * `as` renders another link component instead, e.g. one that steps back in history.
 * @param {{
 *   href?: string,
 *   as?: import('react').ElementType,
 *   children: import('react').ReactNode,
 * } & Record<string, unknown>} props  other props go to the link
 */
export function BreadcrumbsItem({ href, as: Element, children, ...rest }) {
  if (Element) {
    return (
      <Element className="breadcrumbs__link" {...rest}>
        {children}
      </Element>
    )
  }
  if (href == null) {
    return (
      <span className="breadcrumbs__link" aria-current="page" data-current="true" {...rest}>
        {children}
      </span>
    )
  }
  return (
    <Link to={href} className="breadcrumbs__link" {...rest}>
      {children}
    </Link>
  )
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M6 3.5L10.5 8 6 12.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
