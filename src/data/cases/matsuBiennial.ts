import type { CaseStudy } from '../../lib/caseDoc.ts'
import homeVideo from '../../assets/cases/matsu-biennial/home.mp4'
import homePoster from '../../assets/cases/matsu-biennial/home.webp'
import themeVideo from '../../assets/cases/matsu-biennial/theme.mp4'
import themePoster from '../../assets/cases/matsu-biennial/theme.webp'
import artworksVideo from '../../assets/cases/matsu-biennial/artworks.mp4'
import artworksPoster from '../../assets/cases/matsu-biennial/artworks.webp'

const VIDEOS = [
  { src: homeVideo, poster: homePoster },
  { src: themeVideo, poster: themePoster },
  { src: artworksVideo, poster: artworksPoster },
]

const ZH: CaseStudy = {
  slug: 'matsu-biennial',
  hero: {
    num: 'CASE 01',
    titleEm: 'Matsu',
    titleRest: 'Biennial',
    subtitle: '藝 術 島 嶼 策 展',
    bg: 'linear-gradient(135deg, color-mix(in srgb, var(--surface-2) 92%, transparent) 0%, color-mix(in srgb, var(--surface-1) 82%, transparent) 45%, rgba(16, 15, 17, 0.72) 100%)',
    meta: [
      { label: 'Client', lines: ['馬祖國際藝術島', 'Matsu Biennial'] },
      { label: 'Scope', lines: ['Web Design', 'Exhibition', 'Art Direction'] },
      { label: 'Year', lines: ['2025'] },
      { label: 'Link', href: 'https://matsubiennial.tw/2025', lines: ['matsubiennial.tw/2025'] },
    ],
  },
  media: {
    fullWidthLabel: 'MATSU BIENNIAL · DIGITAL PORTAL',
    fullWidthBg: 'linear-gradient(135deg, color-mix(in srgb, var(--surface-2) 94%, transparent) 0%, color-mix(in srgb, var(--surface-1) 84%, transparent) 50%, rgba(16, 15, 17, 0.76) 100%)',
    inlineLabel: 'EXHIBITION · WEB VIEW',
  },
  videos: VIDEOS.map((v, i) => ({ ...v, caption: ['網站首頁', '策展主題頁', '藝術作品頁'][i] })),
  sections: {
    overview: {
      num: '01',
      label: 'Overview',
      title: '背景',
      prose: [
        '第三屆馬祖國際藝術島。我們建構一座數位入口，連結土地記憶與當代創作。（內容待補）',
        '本案例梳理策展脈絡、島嶼場域與網站體驗之間的關係，說明如何讓觀展路徑在網站上清楚呈現。',
      ],
    },
    challenge: {
      num: '02',
      label: 'Challenge',
      title: '問題',
      light: true,
      prose: ['藝術島嶼活動資訊分散、展點敘事難以在單一入口被理解，需要一套能承載策展層次與實地體驗的網站架構。（內容待補）'],
      deliverables: [
        { num: '01', name: '資訊架構分散', desc: '展覽、藝術家、場域地圖等內容缺乏統一敘事線，觀眾難以建立完整理解。' },
        { num: '02', name: '離島語境轉譯', desc: '網站要傳達馬祖特有的地理、歷史與當代藝術的交會，不能只是活動列表。' },
        { num: '03', name: '視覺層次不足', desc: '需要與策展調性一致的視覺系統，避免淪為一般觀光或活動官網。' },
        { num: '04', name: '行動裝置體驗', desc: '觀展者在島上多依手機查詢，需優化行動版導覽與載入體驗。' },
      ],
    },
    approach: {
      num: '03',
      label: 'Approach',
      title: '方法',
      prose: ['從策展敘事出發，把網站當成展覽的延伸場域，先定調視覺與資訊層級，再搭建可擴充的內容模組。（內容待補）'],
      timeline: [
        { phase: 'Phase 01', title: '策展脈絡梳理', desc: '與主辦方對齊本屆主題、展點分佈與觀眾動線，建立網站資訊架構。' },
        { phase: 'Phase 02', title: '視覺與介面設計', desc: '發展符合藝術島調性的字體、色彩與版面節奏，強化展覽層次感。' },
        { phase: 'Phase 03', title: '網站開發與部署', desc: '實作響應式頁面、內容管理流程與上線部署，確保展期間穩定運作。' },
        { phase: 'Phase 04', title: '上線後優化', desc: '依實際使用數據調整導覽與內容呈現，支援展期中的資訊更新需求。' },
      ],
    },
    deliverables: {
      num: '04',
      label: 'Deliverables',
      title: '交付項目',
      light: true,
      items: [
        { num: '01', name: '官網設計系統', desc: '字體、色彩、元件與版面規範，對齊馬祖國際藝術島品牌調性' },
        { num: '02', name: '展覽資訊架構', desc: '藝術家、作品、場域與活動的內容模組與導覽邏輯' },
        { num: '03', name: '響應式網站', desc: 'matsubiennial.tw 的設計、開發與部署全流程（內容待補）' },
        { num: '04', name: '視覺素材規範', desc: '展覽影像、地圖與社群延伸使用的視覺指引' },
      ],
    },
    result: {
      num: '05',
      label: 'Result',
      title: '成果',
      prose: ['為馬祖國際藝術島建立一座能承載策展深度的數位入口，讓離島藝術在網路上擁有與實地體驗呼應的敘事空間。（內容待補）'],
      quote: { text: '交付的是一個網站，也是一條讓人在網路上抵達藝術島的路徑。' },
    },
  },
}

const EN: CaseStudy = {
  slug: 'matsu-biennial',
  hero: {
    num: 'CASE 01',
    titleEm: 'Matsu',
    titleRest: 'Biennial',
    subtitle: 'ISLAND ART CURATION',
    bg: ZH.hero.bg,
    meta: [
      { label: 'Client', lines: ['Matsu Biennial', 'National Matsu Arts Festival'] },
      { label: 'Scope', lines: ['Web Design', 'Exhibition', 'Art Direction'] },
      { label: 'Year', lines: ['2025'] },
      { label: 'Link', href: 'https://matsubiennial.tw/2025', lines: ['matsubiennial.tw/2025'] },
    ],
  },
  media: {
    fullWidthLabel: 'MATSU BIENNIAL · DIGITAL PORTAL',
    fullWidthBg: ZH.media.fullWidthBg,
    inlineLabel: 'EXHIBITION · WEB VIEW',
  },
  videos: VIDEOS.map((v, i) => ({ ...v, caption: ['Home page', 'Curatorial theme page', 'Art works page'][i] })),
  sections: {
    overview: {
      num: '01',
      label: 'Overview',
      title: 'Background',
      prose: [
        'The third Matsu Biennial. We built a digital entrance that connects the memory of the islands with contemporary art.',
        'This case covers how the curatorial story, the island sites and the website relate, and how the site makes the visitor route clear.',
      ],
    },
    challenge: {
      num: '02',
      label: 'Challenge',
      title: 'Problem',
      light: true,
      prose: ['Event information was scattered, and no single entry point explained the story of the exhibition sites. The website needed a structure that could hold both the levels of the curation and the visit on the islands.'],
      deliverables: [
        { num: '01', name: 'Fragmented information architecture', desc: 'Exhibitions, artists and the venue map had no shared story line, so visitors could not form a complete picture.' },
        { num: '02', name: 'Translating the island context', desc: 'The site had to show where Matsu\'s geography, history and contemporary art meet, and be more than a list of events.' },
        { num: '03', name: 'Insufficient visual hierarchy', desc: 'The site needed a visual system that matched the curatorial tone, so it would not look like a tourism or events site.' },
        { num: '04', name: 'Mobile experience on the island', desc: 'Visitors on the islands mostly looked things up on their phones, so mobile navigation and load time needed work.' },
      ],
    },
    approach: {
      num: '03',
      label: 'Approach',
      title: 'Method',
      prose: ['We started from the curatorial story and treated the website as an extension of the exhibition. We set the visual and information hierarchy first, then built content modules that can grow.'],
      timeline: [
        { phase: 'Phase 01', title: 'Curatorial alignment', desc: 'We agreed with the organizers on the themes, the venue locations and the visitor route, and set the site\'s information architecture.' },
        { phase: 'Phase 02', title: 'Visual & interface design', desc: 'We developed type, color and layout rhythm that suit the art island, to bring out the layers of the exhibition.' },
        { phase: 'Phase 03', title: 'Development & deployment', desc: 'We built responsive pages and the content workflow, and deployed the site so it ran steadily through the exhibition.' },
        { phase: 'Phase 04', title: 'Post-launch optimization', desc: 'We adjusted navigation and content from real usage data, and supported information updates during the exhibition.' },
      ],
    },
    deliverables: {
      num: '04',
      label: 'Deliverables',
      title: 'Deliverables',
      light: true,
      items: [
        { num: '01', name: 'Website design system', desc: 'Typography, color, components, and layout guidelines aligned to the Matsu Biennial brand.' },
        { num: '02', name: 'Exhibition information architecture', desc: 'Content modules and navigation logic for artists, works, venues, and events.' },
        { num: '03', name: 'Responsive website', desc: 'matsubiennial.tw: design, development and deployment.' },
        { num: '04', name: 'Visual asset guidelines', desc: 'Visual standards for exhibition imagery, maps, and social extensions.' },
      ],
    },
    result: {
      num: '05',
      label: 'Result',
      title: 'Result',
      prose: ['We built a digital entrance for Matsu Biennial that can hold the depth of the curation, and gives island art a place online that matches the visit in person.'],
      quote: { text: 'The delivery was a website, and with it a way to reach the art island online.' },
    },
  },
}

export const MATSU_BIENNIAL_CASE = { zh: ZH, en: EN }
