// Pictures and recordings of the live client sites that are kept in code, keyed by work item id.
// WORK_THUMBS takes the place of a project's R2 picture: `url` on its list card, `cover` as the large picture its
// page opens with. With a cover here, the picture uploaded in the edit panel is not shown.
import matsuCover from '../assets/work/matsu-biennial-cover.jpg'
import sreCover from '../assets/work/sre-cover.webp'
import sreVideo from '../assets/work/sre.mp4'
import srePoster from '../assets/work/sre.webp'

export const WORK_THUMBS = {
  'matsu-biennial': { url: matsuCover, cover: matsuCover }, // matsubiennial.tw, the home page banner at dusk
  sre: { url: srePoster, cover: sreCover, coverFocus: '88%' }, // sreglobal.com's hero; a phone shows its illustration
}

export const projectCover = (item) => WORK_THUMBS[item?.id]?.cover ?? item?.thumbImage?.url

// A scroll tour with a drawn cursor, shown at the end of the project's page. The page's text is in R2, and the
// editor cannot upload a video, so the recording is added here.
const PROJECT_VIDEOS = {
  sre: { src: sreVideo, poster: srePoster, caption: { zh: '網站導覽', en: 'Site tour' } },
}

/** The project's text followed by its recording, when it has one. */
export function withProjectVideo(doc, id, lang) {
  const video = PROJECT_VIDEOS[id]
  if (!video) return doc
  return { ...doc, content: [...(doc.content ?? []), { type: 'videoCard', attrs: { src: video.src, poster: video.poster, caption: video.caption[lang], loop: true } }] }
}
