import type { CSSProperties } from 'react'
import '../styles/skeleton.css'

export interface SkeletonProps {
  animation?: 'shimmer' | 'pulse' | 'none'
  className?: string
  style?: CSSProperties
}

/**
 * A grey placeholder block shown while content loads. Size it with className or style.
 * Hidden from screen readers: announce the loading state on the container instead.
 */
export function Skeleton({ animation = 'shimmer', className = '', style }: SkeletonProps) {
  return <span className={`skeleton skeleton--${animation} ${className}`.trim()} style={style} aria-hidden />
}
