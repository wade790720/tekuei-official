import portraitThumb from './living-portrait/thumb.webp'
import portraitVideo from './living-portrait/preview.mp4'
import fallThumb from './falling-figure/thumb.webp'
import shatterThumb from './shatter-footer/thumb.webp'
import { labLinks } from './index.ts'
import type { LabId } from './index.ts'
import type { Lang, WorkItem } from '../lib/siteData.ts'

export const LAB_THUMBS: Record<LabId, { url: string; video?: string }> = {
  'living-portrait': { url: portraitThumb, video: portraitVideo },
  'falling-figure': { url: fallThumb },
  'shatter-footer': { url: shatterThumb },
}

/** Work list cards for the labs, numbered after the client cases. */
export function labWorkItems(lang: Lang, startNum: number): WorkItem[] {
  return labLinks(lang).map((x, i) => ({
    ...x,
    num: String(startNum + i).padStart(2, '0'),
    thumbImage: LAB_THUMBS[x.id],
  }))
}
