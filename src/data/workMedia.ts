// Pictures and recordings of the live client sites that are kept in code, keyed by work item id.
import matsuCover from '../assets/work/matsu-biennial-cover.jpg'
import sreVideo from '../assets/work/sre.mp4'
import srePoster from '../assets/work/sre.webp'
import type { Doc, Lang, Localized, WorkItem } from '../lib/siteData.ts'

// A cover kept in code stands in for one stored picture only: the one named in `replaces` (or none at all).
// Once another picture is uploaded in the edit panel, the uploaded one is shown.
const CODE_COVERS: Record<string, { url: string; replaces: string }> = {
  // matsubiennial.tw, the home page banner at dusk, in place of the 850px picture stored before
  'matsu-biennial': { url: matsuCover, replaces: '41fefb8d-b7f5-4119-b5e1-a7fdb65d8868' },
}

/** The picture on a project's list card and at the top of its page. */
export function projectCover(item: WorkItem | null | undefined): string | undefined {
  const stored = item?.thumbImage?.url
  const code = item ? CODE_COVERS[item.id] : undefined
  return code && (!stored || stored.includes(code.replaces)) ? code.url : stored
}

// A scroll tour with a drawn cursor, shown at the end of the project's page. The page's text is in R2, and the
// editor cannot upload a video, so the recording is added here.
const PROJECT_VIDEOS: Record<string, { src: string; poster: string; caption: Localized<string> }> = {
  sre: { src: sreVideo, poster: srePoster, caption: { zh: '網站導覽', en: 'Site tour' } },
}

/** The project's text followed by its recording, when it has one. */
export function withProjectVideo(doc: Doc, id: string, lang: Lang): Doc {
  const video = PROJECT_VIDEOS[id]
  if (!video) return doc
  return { ...doc, content: [...(doc.content ?? []), { type: 'videoCard', attrs: { src: video.src, poster: video.poster, caption: video.caption[lang], loop: true } }] }
}
