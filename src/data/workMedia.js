// Work thumbnails recorded from the live client sites: a scroll tour with a drawn cursor, keyed by work item id.
// They take the place of the R2 thumbnail. The webp is a representative frame (the first flower), shown before
// the video loads and when reduced motion is on. Matsu Biennial keeps its R2 thumbnail; its recordings are on the case page.
import lustreVideo from '../assets/work/lustre-yellow.mp4'
import lustrePoster from '../assets/work/lustre-yellow.webp'

export const WORK_THUMBS = {
  'lustre-yellow': { url: lustrePoster, video: lustreVideo }, // lustreyellow.com
}
