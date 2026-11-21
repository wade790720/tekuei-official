// Thumbnails of the labs in labs.js, for the Work list.
// Stills are frames captured from each live piece at 1440x900, scaled to 960x600 to match the Work thumbnail (16:10).
import portraitThumb from '../assets/labs/living-portrait.webp'
// A 12s loop recorded from the live piece with a scripted mouse (hover boxes, double-click glitch); the webp is its poster.
import portraitVideo from '../assets/labs/living-portrait.mp4'
import fallThumb from '../assets/labs/falling-figure.webp'
import { labLinks } from './labs.js'

const THUMBS = {
  'living-portrait': { url: portraitThumb, video: portraitVideo },
  'falling-figure': { url: fallThumb },
}

/** Work list cards for the labs, numbered after the client cases. */
export function labWorkItems(lang, startNum) {
  return labLinks(lang).map((x, i) => ({
    ...x,
    num: String(startNum + i).padStart(2, '0'),
    thumbImage: THUMBS[x.id],
  }))
}
