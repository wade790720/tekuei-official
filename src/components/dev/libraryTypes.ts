/** [prop, type, default, description] */
export type PropRow = [prop: string, type: string, defaultValue: string, description: string]

/** One part of a component (or the whole component when it has no parts). */
export interface ApiPart {
  /** Heading of this part; leave out when the component has a single part. */
  part?: string
  description?: string
  props: PropRow[]
}

export interface LibraryExample {
  id: string
  title: string
  description: string
  /** Key in demos.tsx. Without it the example is code only. */
  demo?: string
  code?: string
}

export interface ComponentEntry {
  id: string
  name: string
  file: string
  summary: string
  hero: { demo?: string; code: string }
  api: ApiPart[]
  examples: LibraryExample[]
  keyboard?: [key: string, action: string][]
  notes: string[]
}

export interface ComponentGroup {
  id: string
  title: string
  intro: string
  items: ComponentEntry[]
}
