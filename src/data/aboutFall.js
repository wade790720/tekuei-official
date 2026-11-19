// About page content. The page tells it backwards: the figure starts at today and falls into the past.
// Source: Wade's CV. Each act has text for the slab (sub, title) and for the corner caption (role, lines).
// `side` shifts the slab left or right by that share of the screen width.

export const ABOUT_FALL_META = {
  zh: {
    title: 'About · TEKUEI 德溎',
    description: '10 年軟體工程師經歷，策劃過 10 餘檔展覽，同時是 MONOLAB 共同創辦人。目前專注記錄日常想法，以及行銷、工程、AI 相關的內容創作。',
  },
  en: {
    title: 'About · TEKUEI',
    description: 'Ten years as a software engineer, curator of more than ten exhibitions, and co-founder of MONOLAB. I now write about daily thoughts, marketing, engineering and AI.',
  },
}

export const ABOUT_FALL_INTRO = {
  zh: {
    label: 'ABOUT',
    headline: ['一路往下，', '每一段都是經歷。'],
    body: '我是朱德溎。背景橫跨 10 年軟體工程、產品管理與跨部門協作，熟悉從 0 到 1 建立系統、團隊與流程。',
    hint: '往下捲',
    soundOn: '聲音：開',
    soundOff: '聲音：關',
    railStart: 'NOW',
    railEnd: '2013',
  },
  en: {
    label: 'ABOUT',
    headline: ['All the way down.', 'Every stretch is a chapter.'],
    body: 'I am Wade Zhu. Ten years across software engineering, product management and cross-team work. I build systems, teams and processes from zero.',
    hint: 'Scroll down',
    soundOn: 'SOUND: ON',
    soundOff: 'SOUND: OFF',
    railStart: 'NOW',
    railEnd: '2013',
  },
}

// Written oldest first, as on the CV. The page shows them newest first (see the export below).
const CHRONOLOGICAL = {
  zh: [
    {
      sub: 'ACT I // 2013 — 2015 · 新竹',
      title: 'iSchool 澔學學習系統',
      role: 'Front-end Engineer',
      lines: ['第一份前端工作。'],
      side: 0,
    },
    {
      sub: 'ACT II // 2015 — 2018 · 台北',
      title: 'Revovision 睿訊',
      role: 'Front-end Engineer',
      lines: ['持續做前端開發。'],
      side: -0.04,
    },
    {
      sub: 'ACT III // 2018 — 2020 · 台北',
      title: 'Unistar 優訊軟體科技',
      role: 'Senior Frontend Engineer & Team Leader',
      lines: ['開始帶團隊。'],
      side: 0.04,
    },
    {
      sub: 'ACT IV // 2020 — 2022 · 台北',
      title: 'Cloudlytics 雲策數據',
      role: 'Senior Frontend Engineer & Team Leader',
      lines: ['數據分析平台：用戶畫像、即時數據、BI 系統。', '管理 10 位前端與設計團隊成員，負責技術決策、開發流程與跨部門協作。'],
      side: 0,
    },
    {
      sub: 'ACT V // 2023 · 台北',
      title: 'Cloras 雲訊科技',
      role: 'Senior Frontend Engineer',
      lines: ['售票與會計系統的核心模組。', '專注在複雜表單、交易流程與系統穩定性。'],
      side: -0.04,
    },
    {
      sub: 'ACT VI // 2023 — 2026 · 台北',
      title: 'Monoame 墨雨互動設計',
      role: 'Co-Founder & CEO',
      lines: ['創立 MONOLAB，整合數位藝術、科技、時尚與互動系統。', '策劃 6 場展覽。售票展覽達成 ROA 6 與 ROA 22。', '開發馬祖國際藝術島第三屆與 SRE 官方網站。'],
      side: 0.04,
    },
    {
      sub: 'NOW // TEKUEI 德溎',
      title: '我寫程式，也把過程寫下來',
      role: '技術 × 美學 × 商業',
      lines: ['工程思維、商業判斷、策展與美感整合。', '在限制條件下，讓任務確實落地。'],
      side: 0,
    },
  ],
  en: [
    {
      sub: 'ACT I // 2013 — 2015 · HSINCHU',
      title: 'iSchool',
      role: 'Front-end Engineer',
      lines: ['My first front-end job.'],
      side: 0,
    },
    {
      sub: 'ACT II // 2015 — 2018 · TAIPEI',
      title: 'Revovision',
      role: 'Front-end Engineer',
      lines: ['More front-end work.'],
      side: -0.04,
    },
    {
      sub: 'ACT III // 2018 — 2020 · TAIPEI',
      title: 'Unistar',
      role: 'Senior Frontend Engineer & Team Leader',
      lines: ['I started to lead a team.'],
      side: 0.04,
    },
    {
      sub: 'ACT IV // 2020 — 2022 · TAIPEI',
      title: 'Cloudlytics',
      role: 'Senior Frontend Engineer & Team Leader',
      lines: ['Data analytics platform: user profiles, real-time data, BI.', 'I managed ten front-end and design people, and owned technical decisions, process and cross-team work.'],
      side: 0,
    },
    {
      sub: 'ACT V // 2023 · TAIPEI',
      title: 'Cloras',
      role: 'Senior Frontend Engineer',
      lines: ['Core modules of a ticketing and accounting system.', 'Complex forms, transaction flows and stability.'],
      side: -0.04,
    },
    {
      sub: 'ACT VI // 2023 — 2026 · TAIPEI',
      title: 'Monoame',
      role: 'Co-Founder & CEO',
      lines: ['I founded MONOLAB. It joins digital art, technology, fashion and interactive systems.', 'Six exhibitions. Ticketed shows reached ROA 6 and ROA 22.', 'I built the sites for Matsu Biennial 3 and SRE.'],
      side: 0.04,
    },
    {
      sub: 'NOW // TEKUEI',
      title: 'I write code, and I write down the process',
      role: 'Technology × Aesthetics × Business',
      lines: ['Engineering thinking, business judgement, curation and taste.', 'I get the work shipped inside real limits.'],
      side: 0,
    },
  ],
}

export const ABOUT_FALL_ACTS = { zh: CHRONOLOGICAL.zh.toReversed(), en: CHRONOLOGICAL.en.toReversed() }
