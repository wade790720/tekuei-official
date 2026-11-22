import { createContext, use, useId, useState } from 'react'
import '../styles/accordion.css'

const AccordionContext = createContext(null)

/**
 * A stack of sections that open and close under their headings. One open at a time unless `multiple`.
 * Each heading is a real heading with a button inside (aria-expanded), so the outline stays readable.
 * @param {{
 *   multiple?: boolean,            // let several sections stay open
 *   defaultOpen?: string[],        // ids open at first
 *   variant?: 'default' | 'surface',
 *   hideSeparator?: boolean,
 *   headingLevel?: 2 | 3 | 4,
 *   className?: string,
 *   children: import('react').ReactNode, // AccordionItem elements
 * }} props
 */
export function Accordion({
  multiple = false,
  defaultOpen = [],
  variant = 'default',
  hideSeparator = false,
  headingLevel = 3,
  className = '',
  children,
}) {
  const [open, setOpen] = useState(() => new Set(defaultOpen))
  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(multiple ? prev : prev.has(id) ? [id] : [])
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const classes = ['accordion', `accordion--${variant}`, hideSeparator && 'accordion--no-separator', className]
  return (
    <AccordionContext value={{ open, toggle, headingLevel }}>
      <div className={classes.filter(Boolean).join(' ')}>{children}</div>
    </AccordionContext>
  )
}

/**
 * One section: the heading button and the panel under it.
 * @param {{
 *   id: string,
 *   title: import('react').ReactNode,
 *   disabled?: boolean,
 *   indicator?: import('react').ReactNode, // replaces the chevron, which turns upside down when open
 *   children: import('react').ReactNode,
 * }} props
 */
export function AccordionItem({ id, title, disabled = false, indicator = <ChevronIcon />, children }) {
  const { open, toggle, headingLevel } = use(AccordionContext)
  const isOpen = open.has(id)
  const base = useId()
  const Heading = `h${headingLevel}`
  return (
    <div className="accordion__item" data-open={isOpen || undefined}>
      <Heading className="accordion__heading">
        <button
          type="button"
          className="accordion__trigger"
          id={`${base}-t`}
          aria-expanded={isOpen}
          aria-controls={`${base}-p`}
          disabled={disabled}
          onClick={() => toggle(id)}
        >
          <span>{title}</span>
          <span className="accordion__indicator" aria-hidden>
            {indicator}
          </span>
        </button>
      </Heading>
      {/* The grid row animates from 0fr to 1fr, so the panel opens to its own height without measuring it */}
      <div className="accordion__panel" id={`${base}-p`} role="region" aria-labelledby={`${base}-t`} inert={!isOpen}>
        <div className="accordion__panel-inner">
          <div className="accordion__body">{children}</div>
        </div>
      </div>
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3.5 6L8 10.5 12.5 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
