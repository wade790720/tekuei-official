const ZH = {
  slug: 'matsu-biennial',
  documentTitle: 'TEKUEI · Matsu Biennial',
  hero: {
    num: 'C A S E   0 1',
    titleEm: 'Matsu',
    titleRest: 'Biennial',
    subtitle: '藝 術 島 嶼 策 展',
    bg: 'linear-gradient(135deg, rgba(232, 235, 228, 0.92) 0%, rgba(215, 220, 210, 0.82) 45%, rgba(200, 205, 195, 0.72) 100%)',
    meta: [
      { label: 'Client', lines: ['馬祖國際藝術島', 'Matsu Biennial'] },
      { label: 'Scope', lines: ['Web Design', 'Exhibition', 'Art Direction'] },
      { label: 'Year', lines: ['2025'] },
      { label: 'Link', href: 'https://matsubiennial.tw/', lines: ['matsubiennial.tw'] },
    ],
  },
  media: {
    fullWidthLabel: 'M A T S U   B I E N N I A L   ·   D I G I T A L   P O R T A L',
    fullWidthBg: 'linear-gradient(135deg, rgba(232, 235, 228, 0.94) 0%, rgba(215, 220, 210, 0.84) 50%, rgba(200, 205, 195, 0.76) 100%)',
    inlineLabel: 'E X H I B I T I O N   ·   W E B   V I E W',
  },
  sections: {
    overview: {
      num: '01',
      label: 'Overview',
      title: '背景',
      prose: [
        '第三屆馬祖國際藝術島 - 在離島與藝術之間，建構一座連結土地記憶與當代創作的數位入口。（內容待補）',
        '本案例將梳理策展脈絡、島嶼場域與網站體驗之間的關係，說明如何讓觀展路徑在數位空間中被清晰感知。',
      ],
      quote: { text: '「離島不是邊陲，而是另一種觀看世界的方式。」', attr: '— 占位引言' },
    },
    challenge: {
      num: '02',
      label: 'Challenge',
      title: '問題',
      light: true,
      prose: ['藝術島嶼活動資訊分散、展點敘事難以在單一入口被理解，需要一套能承載策展層次與實地體驗的網站架構。（內容待補）'],
      deliverables: [
        { num: '01', name: '資訊架構分散', desc: '展覽、藝術家、場域地圖等內容缺乏統一敘事線，觀眾難以建立完整理解。' },
        { num: '02', name: '離島語境轉譯', desc: '如何在網站上傳達馬祖特有的地理、歷史與當代藝術的交會，而非僅是活動列表。' },
        { num: '03', name: '視覺層次不足', desc: '需要與策展調性一致的視覺系統，避免淪為一般觀光或活動官網。' },
        { num: '04', name: '行動裝置體驗', desc: '觀展者在島上多依手機查詢，需優化行動端導覽與載入體驗。' },
      ],
    },
    approach: {
      num: '03',
      label: 'Approach',
      title: '方法',
      prose: ['從策展敘事出發，將網站視為展覽的延伸場域——先定調視覺與資訊層級，再搭建可擴充的內容模組。（內容待補）'],
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
        { num: '01', name: '官網設計系統', desc: '字體、色彩、元件與版面規範，對齊馬祖國際藝術島品牌調性。' },
        { num: '02', name: '展覽資訊架構', desc: '藝術家、作品、場域與活動的內容模組與導覽邏輯。' },
        { num: '03', name: '響應式網站', desc: 'matsubiennial.tw — 設計、開發與部署全流程。（內容待補）' },
        { num: '04', name: '視覺素材規範', desc: '展覽影像、地圖與社群延伸使用的視覺指引。' },
      ],
    },
    result: {
      num: '05',
      label: 'Result',
      title: '成果',
      prose: ['為馬祖國際藝術島建立一座能承載策展深度的數位入口，讓離島藝術在網路上擁有與實地體驗呼應的敘事空間。（內容待補）'],
      quote: { text: '交付的不只是網站，而是讓藝術島在數位世界中可被抵達的路徑。' },
    },
  },
}

const EN = {
  slug: 'matsu-biennial',
  documentTitle: 'TEKUEI · Matsu Biennial',
  hero: {
    num: 'C A S E   0 1',
    titleEm: 'Matsu',
    titleRest: 'Biennial',
    subtitle: 'I S L A N D   A R T   C U R A T I O N',
    bg: ZH.hero.bg,
    meta: [
      { label: 'Client', lines: ['Matsu Biennial', 'National Matsu Arts Festival'] },
      { label: 'Scope', lines: ['Web Design', 'Exhibition', 'Art Direction'] },
      { label: 'Year', lines: ['2025'] },
      { label: 'Link', href: 'https://matsubiennial.tw/', lines: ['matsubiennial.tw'] },
    ],
  },
  media: {
    fullWidthLabel: 'M A T S U   B I E N N I A L   ·   D I G I T A L   P O R T A L',
    fullWidthBg: ZH.media.fullWidthBg,
    inlineLabel: 'E X H I B I T I O N   ·   W E B   V I E W',
  },
  sections: {
    overview: {
      num: '01',
      label: 'Overview',
      title: 'Background',
      prose: [
        'The 3rd Matsu International Arts Festival — building a digital gateway between island memory and contemporary creation.',
        'This case traces the relationship between curatorial narrative, island location, and digital experience, and how the visitor journey can be made clearly perceptible in the online space.',
      ],
      quote: { text: '"The remote island is not the periphery — it is another way of seeing the world."', attr: '— Placeholder Quote' },
    },
    challenge: {
      num: '02',
      label: 'Challenge',
      title: 'Problem',
      light: true,
      prose: ['Event information was scattered across the island\'s many venues; the exhibition narrative could not be understood from a single entry point. A website architecture was needed to carry both curatorial depth and on-site experience.'],
      deliverables: [
        { num: '01', name: 'Fragmented information architecture', desc: 'Exhibition, artist, and venue map content lacked a unified narrative; visitors struggled to form a complete picture.' },
        { num: '02', name: 'Translating the island context', desc: 'How to convey the intersection of Matsu\'s unique geography, history, and contemporary art — not merely an event listing.' },
        { num: '03', name: 'Insufficient visual hierarchy', desc: 'A visual system aligned with the curatorial tone was needed to avoid feeling like a generic tourism or events site.' },
        { num: '04', name: 'Mobile experience on the island', desc: 'Visitors on-site relied primarily on phones; mobile navigation and load performance needed to be optimized.' },
      ],
    },
    approach: {
      num: '03',
      label: 'Approach',
      title: 'Method',
      prose: ['Beginning from the curatorial narrative, we treated the website as an extension of the exhibition itself — establishing visual and information hierarchy before building the expandable content modules.'],
      timeline: [
        { phase: 'Phase 01', title: 'Curatorial alignment', desc: 'Aligning with organizers on the edition\'s themes, venue distribution, and visitor flow to establish the site\'s information architecture.' },
        { phase: 'Phase 02', title: 'Visual & interface design', desc: 'Developing typography, color, and compositional rhythm suited to the art island tone, amplifying the exhibition\'s layered quality.' },
        { phase: 'Phase 03', title: 'Development & deployment', desc: 'Building responsive pages, content management workflows, and deploying for stable operation throughout the exhibition period.' },
        { phase: 'Phase 04', title: 'Post-launch optimization', desc: 'Adjusting navigation and content presentation based on real usage data; supporting information updates during the exhibition.' },
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
        { num: '03', name: 'Responsive website', desc: 'matsubiennial.tw — full design, development, and deployment.' },
        { num: '04', name: 'Visual asset guidelines', desc: 'Visual standards for exhibition imagery, maps, and social extensions.' },
      ],
    },
    result: {
      num: '05',
      label: 'Result',
      title: 'Result',
      prose: ['A digital gateway was built for the Matsu International Arts Festival — one that can carry the depth of the curation, giving island art an online space that echoes the experience of being there.'],
      quote: { text: 'What was delivered was not just a website, but a path by which the art island can be reached in the digital world.' },
    },
  },
}

export const MATSU_BIENNIAL_CASE = { zh: ZH, en: EN }
