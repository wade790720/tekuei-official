import 'react'

declare module 'react' {
  // Inline styles set custom properties such as `--i` that CSS rules read.
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined
  }
}
