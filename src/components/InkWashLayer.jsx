/**
 * Journal 氛圍層 · 品牌霧金環境光（純 CSS，無 blur 光圈）
 * @param {{ variant?: 'default' | 'ma' | 'ink' | 'orient' | 'blade' }} props
 */
export function InkWashLayer({ variant = 'default' }) {
  return <div className={`journal-atmosphere journal-atmosphere--${variant}`} aria-hidden />
}
