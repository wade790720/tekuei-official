const BG = 'linear-gradient(135deg, rgba(245, 238, 222, 0.92) 0%, rgba(228, 215, 192, 0.82) 45%, rgba(210, 198, 175, 0.72) 100%)'
const FULL_BG = 'linear-gradient(135deg, rgba(245, 238, 222, 0.94) 0%, rgba(228, 215, 192, 0.84) 50%, rgba(210, 198, 175, 0.76) 100%)'

const ZH = {
  slug: 'lustre-yellow',
  documentTitle: 'TEKUEI · Lustre Yellow',
  hero: {
    num: 'C A S E   0 3',
    titleEm: 'Lustre',
    titleRest: 'Yellow',
    subtitle: '花 蜜 水 晶 花 工 藝',
    bg: BG,
    meta: [
      { label: 'Client', lines: ['許婷婷', 'MADOKA 花藝設計學院 副教授'] },
      { label: 'Scope', lines: ['品牌系統建構', '全案代操'] },
      { label: 'Year', lines: ['2025 – 2026'] },
      { label: 'Link', href: 'https://lustreyellow.com', lines: ['lustreyellow.com'] },
    ],
  },
  media: {
    fullWidthLabel: 'L U S T R E   Y E L L O W   ·   B R A N D   S Y S T E M',
    fullWidthBg: FULL_BG,
    inlineLabel: 'S A L E S   P A G E   ·   D E S K T O P   V I E W',
  },
  sections: {
    overview: {
      num: '01',
      label: 'Overview',
      title: '背景',
      prose: [
        '許婷婷是日本 MADOKA 花藝設計學院的副教授，專精水晶花（Crystal Art Flowers）——一門將透明樹脂塑造成永恆花朵的極致工藝。她的作品精緻、有靈魂，卻長期面臨「看到作品的人都驚嘆，但找不到她」的困境。',
        '她試過自己拍影片、自己寫文案，成品出來總覺得「這不像我」。她不想拍那種商業感很重的推銷內容，但也不知道如何用符合自己氣質的方式被世界看見。',
      ],
      quote: { text: '「我只想好好做花，但光是生存就佔據了所有時間。」', attr: '— 許婷婷' },
    },
    challenge: {
      num: '02',
      label: 'Challenge',
      title: '問題',
      light: true,
      prose: ['花藝市場充斥著同質化的視覺語言——粉色系、甜美風、手作感。水晶花作為一門精緻的藝術工藝，需要的不是「可愛」，而是「被尊重」。許婷婷的品牌需要一套從零開始的系統，讓她的手藝配得上一個有力量的舞台。'],
      deliverables: [
        { num: '01', name: '品牌定位模糊', desc: '「水晶花老師」的標籤無法傳達作品的藝術層次，與一般手作課程無法區隔。' },
        { num: '02', name: '銷售頁缺失', desc: '課程招生依賴口碑和 LINE 群組，沒有能獨立轉換的銷售頁面。' },
        { num: '03', name: '數位基礎設施為零', desc: '沒有官網、沒有追蹤系統、沒有廣告投流經驗——數據完全空白。' },
        { num: '04', name: '品牌視覺不統一', desc: 'Instagram 發文缺乏策略，九宮格視覺混亂，無法建立記憶點。' },
      ],
    },
    approach: {
      num: '03',
      label: 'Approach',
      title: '方法',
      prose: ['不是幫她「做行銷」，而是幫她建構一套完整的品牌基礎設施——從故事挖掘開始，讓品牌的靈魂先站穩，再把技術架構和銷售系統搭上去。'],
      timeline: [
        { phase: 'Phase 01', title: '品牌故事挖掘', desc: '四層訪談法——場景、衝突、轉折、落差。不問「你想怎麼介紹自己」，而是問「你為什麼做這件事」。從兩小時的深度對話中，提煉出品牌核心故事和情感錨點。' },
        { phase: 'Phase 02', title: '銷售頁設計與文案', desc: '將品牌故事轉化為高轉換率的銷售頁面——Hero 區建立情感連結、痛點區精準打中需求、社會證明建立信任、CTA 引導行動。文案不是在賣課，是在賣身分轉換。' },
        { phase: 'Phase 03', title: '品牌官網建置', desc: '從設計、開發到 Cloudflare 部署，打造一個配得上作品精緻度的數位空間。設定 GA4 追蹤、Meta Pixel + CAPI，讓每一筆流量都有數據可循。' },
        { phase: 'Phase 04', title: '廣告投流與內容策略', desc: 'Meta 廣告投流設定、節慶行銷月曆規劃、Instagram 內容策略。建構從「看到」到「報名」的完整漏斗，讓每一分廣告預算都花在對的人身上。' },
      ],
    },
    deliverables: {
      num: '04',
      label: 'Deliverables',
      title: '交付項目',
      light: true,
      items: [
        { num: '01', name: '品牌故事文案系統', desc: '品牌核心故事、課程銷售文案、社群文案模板、品牌語調指南。' },
        { num: '02', name: '銷售頁面', desc: '高轉換率課程銷售頁，含報名表單整合與追蹤埋設。' },
        { num: '03', name: '品牌形象官網', desc: 'lustreyellow.com — 設計、開發、部署、SSL、DNS 全流程交付。' },
        { num: '04', name: '數據追蹤系統', desc: 'GA4 + Meta Pixel + Conversions API 建置與事件設定。' },
        { num: '05', name: '廣告投流設定', desc: 'Meta 廣告帳號建置、受眾設定、素材製作與投流優化。' },
        { num: '06', name: '節慶行銷月曆', desc: '12 個月節慶檔期規劃，含文案方向與推廣策略。' },
      ],
    },
    result: {
      num: '05',
      label: 'Result',
      title: '成果',
      prose: ['從「看到作品的人都驚嘆，但找不到她」，到擁有一套完整的品牌基礎設施——官網、銷售頁、追蹤系統、廣告投流、內容策略。許婷婷可以回去好好創作，品牌的系統會替她持續運轉。'],
      quote: { text: '交付的不是「幾支影片」或「一份企劃書」——\n而是一整套讓品牌被看見的基礎設施。', multiline: true },
    },
  },
}

const EN = {
  slug: 'lustre-yellow',
  documentTitle: 'TEKUEI · Lustre Yellow',
  hero: {
    num: 'C A S E   0 3',
    titleEm: 'Lustre',
    titleRest: 'Yellow',
    subtitle: 'B R A N D   S Y S T E M   A R C H I T E C T U R E',
    bg: BG,
    meta: [
      { label: 'Client', lines: ['Ting-Ting Hsu', 'MADOKA Floral Design Academy · Associate Professor'] },
      { label: 'Scope', lines: ['Brand System', 'Full-Service Execution'] },
      { label: 'Year', lines: ['2025 – 2026'] },
      { label: 'Link', href: 'https://lustreyellow.com', lines: ['lustreyellow.com'] },
    ],
  },
  media: {
    fullWidthLabel: 'L U S T R E   Y E L L O W   ·   B R A N D   S Y S T E M',
    fullWidthBg: FULL_BG,
    inlineLabel: 'S A L E S   P A G E   ·   D E S K T O P   V I E W',
  },
  sections: {
    overview: {
      num: '01',
      label: 'Overview',
      title: 'Background',
      prose: [
        'Ting-Ting Hsu is an associate professor at Japan\'s MADOKA Floral Design Academy, specializing in Crystal Art Flowers — the exquisite craft of shaping transparent resin into eternal blooms. Her work is refined and soulful, yet she faced a persistent problem: "Everyone who sees the work is amazed, but nobody can find me."',
        'She had tried filming her own videos and writing her own copy, but the results always felt off — "this doesn\'t sound like me." She didn\'t want heavy-handed sales content, but she also didn\'t know how to be seen by the world in a way true to her aesthetic.',
      ],
      quote: { text: '"I just want to make flowers well. But simply surviving takes up all my time."', attr: '— Ting-Ting Hsu' },
    },
    challenge: {
      num: '02',
      label: 'Challenge',
      title: 'Problem',
      light: true,
      prose: ['The floral art market is saturated with homogeneous visual language — pinks, sweetness, handmade warmth. Crystal Art Flowers as a refined artistic craft needed not "cute" but "respected." The brand needed a system built from zero that would give her craft the stage it deserved.'],
      deliverables: [
        { num: '01', name: 'Unclear brand positioning', desc: 'The label "crystal flower teacher" couldn\'t communicate the artistic caliber of her work, indistinguishable from general craft classes.' },
        { num: '02', name: 'No sales page', desc: 'Course enrollment relied on word-of-mouth and LINE groups — no self-contained conversion page existed.' },
        { num: '03', name: 'Zero digital infrastructure', desc: 'No website, no tracking system, no advertising experience — data completely blank.' },
        { num: '04', name: 'Inconsistent brand visuals', desc: 'Instagram posts lacked strategy; the grid was visually chaotic and unable to build recognition.' },
      ],
    },
    approach: {
      num: '03',
      label: 'Approach',
      title: 'Method',
      prose: ['Not "doing marketing" for her, but building a complete brand infrastructure — beginning from story mining, letting the soul of the brand find its footing before layering in the technical architecture and sales system.'],
      timeline: [
        { phase: 'Phase 01', title: 'Brand story mining', desc: 'A four-layer interview method — scene, conflict, turning point, gap. Not "how do you want to introduce yourself?" but "why do you do this?" Two hours of deep conversation distilled into core brand story and emotional anchor.' },
        { phase: 'Phase 02', title: 'Sales page design & copy', desc: 'Transforming brand story into a high-conversion sales page — hero section for emotional connection, pain-point section for precision, social proof for trust, CTA to drive action. The copy doesn\'t sell a course; it sells an identity shift.' },
        { phase: 'Phase 03', title: 'Brand website build', desc: 'From design and development to Cloudflare deployment — a digital space worthy of the craft\'s refinement. GA4, Meta Pixel + CAPI configured so every traffic source has data to follow.' },
        { phase: 'Phase 04', title: 'Ad strategy & content', desc: 'Meta ad setup, seasonal marketing calendar, Instagram content strategy. Building the complete funnel from "see" to "enroll" — every ad dollar spent on the right person.' },
      ],
    },
    deliverables: {
      num: '04',
      label: 'Deliverables',
      title: 'Deliverables',
      light: true,
      items: [
        { num: '01', name: 'Brand story & copy system', desc: 'Core brand narrative, course sales copy, social copy templates, brand voice guide.' },
        { num: '02', name: 'Sales page', desc: 'High-conversion course enrollment page with form integration and conversion tracking.' },
        { num: '03', name: 'Brand website', desc: 'lustreyellow.com — full design, development, deployment, SSL, DNS.' },
        { num: '04', name: 'Analytics & tracking system', desc: 'GA4 + Meta Pixel + Conversions API setup and event configuration.' },
        { num: '05', name: 'Ad campaign setup', desc: 'Meta ad account build, audience configuration, creative production, and campaign optimization.' },
        { num: '06', name: 'Seasonal marketing calendar', desc: '12-month seasonal campaign planning with copy direction and promotion strategy.' },
      ],
    },
    result: {
      num: '05',
      label: 'Result',
      title: 'Result',
      prose: ['From "everyone who sees the work is amazed, but nobody can find me" — to a complete brand infrastructure: website, sales page, tracking system, ad campaigns, content strategy. Ting-Ting can return to her craft. The brand system runs for her.'],
      quote: { text: 'What was delivered was not "a few videos" or "a proposal" —\nbut an entire infrastructure for being seen.', multiline: true },
    },
  },
}

export const LUSTRE_YELLOW_CASE = { zh: ZH, en: EN }
