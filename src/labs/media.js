// Thumbnails of the labs in index.js, for the Work list and the More Labs row of each lab page.
// Stills are frames captured from each live piece at 1440x900, scaled to 960x600 to match the Work thumbnail (16:10).
import portraitThumb from './living-portrait/thumb.webp'
// A 12s loop recorded from the live piece with a scripted mouse (hover boxes, double-click glitch); the webp is its poster.
import portraitVideo from './living-portrait/preview.mp4'
import fallThumb from './falling-figure/thumb.webp'
import shatterThumb from './shatter-footer/thumb.webp'
import { labLinks } from './index.js'

export const LAB_THUMBS = {
  'living-portrait': { url: portraitThumb, video: portraitVideo },
  'falling-figure': { url: fallThumb },
  'shatter-footer': { url: shatterThumb },
}

/** Work list cards for the labs, numbered after the client cases. */
export function labWorkItems(lang, startNum) {
  return labLinks(lang).map((x, i) => ({
    ...x,
    num: String(startNum + i).padStart(2, '0'),
    thumbImage: LAB_THUMBS[x.id],
  }))
}
