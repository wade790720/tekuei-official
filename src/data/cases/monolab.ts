import type { CaseStudy } from '../../lib/caseDoc.ts'
const BG = 'linear-gradient(135deg, color-mix(in srgb, var(--surface-2) 92%, transparent) 0%, color-mix(in srgb, var(--surface-1) 82%, transparent) 45%, rgba(16, 15, 17, 0.72) 100%)'
const FULL_BG = 'linear-gradient(135deg, color-mix(in srgb, var(--surface-2) 94%, transparent) 0%, color-mix(in srgb, var(--surface-1) 84%, transparent) 50%, rgba(16, 15, 17, 0.76) 100%)'

const ZH: CaseStudy = {
  slug: 'monolab',
  hero: {
    num: 'CASE 02',
    titleRest: 'MONOLAB',
    subtitle: '情 緒 生 態 系 · 藝 術 場 域',
    bg: BG,
    meta: [
      { label: 'Client', lines: ['MONOLAB', '墨雨互動設計'] },
      { label: 'Scope', lines: ['Generative Art', 'Exhibition Curation', 'Immersive Experience'] },
      { label: 'Year', lines: ['2024'] },
      { label: 'Link', href: 'https://monolab.world/', lines: ['monolab.world'] },
    ],
  },
  media: {
    fullWidthLabel: 'MONOLAB · ART ECOSYSTEM',
    fullWidthBg: FULL_BG,
    inlineLabel: 'GENERATIVE · EXHIBITION VIEW',
  },
  sections: {
    overview: {
      num: '01',
      label: 'Overview',
      title: '背景',
      prose: [
        'MONOLAB 是一個共構情緒生態系的藝術場域，生成式藝術策展、沉浸式體驗與數位藝術創作在這裡交會。（內容待補）',
        '本案例說明如何為跨媒介藝術平台建立數位據點，承載展覽、作品與社群能量。',
      ],
    },
    challenge: {
      num: '02',
      label: 'Challenge',
      title: '問題',
      light: true,
      prose: ['生成式藝術與沉浸式展覽的內容形式多元，官網需要同時承載作品檔案、策展敘事與活動資訊，卻不能失去品牌獨有的情緒張力。（內容待補）'],
      deliverables: [
        { num: '01', name: '品牌調性難以數位化', desc: '現場體驗的沉浸感與情緒層次，需要在網站上找到對應的視覺與互動語言。' },
        { num: '02', name: '作品類型多元', desc: '生成藝術、裝置、個展與科技藝術節等內容需有清晰的歸檔與瀏覽結構。' },
        { num: '03', name: '策展敘事斷裂', desc: '單一展覽與長期品牌故事之間缺乏連貫的敘事線。' },
        { num: '04', name: '國際能見度', desc: '需要能被海外策展人與合作方理解的專業呈現方式。' },
      ],
    },
    approach: {
      num: '03',
      label: 'Approach',
      title: '方法',
      prose: ['以「情緒生態系」為核心隱喻，把網站設計成可持續生長的藝術檔案與策展入口，不做成一次性的活動頁。（內容待補）'],
      timeline: [
        { phase: 'Phase 01', title: '品牌與場域定位', desc: '釐清 MONOLAB 作為藝術場域的核心價值與對外溝通語調。' },
        { phase: 'Phase 02', title: '內容架構設計', desc: '規劃展覽、作品、藝術家與活動的資訊層級與瀏覽路徑。' },
        { phase: 'Phase 03', title: '視覺與前端實作', desc: '打造符合生成藝術氣質的介面與動態細節，支援多媒體內容呈現。' },
        { phase: 'Phase 04', title: '上線與內容維運', desc: '建立可持續更新展覽檔案的流程，支援新展與合作案快速上線。' },
      ],
    },
    deliverables: {
      num: '04',
      label: 'Deliverables',
      title: '交付項目',
      light: true,
      items: [
        { num: '01', name: '品牌視覺系統', desc: '字體、色彩與版面規範，對齊 MONOLAB 藝術場域調性' },
        { num: '02', name: '展覽與作品檔案', desc: '可擴充的展覽列表、作品詳情與策展說明模組' },
        { num: '03', name: '官方網站', desc: 'monolab.world 的設計、開發與部署（內容待補）' },
        { num: '04', name: '多媒體呈現規範', desc: '影像、生成作品與展場紀錄的展示標準與最佳實踐' },
      ],
    },
    result: {
      num: '05',
      label: 'Result',
      title: '成果',
      prose: ['為 MONOLAB 建立一座能持續承載策展與創作能量的數位場域，讓生成藝術與沉浸式體驗在網路上擁有與現場呼應的入口。（內容待補）'],
      quote: { text: '交付的是一座可以反覆進入的藝術生態系，不是靜態的作品目錄。' },
    },
  },
}

const EN: CaseStudy = {
  slug: 'monolab',
  hero: {
    num: 'CASE 02',
    titleRest: 'MONOLAB',
    subtitle: 'EMOTIONAL ECOSYSTEM · ART FIELD',
    bg: BG,
    meta: [
      { label: 'Client', lines: ['MONOLAB', 'MORAN Interactive Design'] },
      { label: 'Scope', lines: ['Generative Art', 'Exhibition Curation', 'Immersive Experience'] },
      { label: 'Year', lines: ['2024'] },
      { label: 'Link', href: 'https://monolab.world/', lines: ['monolab.world'] },
    ],
  },
  media: {
    fullWidthLabel: 'MONOLAB · ART ECOSYSTEM',
    fullWidthBg: FULL_BG,
    inlineLabel: 'GENERATIVE · EXHIBITION VIEW',
  },
  sections: {
    overview: {
      num: '01',
      label: 'Overview',
      title: 'Background',
      prose: [
        'MONOLAB is an art space that builds an emotional ecosystem with its audience. Generative art curation, immersive experience and digital art meet there.',
        'This case covers how we built an online base for a cross-media art platform, one that holds its exhibitions, its works and its community.',
      ],
    },
    challenge: {
      num: '02',
      label: 'Challenge',
      title: 'Problem',
      light: true,
      prose: ['Generative art and immersive exhibitions take many forms. The site had to hold the artwork archive, the curatorial story and event information at once, and keep the emotional tension that is the brand\'s own.'],
      deliverables: [
        { num: '01', name: 'Digitizing the brand tone', desc: 'The immersion and emotional layers of the physical experience needed a matching visual and interactive language on the website.' },
        { num: '02', name: 'Multi-type content', desc: 'Generative art, installations, solo exhibitions and tech-art festivals each needed a clear archive and browsing structure.' },
        { num: '03', name: 'Curatorial narrative continuity', desc: 'Individual exhibitions and the long-term brand story lacked a coherent narrative thread.' },
        { num: '04', name: 'International visibility', desc: 'The site needed to present the work professionally, in a way overseas curators and partners could understand.' },
      ],
    },
    approach: {
      num: '03',
      label: 'Approach',
      title: 'Method',
      prose: ['With "emotional ecosystem" as the core metaphor, we designed the site as an art archive and curatorial entrance that keeps growing, and not as a one-off event page.'],
      timeline: [
        { phase: 'Phase 01', title: 'Brand & field positioning', desc: 'We clarified MONOLAB\'s core value as an art space and the tone it uses in public.' },
        { phase: 'Phase 02', title: 'Content architecture design', desc: 'We planned the information hierarchy and browsing paths for exhibitions, works, artists and events.' },
        { phase: 'Phase 03', title: 'Visual & frontend', desc: 'We built an interface and motion details with the character of generative art, able to show multimedia content.' },
        { phase: 'Phase 04', title: 'Launch & content operations', desc: 'We set up a workflow for updating the exhibition archive, so new shows and collaborations go online quickly.' },
      ],
    },
    deliverables: {
      num: '04',
      label: 'Deliverables',
      title: 'Deliverables',
      light: true,
      items: [
        { num: '01', name: 'Visual identity system', desc: 'Typography, color and layout guidelines that match MONOLAB\'s tone as an art space.' },
        { num: '02', name: 'Exhibition & works archive', desc: 'Expandable exhibition listing, artwork detail pages, and curatorial notes module.' },
        { num: '03', name: 'Official website', desc: 'monolab.world: design, development and deployment.' },
        { num: '04', name: 'Multimedia presentation standards', desc: 'Display standards and best practices for images, generative works, and installation documentation.' },
      ],
    },
    result: {
      num: '05',
      label: 'Result',
      title: 'Result',
      prose: ['We built an online space for MONOLAB that keeps holding its curatorial and creative work, and gives generative art and immersive experience an entrance online that matches the physical space.'],
      quote: { text: 'We delivered an art ecosystem people can enter again and again, and not a static catalogue.' },
    },
  },
}

export const MONOLAB_CASE = { zh: ZH, en: EN }
