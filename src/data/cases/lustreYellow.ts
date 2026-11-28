import type { CaseStudy } from '../../lib/caseDoc.ts'
import tourVideo from '../../assets/work/lustre-yellow.mp4'
import tourPoster from '../../assets/work/lustre-yellow.webp'

const BG = 'linear-gradient(135deg, color-mix(in srgb, var(--surface-2) 92%, transparent) 0%, color-mix(in srgb, var(--surface-1) 82%, transparent) 45%, rgba(16, 15, 17, 0.72) 100%)'
const FULL_BG = 'linear-gradient(135deg, color-mix(in srgb, var(--surface-2) 94%, transparent) 0%, color-mix(in srgb, var(--surface-1) 84%, transparent) 50%, rgba(16, 15, 17, 0.76) 100%)'

const ZH: CaseStudy = {
  slug: 'lustre-yellow',
  hero: {
    num: 'CASE 03',
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
    fullWidthLabel: 'LUSTRE YELLOW · BRAND SYSTEM',
    fullWidthBg: FULL_BG,
    inlineLabel: 'SALES PAGE · DESKTOP VIEW',
  },
  videos: [{ src: tourVideo, poster: tourPoster, caption: '網站導覽' }],
  sections: {
    overview: {
      num: '01',
      label: 'Overview',
      title: '背景',
      prose: [
        '許婷婷是日本 MADOKA 花藝設計學院的副教授，專精水晶花（Crystal Art Flowers），這門工藝把透明樹脂塑造成永恆的花朵。她的作品精緻、有靈魂，卻長期面臨「看到作品的人都驚嘆，但找不到她」的困境。',
        '她試過自己拍影片、自己寫文案，成品出來總覺得「這不像我」。她不想拍那種商業感很重的推銷內容，但也不知道如何用符合自己氣質的方式被世界看見。',
      ],
      quote: { text: '「我只想好好做花，但光是生存就佔據了所有時間。」', attr: '──許婷婷' },
    },
    challenge: {
      num: '02',
      label: 'Challenge',
      title: '問題',
      light: true,
      prose: ['花藝市場的視覺語言大多相似，粉色系、甜美風、手作感。水晶花是一門精緻的藝術工藝，它需要的是被尊重，只有「可愛」並不夠。許婷婷的品牌需要一套從零開始的系統，讓她的手藝有一個配得上的舞台。'],
      deliverables: [
        { num: '01', name: '品牌定位模糊', desc: '「水晶花老師」的標籤無法傳達作品的藝術層次，與一般手作課程無法區隔。' },
        { num: '02', name: '銷售頁缺失', desc: '課程招生依賴口碑和 LINE 群組，沒有能獨立轉換的銷售頁面。' },
        { num: '03', name: '數位基礎設施為零', desc: '沒有官網、沒有追蹤系統、沒有廣告投放經驗，數據完全空白。' },
        { num: '04', name: '品牌視覺不統一', desc: 'Instagram 發文缺乏策略，九宮格視覺混亂，無法建立記憶點。' },
      ],
    },
    approach: {
      num: '03',
      label: 'Approach',
      title: '方法',
      prose: ['這個案子要做的比行銷更多，是替她建構一套完整的品牌基礎設施。我們從挖掘故事開始，先確定品牌的核心，再搭上技術架構和銷售系統。'],
      timeline: [
        { phase: 'Phase 01', title: '品牌故事挖掘', desc: '用四層訪談法，依序問場景、衝突、轉折、落差。我們不問「你想怎麼介紹自己」，改問「你為什麼做這件事」，從兩小時的深度對話中，提煉出品牌核心故事和情感錨點。' },
        { phase: 'Phase 02', title: '銷售頁設計與文案', desc: '把品牌故事轉化為高轉換率的銷售頁面，Hero 區建立情感連結，痛點區點出需求，社會證明建立信任，CTA 引導行動。文案賣的是身分的轉換，不只是一門課。' },
        { phase: 'Phase 03', title: '品牌官網建置', desc: '從設計、開發到 Cloudflare 部署，做出一個配得上作品精緻度的網站。設定 GA4 追蹤、Meta Pixel 和 CAPI，讓每一筆流量都有數據可循。' },
        { phase: 'Phase 04', title: '廣告投放與內容策略', desc: 'Meta 廣告投放設定、節慶行銷月曆規劃、Instagram 內容策略，建構從「看到」到「報名」的完整漏斗，把廣告預算花在對的人身上。' },
      ],
    },
    deliverables: {
      num: '04',
      label: 'Deliverables',
      title: '交付項目',
      light: true,
      items: [
        { num: '01', name: '品牌故事文案系統', desc: '品牌核心故事、課程銷售文案、社群文案範本、品牌語調指南' },
        { num: '02', name: '銷售頁面', desc: '高轉換率課程銷售頁，含報名表單整合與追蹤埋設' },
        { num: '03', name: '品牌形象官網', desc: 'lustreyellow.com 的設計、開發、部署、SSL、DNS 全流程交付' },
        { num: '04', name: '數據追蹤系統', desc: 'GA4 + Meta Pixel + Conversions API 建置與事件設定' },
        { num: '05', name: '廣告投放設定', desc: 'Meta 廣告帳號建置、受眾設定、素材製作與投放優化' },
        { num: '06', name: '節慶行銷月曆', desc: '12 個月節慶檔期規劃，含文案方向與推廣策略' },
      ],
    },
    result: {
      num: '05',
      label: 'Result',
      title: '成果',
      prose: ['許婷婷原本的困境是「看到作品的人都驚嘆，但找不到她」，現在她有一套完整的品牌基礎設施，包括官網、銷售頁、追蹤系統、廣告投放和內容策略。她可以回去好好創作，品牌的系統會替她持續運轉。'],
      quote: { text: '交付的不是「幾支影片」或「一份企劃書」，\n而是一整套讓品牌被看見的基礎設施。', multiline: true },
    },
  },
}

const EN: CaseStudy = {
  slug: 'lustre-yellow',
  hero: {
    num: 'CASE 03',
    titleEm: 'Lustre',
    titleRest: 'Yellow',
    subtitle: 'BRAND SYSTEM ARCHITECTURE',
    bg: BG,
    meta: [
      { label: 'Client', lines: ['Ting-Ting Hsu', 'MADOKA Floral Design Academy · Associate Professor'] },
      { label: 'Scope', lines: ['Brand System', 'Full-Service Execution'] },
      { label: 'Year', lines: ['2025 – 2026'] },
      { label: 'Link', href: 'https://lustreyellow.com', lines: ['lustreyellow.com'] },
    ],
  },
  media: {
    fullWidthLabel: 'LUSTRE YELLOW · BRAND SYSTEM',
    fullWidthBg: FULL_BG,
    inlineLabel: 'SALES PAGE · DESKTOP VIEW',
  },
  videos: [{ src: tourVideo, poster: tourPoster, caption: 'Site tour' }],
  sections: {
    overview: {
      num: '01',
      label: 'Overview',
      title: 'Background',
      prose: [
        'Ting-Ting Hsu is an associate professor at Japan\'s MADOKA Floral Design Academy. She makes Crystal Art Flowers, flowers shaped from clear resin that never wilt. Her work is fine and has character, but she had one lasting problem: "Everyone who sees the work is amazed, but nobody can find me."',
        'She had filmed her own videos and written her own copy, and each time the result felt wrong: "this doesn\'t sound like me." She did not want hard-sell content, and she did not know how to be seen in a way that suited her.',
      ],
      quote: { text: '"I just want to make flowers well. But simply surviving takes up all my time."', attr: '— Ting-Ting Hsu' },
    },
    challenge: {
      num: '02',
      label: 'Challenge',
      title: 'Problem',
      light: true,
      prose: ['Most floral art brands look alike: pink, sweet and handmade. Crystal Art Flowers is a fine craft, and it needed respect more than it needed to look cute. The brand needed a system built from nothing, one that gave her craft a stage equal to it.'],
      deliverables: [
        { num: '01', name: 'Unclear brand positioning', desc: 'The label "crystal flower teacher" did not show the artistic level of her work, and did not set her apart from ordinary craft classes.' },
        { num: '02', name: 'No sales page', desc: 'Course enrollment relied on word of mouth and LINE groups. No page could convert visitors without them.' },
        { num: '03', name: 'Zero digital infrastructure', desc: 'No website, no tracking and no advertising experience, so there was no data at all.' },
        { num: '04', name: 'Inconsistent brand visuals', desc: 'Instagram posts had no strategy. The grid looked disordered and gave people nothing to remember.' },
      ],
    },
    approach: {
      num: '03',
      label: 'Approach',
      title: 'Method',
      prose: ['The job was to build the whole brand infrastructure for her, which is more than running her marketing. We started by finding her story, so the brand knew what it stood for, and then added the technical setup and the sales system.'],
      timeline: [
        { phase: 'Phase 01', title: 'Brand story mining', desc: 'A four-layer interview: scene, conflict, turning point, gap. We did not ask "how do you want to introduce yourself?" We asked "why do you do this?" Two hours of conversation gave us the core brand story and its emotional anchor.' },
        { phase: 'Phase 02', title: 'Sales page design & copy', desc: 'We turned the brand story into a sales page built to convert. The hero section makes an emotional connection, the pain-point section names the need, social proof builds trust, and the call to action asks for the next step. The copy sells a change of identity more than it sells a course.' },
        { phase: 'Phase 03', title: 'Brand website build', desc: 'Design, development and deployment on Cloudflare, for a site as refined as the work it shows. GA4 and Meta Pixel with CAPI are set up, so every visit leaves data.' },
        { phase: 'Phase 04', title: 'Ad strategy & content', desc: 'Meta ad setup, a seasonal marketing calendar and an Instagram content strategy. Together they form the whole funnel from "see" to "enroll", so the ad budget is spent on the right people.' },
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
        { num: '03', name: 'Brand website', desc: 'lustreyellow.com: design, development, deployment, SSL and DNS.' },
        { num: '04', name: 'Analytics & tracking system', desc: 'GA4 + Meta Pixel + Conversions API setup and event configuration.' },
        { num: '05', name: 'Ad campaign setup', desc: 'Meta ad account build, audience configuration, creative production, and campaign optimization.' },
        { num: '06', name: 'Seasonal marketing calendar', desc: '12-month seasonal campaign planning with copy direction and promotion strategy.' },
      ],
    },
    result: {
      num: '05',
      label: 'Result',
      title: 'Result',
      prose: ['She started with "everyone who sees the work is amazed, but nobody can find me." She now has a complete brand infrastructure: website, sales page, tracking, ad campaigns and content strategy. Ting-Ting can go back to making flowers, and the system keeps working for her.'],
      quote: { text: 'What we delivered was not "a few videos" or "a proposal".\nIt was the whole infrastructure that lets the brand be seen.', multiline: true },
    },
  },
}

export const LUSTRE_YELLOW_CASE = { zh: ZH, en: EN }
