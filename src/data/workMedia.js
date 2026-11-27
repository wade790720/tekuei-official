// Work thumbnails recorded from the live client sites: a scroll tour with a drawn cursor, keyed by work item id.
// They take the place of the R2 thumbnail. The webp is a representative frame (the first flower), shown before
// the video loads and when reduced motion is on. `cover` is the large picture a project's page opens with; with one
// here, the picture uploaded in the edit panel is not shown.
import lustreVideo from '../assets/work/lustre-yellow.mp4'
import lustrePoster from '../assets/work/lustre-yellow.webp'
import matsuCover from '../assets/work/matsu-biennial-cover.jpg'
import sreCover from '../assets/work/sre-cover.webp'
import sreVideo from '../assets/work/sre.mp4'
import srePoster from '../assets/work/sre.webp'

export const WORK_THUMBS = {
  'lustre-yellow': { url: lustrePoster, video: lustreVideo }, // lustreyellow.com
  'matsu-biennial': { url: matsuCover, cover: matsuCover }, // matsubiennial.tw, the home page banner at dusk
  sre: { url: srePoster, video: sreVideo, cover: sreCover, coverFocus: '88%' }, // sreglobal.com, the hero as the still and the cover; a phone shows its illustration
}

export const projectCover = (item) => WORK_THUMBS[item?.id]?.cover ?? item?.thumbImage?.url
