// About page content. The page tells it backwards: the figure starts at today and falls into the past.
// Source: Wade's CV. Each act has text for the slab (sub, title) and for the corner caption (role, lines).
// `side` shifts the slab left or right by that share of the screen width.

export const ABOUT_FALL_META = {
  zh: {
    title: 'About · TEKUEI 德溎',
    description: '10 年軟體工程師經歷，策劃過 10 餘檔展覽，同時是 MONOLAB 共同創辦人。目前專注記錄日常想法，以及行銷、軟體工程、AI 相關的內容創作。',
  },
  en: {
    title: 'About · TEKUEI',
    description: 'Ten years as a software engineer, curator of more than ten exhibitions, and co-founder of MONOLAB. I now write about daily thoughts, marketing, software engineering and AI.',
  },
}

export const ABOUT_FALL_INTRO = {
  zh: {
    label: 'ABOUT',
    headline: ['一路往下，', '每一段都是經歷。'],
    body: '我是朱德溎，背景橫跨 10 年軟體工程、產品管理與跨部門協作，熟悉從 0 到 1 建立系統、團隊與流程。',
    hint: '往下捲',
    soundOn: '聲音：開',
    soundOff: '聲音：關',
    railStart: 'NOW',
    railEnd: '2013',
    more: '完整經歷',
    less: '收合',
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
    more: 'Full details',
    less: 'Close',
  },
}

// Written oldest first, as on the CV. The page shows them newest first (see the export below).
// Source: Wade's CV (Notion). On the slab: sub and title. In the corner caption: org (or title), role,
// 3–5 short points, and the full details behind the arrow.
const CHRONOLOGICAL = {
  zh: [
    {
      sub: 'ACT I // 2013 — 2015 · 新竹',
      title: 'iSchool 澔學學習系統',
      role: 'Front-end Engineer',
      points: ['第一份前端工作', '用 jQuery 和 Angular 1.0 開發'],
      details: [{ heading: '技術', items: ['HTML、CSS、JavaScript (ES5)、jQuery、Angular 1.0'] }],
      side: 0,
    },
    {
      sub: 'ACT II // 2015 — 2018 · 台北',
      title: 'Revovision 睿訊',
      role: 'Front-end Engineer',
      points: ['持續做前端開發', '用 Vue 2.0 和 RESTful API 開發響應式網站'],
      details: [
        {
          heading: '技術',
          items: ['HTML、CSS、Stylus、JavaScript (ES5)、Vue 2.0、RESTful APIs、Apache、SVN、Materialize、RWD'],
        },
      ],
      side: -0.04,
    },
    {
      sub: 'ACT III // 2018 — 2020 · 台北',
      title: 'Unistar 優訊軟體科技',
      role: 'Senior Frontend Engineer & Team Leader',
      points: ['開始帶團隊', '用 React、Redux 和 Redux-Saga 開發', '用 Jest 和 Enzyme 寫測試'],
      details: [
        {
          heading: '技術',
          items: ['JSX、SASS / SCSS、JavaScript (ES6)、React 15+、Redux、Redux-Saga、Git、Nginx、Webpack、Jest、Enzyme、Ember 1.0、GreenSock'],
        },
      ],
      side: 0.04,
    },
    {
      sub: 'ACT IV // 2020 — 2022 · 台北',
      title: 'Cloudlytics 雲策數據',
      role: 'Senior Frontend Engineer & Team Leader',
      points: [
        '數據分析平台：使用者輪廓、即時數據、BI 系統',
        '管理 10 位前端與設計團隊成員',
        '導入 Design System 和 Figma 協作流程',
        '主導 React、TypeScript、GraphQL 的架構',
      ],
      details: [
        {
          heading: '技術管理',
          items: [
            '負責招募、任務規劃、人力配置、1 on 1 面談、績效評估。',
            '管理 10 位前端與設計團隊成員（Sr. FE、Jr. FE、UI/UX、Backend）。',
            '導入 Design System、Design Flow、Figma 協作流程，提升設計與開發產能。',
            '建立前端技術選型策略與架構設計，推動 TypeScript、GraphQL、Storybook、Cypress 導入。',
          ],
        },
        {
          heading: '技術成果',
          items: [
            '主導 React 17、TypeScript、GraphQL 的整體架構與技術規劃。',
            '開發使用者輪廓平台與即時數據系統，整合 ECharts、Apollo GraphQL。',
            '建立 ESLint 設定、內部元件庫（Storybook + Rollup）、CI/CD 流程、自動產生型別的工具。',
          ],
        },
        {
          heading: '技術',
          items: ['TSX、CSS Modules、TypeScript、React 17+、Recoil、Git、ESLint、Jest、Cypress、Codegen、Apollo GraphQL、ECharts'],
        },
      ],
      side: 0,
    },
    {
      sub: 'ACT V // 2023 · 台北',
      title: 'Cloras 雲訊科技',
      role: 'Senior Frontend Engineer',
      points: [
        '售票與會計系統的核心模組',
        '主導 React 18、TypeScript、Ant Design 的架構',
        '用 OpenAPI 和 Swagger 與後端建立一致的 API 契約',
        '把複雜的會計流程做成好用、好維護的介面',
      ],
      details: [
        {
          heading: '關鍵貢獻',
          items: [
            '主導 React 18 + TypeScript + Ant Design 技術架構與開發執行。',
            '規劃 OpenAPI + Swagger 流程，與後端建立一致的 API 契約。',
            '建立可維護的元件與資料流架構，降低後續擴充成本。',
            '協助團隊把複雜的會計流程，轉成可用、可維護的 UI 系統。',
          ],
        },
        {
          heading: '技術',
          items: ['TSX、CSS Modules、TypeScript、React 18、Dva、Git、Fabric、Ant Design、Ant Design Charts、ProComponents、UmiJS、OpenAPI'],
        },
      ],
      side: -0.04,
    },
    {
      sub: 'ACT VI // 2023 — 2026 · 台北',
      title: 'Monoame 墨雨互動設計',
      role: 'Co-Founder & CEO',
      points: [
        '創立 MONOLAB，整合數位藝術、科技、時尚與互動系統',
        '管理 10 人的跨領域團隊',
        '策劃 6 場展覽，售票展覽達成 ROA 6 與 ROA 22',
        'TouchDesigner 工作坊與線上課程，單月營收 40 萬',
        '開發馬祖國際藝術島第三屆與 SRE 官方網站',
      ],
      details: [
        {
          heading: '重點成果',
          items: [
            '建立年度營運策略、產品線 Roadmap 與長期品牌發展規劃，為第一年的營收成長打下基礎。',
            '直屬管理 10 位跨領域成員：PM、特助、設計、行政、全端工程師、藝術家，負責組織設計、產能配置與跨部門協作流程。',
            '建立財務、法務、行政、人事流程，導入標準作業流程，提升營運效率與協作品質。',
            '兼任行銷企劃與投手，售票展覽達成 ROA 6 與 ROA 22。',
            '建立 MONOLAB 藝術策展品牌並開發官方網站，業務開發的前置時間減少 60%。',
            '開發 SRE 官方網站與馬祖國際藝術島第三屆網站，負責技術、架構決策與整合。',
            '主導業務開發、商務談判、公關，合作對象包括 LG、GQ、AMBI、星巴克、統一、文策院、北流、交大、友達、啟藝、藝高、動區、公視、知識衛星、Hahow、W Hotel、白輻射。',
            '開辦 TouchDesigner 工作坊與線上課程，單月營收 40 萬，建立教育產品線。',
            '策劃 6 場展覽，其中 2 場對外售票，評價良好。',
          ],
        },
        {
          heading: '核心能力',
          items: [
            '團隊管理：跨團隊資訊同步、產品線 Roadmap、1 on 1 與 AMA 會議、招募與團隊編制',
            '營運管理：財務、法務、行政、人事制度化，SOP 與自動化，預算、展覽 P&L、金流與成本控管',
            '技術規劃：多裝置整合（影像、燈光、投影、硬體控制），網站架構（Next.js、React、TypeScript）',
            '品牌行銷：投放策略與轉換分析、品牌故事與定位、社群與內容策略、公關與簡報',
            '策展規劃：故事腳本、動線設計、五感整合、現場測試與技術 QA、跨廠商協作',
          ],
        },
        {
          heading: '作品',
          items: ['MONOLAB：monolab.world', '馬祖國際藝術島：matsubiennial.tw', 'SRE 風睿能源：sreglobal.com', 'TouchDesigner 教育：education.monolab.world'],
        },
      ],
      side: 0.04,
    },
    {
      sub: 'NOW // TEKUEI 德溎',
      title: '我寫程式，也把過程寫下來',
      org: 'TEKUEI 德溎',
      role: '技術 × 美學 × 商業',
      points: [
        '工程思維：拆解複雜問題，建立流程與系統',
        '商業判斷：用小成本快速驗證市場',
        '策展與美感：理解敘事和體驗如何影響決策',
        '在限制條件下，讓任務確實執行',
      ],
      details: [
        {
          heading: '工作方式',
          items: [
            '理解跨團隊的需求，並給予協助。',
            '獨立思考、決策、人力配置與時程控管。',
            '整合資源與跨領域協作，快速對齊團隊目標。',
            '有效率地安排任務，推動執行。',
            '把抽象的願景轉成可執行的策略。',
            '學得快，能迅速融入不同團隊。',
            '在限制條件下提出整合方案，兼顧技術、美學與商業。',
          ],
        },
      ],
      side: 0,
    },
  ],
  en: [
    {
      sub: 'ACT I // 2013 — 2015 · HSINCHU',
      title: 'iSchool',
      role: 'Front-end Engineer',
      points: ['My first front-end job.', 'Built with jQuery and Angular 1.0.'],
      details: [{ heading: 'Stack', items: ['HTML, CSS, JavaScript (ES5), jQuery, Angular 1.0'] }],
      side: 0,
    },
    {
      sub: 'ACT II // 2015 — 2018 · TAIPEI',
      title: 'Revovision',
      role: 'Front-end Engineer',
      points: ['More front-end work.', 'Responsive sites with Vue 2.0 and RESTful APIs.'],
      details: [
        { heading: 'Stack', items: ['HTML, CSS, Stylus, JavaScript (ES5), Vue 2.0, RESTful APIs, Apache, SVN, Materialize, RWD'] },
      ],
      side: -0.04,
    },
    {
      sub: 'ACT III // 2018 — 2020 · TAIPEI',
      title: 'Unistar',
      role: 'Senior Frontend Engineer & Team Leader',
      points: ['I started to lead a team.', 'Built with React, Redux and Redux-Saga.', 'Tests with Jest and Enzyme.'],
      details: [
        {
          heading: 'Stack',
          items: ['JSX, SASS / SCSS, JavaScript (ES6), React 15+, Redux, Redux-Saga, Git, Nginx, Webpack, Jest, Enzyme, Ember 1.0, GreenSock'],
        },
      ],
      side: 0.04,
    },
    {
      sub: 'ACT IV // 2020 — 2022 · TAIPEI',
      title: 'Cloudlytics',
      role: 'Senior Frontend Engineer & Team Leader',
      points: [
        'Data analytics platform: user profiles, real-time data, BI.',
        'I managed ten front-end and design people.',
        'I brought in a design system and a Figma workflow.',
        'I led the React, TypeScript and GraphQL architecture.',
      ],
      details: [
        {
          heading: 'Leadership',
          items: [
            'Hiring, planning, staffing, 1 on 1s and performance reviews.',
            'Ten people across senior and junior front-end, UI/UX and back-end.',
            'Design system, design flow and Figma workflow, for faster design and build.',
            'Front-end stack and architecture. Brought in TypeScript, GraphQL, Storybook and Cypress.',
          ],
        },
        {
          heading: 'Results',
          items: [
            'Led the React 17, TypeScript and GraphQL architecture.',
            'Built the user profile platform and the real-time data system with ECharts and Apollo GraphQL.',
            'Set up the ESLint config, an internal component library (Storybook + Rollup), CI/CD and type generation.',
          ],
        },
        {
          heading: 'Stack',
          items: ['TSX, CSS Modules, TypeScript, React 17+, Recoil, Git, ESLint, Jest, Cypress, Codegen, Apollo GraphQL, ECharts'],
        },
      ],
      side: 0,
    },
    {
      sub: 'ACT V // 2023 · TAIPEI',
      title: 'Cloras',
      role: 'Senior Frontend Engineer',
      points: [
        'Core modules of a ticketing and accounting system.',
        'I led the React 18, TypeScript and Ant Design architecture.',
        'OpenAPI and Swagger kept the API contract in sync with the back end.',
        'Complex accounting flows became usable, maintainable UI.',
      ],
      details: [
        {
          heading: 'Contributions',
          items: [
            'Led the React 18 + TypeScript + Ant Design architecture and build.',
            'Set up the OpenAPI + Swagger flow for one shared API contract.',
            'Built a maintainable component and data-flow structure, so later features cost less.',
            'Helped the team turn complex accounting flows into usable UI.',
          ],
        },
        {
          heading: 'Stack',
          items: ['TSX, CSS Modules, TypeScript, React 18, Dva, Git, Fabric, Ant Design, Ant Design Charts, ProComponents, UmiJS, OpenAPI'],
        },
      ],
      side: -0.04,
    },
    {
      sub: 'ACT VI // 2023 — 2026 · TAIPEI',
      title: 'Monoame',
      role: 'Co-Founder & CEO',
      points: [
        'I founded MONOLAB. It joins digital art, technology, fashion and interactive systems.',
        'I led a team of ten across disciplines.',
        'Six exhibitions. Ticketed shows reached ROA 6 and ROA 22.',
        'TouchDesigner workshops and courses: NT$400,000 in one month.',
        'I built the sites for Matsu Biennial 3 and SRE.',
      ],
      details: [
        {
          heading: 'Milestones',
          items: [
            'Set the yearly operating plan, the product roadmap and the long-term brand plan.',
            'Led ten people directly: PM, assistant, designers, admin, a full-stack engineer and an artist.',
            'Set up finance, legal, admin and HR processes, with standard procedures.',
            'Ran marketing and paid ads. Ticketed shows reached ROA 6 and ROA 22.',
            'Built the MONOLAB brand and site. Sales lead time fell by 60%.',
            'Built the SRE site and the Matsu Biennial 3 site: technology, architecture and delivery.',
            'Led sales, negotiation and PR. Partners include LG, GQ, Starbucks, Uni-President, TAICCA, AUO, PTS, Hahow and W Hotel.',
            'Started TouchDesigner workshops and courses: NT$400,000 in one month.',
            'Curated six exhibitions. Two were ticketed and well reviewed.',
          ],
        },
        {
          heading: 'Skills',
          items: [
            'Team: information flow, roadmap, 1 on 1s and AMAs, hiring.',
            'Operations: finance, legal, admin and HR systems, SOPs and automation, budgets, exhibition P&L.',
            'Technology: multi-device shows (video, light, projection, hardware), web architecture (Next.js, React, TypeScript).',
            'Marketing: paid ads and conversion, brand story and positioning, social and content, PR.',
            'Curation: scripts, visitor flow, five-sense design, on-site testing and QA, vendor work.',
          ],
        },
        {
          heading: 'Work',
          items: ['MONOLAB: monolab.world', 'Matsu Biennial: matsubiennial.tw', 'SRE: sreglobal.com', 'TouchDesigner courses: education.monolab.world'],
        },
      ],
      side: 0.04,
    },
    {
      sub: 'NOW // TEKUEI',
      title: 'I write code, and I write down the process',
      org: 'TEKUEI',
      role: 'Technology × Aesthetics × Business',
      points: [
        'Engineering: break hard problems down, build processes and systems.',
        'Business: test the market fast and cheap.',
        'Curation and taste: know how story and experience shape decisions.',
        'I get the work shipped inside real limits.',
      ],
      details: [
        {
          heading: 'How I work',
          items: [
            'I understand what other teams need, and I help.',
            'I think on my own, decide, staff and keep the schedule.',
            'I bring resources and disciplines together, and align the team fast.',
            'I plan work well and push it to done.',
            'I turn a vague vision into a plan people can act on.',
            'I learn fast and fit into new teams quickly.',
            'Inside real limits, I find one answer that serves technology, aesthetics and business.',
          ],
        },
      ],
      side: 0,
    },
  ],
}

export const ABOUT_FALL_ACTS = { zh: CHRONOLOGICAL.zh.toReversed(), en: CHRONOLOGICAL.en.toReversed() }
