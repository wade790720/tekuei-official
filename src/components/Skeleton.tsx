import '../styles/skeleton.css'

/**
 * A grey placeholder block shown while content loads. Size it with className or style.
 * Hidden from screen readers: announce the loading state on the container instead.
 * @param {{
 *   animation?: 'shimmer' | 'pulse' | 'none',
 *   className?: string,
 *   style?: import('react').CSSProperties,
 * }} props
 */
export function Skeleton({ animation = 'shimmer', className = '', style }) {
  return <span className={`skeleton skeleton--${animation} ${className}`.trim()} style={style} aria-hidden />
}
