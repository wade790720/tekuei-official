// Copy for the Overview and Theme pages of /dev/component-library (dev-only, Chinese only).
// Each page: name, lead, and its "本頁" headings (ids match the sections the page renders).
// Write as reference docs: state the rule or the fact. No design history, no outside sites.

const BASE = '/dev/component-library'
const to = (id) => `${BASE}/${id}`

export const GUIDES = {
  // ── Overview ──
  introduction: {
    name: '開始使用',
    lead: '用 tokens.css 的變數和這份文件裡的元件組頁面',
    toc: [
      ['how', '組成'],
      ['steps', '步驟'],
      ['next', '延伸閱讀'],
    ],
    intro:
      'TEKUEI 的介面分成三層：tokens.css 的設計變數、src/components/ 的元件、每頁一個的 CSS。這份文件只在開發模式出現，不進正式 build。',
    steps: [
      {
        id: 'step-tokens',
        title: '1. 使用 token',
        text: '顏色、字級、間距、圓角和動態都用 tokens.css 的變數，不要寫新的色碼或像素值。',
        lang: 'css',
        code: `.journal-card {
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--surface-1);
  color: var(--text-body);
}`,
      },
      {
        id: 'step-components',
        title: '2. 使用元件',
        text: '先找這份文件裡已有的元件，從 src/components/ 匯入。',
        lang: 'jsx',
        code: `import { ImageCard } from '../components/ImageCard.jsx'

<ImageCard src={src} alt="設定頁的截圖" caption="設定頁" />`,
      },
      {
        id: 'step-styles',
        title: '3. 寫頁面樣式',
        text: '每頁一個 CSS 檔，放在 src/styles/。class 用「頁面前綴 + BEM」，狀態用 is-*。',
        lang: 'css',
        code: `/* src/styles/journal.css */
.journal-footer__link { … }
.journal-footer__link.is-active { … }`,
      },
      {
        id: 'step-check',
        title: '4. 確認',
        text: 'lint 和 build 都要通過。用 375px、1440px、2560px 打開頁面，再開啟「減少動態效果」看一次。',
        lang: 'bash',
        code: `npm run lint
npm run build
npm run dev`,
      },
    ],
    next: [
      { to: to('styling'), title: '樣式', text: '命名、token 的用法和常見問題' },
      { to: to('layout'), title: '版面', text: '最大寬度、留白和區塊間距' },
      { to: to('theme'), title: '主題', text: '設計變數的組成' },
      { to: to('color'), title: 'Color', text: '色階和語意 token' },
      { to: to('typography'), title: 'Typography', text: '字級、字重和字型' },
      { to: to('spacing'), title: 'Spacing', text: '間距刻度和節奏' },
    ],
  },
  styling: {
    name: '樣式',
    lead: '怎麼寫 TEKUEI 的樣式',
    toc: [
      ['intro', '說明'],
      ['tokens', '使用 token'],
      ['naming', '命名'],
      ['issues', '常見問題'],
    ],
    intro: '網站沒有使用 CSS 框架，樣式是一般的 CSS 檔，值全部來自 tokens.css。元件自帶樣式，頁面只負責排版。',
    tokens: {
      text: '新程式碼只用語意 token：--surface-*、--text-*、--line、--ember，不要直接用色階的某一階。頁面自己的變數必須指向全站 token。',
      code: `.journal-page {
  --j-lamp: var(--ember);   /* 指向全站 token */
}

.journal-card {
  border: 1px solid var(--line);
  color: var(--text-secondary);
}`,
    },
    naming: {
      text: 'class 用頁面或元件的前綴加 BEM，狀態用 is-*，資料狀態用 data-*。',
      code: `.code-card { … }            /* 元件 */
.code-card__bar { … }       /* 元件的零件 */
.journal-footer__link { … } /* 頁面的區塊 */
.journal-card.is-visible { … }
.secret-input[data-invalid] { … }`,
    },
    issues: [
      {
        id: 'sticky',
        title: 'position: sticky 沒有作用',
        text: 'html 和 body 設了 overflow-x: hidden，sticky 會失效，因此需要固定的元素改用 position: fixed。',
      },
      {
        id: 'transform',
        title: '淡入後位置跑掉',
        text: 'FadeIn 顯示時會設定 transform，因此用 transform 置中的元素不要包在 FadeIn 裡，改用 margin 置中。',
      },
      {
        id: 'stacking',
        title: '浮層被導覽列蓋住',
        text: '導覽列固定在最上層，因此浮層用 createPortal 放到 body 底下，例如 SidePanel 和 OtpGate。',
      },
      {
        id: 'italic',
        title: '中文斜體',
        text: '思源宋體沒有斜體，中文的 font-style: italic 會變成瀏覽器合成的斜體，因此斜體只用在英文。',
      },
    ],
  },
  layout: {
    name: '版面',
    lead: '頁面寬度、左右留白和區塊間距',
    toc: [
      ['max-width', '最大寬度'],
      ['full-bleed', '滿版的元素'],
      ['decoration', '絕對定位的裝飾'],
      ['sections', '區塊間距'],
    ],
    maxWidth: {
      text: '所有內容最寬 1920px，螢幕更寬時內容置中，只有背景延伸到兩側。區塊的左右留白用 --page-gutter 加 --page-pad。',
      code: `.journal-section {
  padding-inline: calc(var(--page-gutter) + var(--page-pad));
}`,
      rows: [
        ['--page-max', '1920px', '內容的最大寬度，heroFx.js 的 MAX_W 要一樣'],
        ['--page-gutter', 'max(0px, (100vw − 1920px) / 2)', '超過 1920px 時兩側多出的寬度，1920px 以下是 0'],
        ['--page-pad', 'clamp(20px, 4vw, 68px)', '內容和螢幕邊緣的距離'],
      ],
    },
    fullBleed: {
      text: '可以延伸到全寬的只有：背景色、背景漸層、整條分隔線、導覽列的底色。全寬的圖帶寬度用 min(100vw, var(--page-max))，用 margin 置中。',
      code: `.journal-footer__art {
  width: min(100vw, var(--page-max));
  margin-inline: auto;
}`,
    },
    decoration: {
      text: '跟內容對齊的裝飾（浮水印、軸線、格線）用絕對定位時，left 和 right 也要加上 --page-gutter。',
      code: `.journal-header__axis {
  position: absolute;
  left: calc(var(--page-gutter) + var(--page-pad));
}`,
    },
    sections: {
      text: '頁面大區塊之間用 --section-gap，隨螢幕寬度在 96px 和 128px 之間。',
      code: `.journal-section + .journal-section {
  margin-top: var(--section-gap);
}`,
    },
  },
  resources: {
    name: '資源',
    lead: '規範檔和量測資料',
    toc: [
      ['files', '規範檔'],
      ['references', '參考網站對照'],
      ['bibliography', '參考文獻'],
    ],
    files: [
      ['AGENTS.md', '工作規範：指令、資料夾、寫程式和內容的規則'],
      ['PRODUCT.md', '網站的目的、讀者和品牌'],
      ['DESIGN.md', '視覺和動態規範'],
      ['src/styles/tokens.css', '所有設計變數'],
    ],
    references: '建立字級和間距時量測了這三個網站，TEKUEI 一欄即時讀取 tokens.css 和文章版面，永遠是目前的設定。',
    bibliography: {
      lead: '做這個網站時參考了這些網站。新增參考時，在對應的組別加一列，「用在哪裡」寫檔案或頁面。',
      // [site, url, what we took from it, where it is used]
      groups: [
        {
          title: '元件與效果',
          rows: [
            ['Radix UI', 'https://www.radix-ui.com/', '文件的分類、每頁的編排、Typography 頁', 'Component Library'],
            ['React Bits Pro', 'https://pro.reactbits.dev/', '下拉選單', 'DropdownMenu'],
            ['pixelui：Tracked Butterfly ASCII', 'https://pixelui.dev/components/tracked-butterfly-ascii', 'hover 時的 ASCII 追蹤框和第二張圖', 'heroFx.js'],
            ['motionsites.ai', 'https://motionsites.ai/', '版畫圖由碎片組合的頁尾，footer-sea.webp 也來自這裡，未授權，上線前要換', 'shatterImage.js、Journal 頁尾'],
            ['aiforui.dev', 'https://aiforui.dev/', '頁首的字元雨（MatrixRain）', 'glyphField.js'],
          ],
        },
        {
          title: '字級與內容頁',
          rows: [
            ['nan.fyi', 'https://www.nan.fyi/', '內容頁的細節、字體', 'Journal 內頁'],
            ['jakub.kr', 'https://jakub.kr/', '字級、間距、小細節，文章內的程式碼、圖片、影片 card', 'tokens.css、CodeCard、ImageCard、VideoCard'],
            ['interfaces.dev', 'https://interfaces.dev/', '字級、間距、圖片輪播', 'tokens.css、SlidesCard'],
          ],
        },
      ],
    },
  },

  // ── Theme ──
  theme: {
    name: '總覽',
    lead: '設計變數的組成和使用方式',
    toc: [
      ['anatomy', '組成'],
      ['principles', '原則'],
      ['tokens', 'Token'],
    ],
    anatomy: {
      text: 'tokens.css 定義全站的設計變數，分成兩層：色階和刻度是原料，語意 token 指向原料。元件和頁面只用語意 token。',
      code: `/* 原料：色階和刻度 */
--gray-1 … --gray-12     --gray-a1 … --gray-a12
--accent-1 … --accent-12 --accent-a1 … --accent-a12
--type-body  --space-4  --radius-lg  --ease-touch

/* 語意：元件和頁面用這一層 */
--surface-1: var(--gray-3);
--text-body: var(--gray-a12);
--line: var(--gray-a6);
--ember: var(--accent-9);`,
    },
    principles: [
      '安靜的版面，配一個精準的記憶點',
      '深色底、象牙白字、少量金色，比例約 70% 黑與炭灰、25% 象牙白、5% 金色',
      '每頁最多一個招牌效果',
      '每個動畫都支援「減少動態效果」',
    ],
    tokens: [
      { to: to('color'), title: 'Color', text: '灰階和金色的 12 階色階，以及語意 token' },
      { to: to('typography'), title: 'Typography', text: '字級、字重、字型和行內格式' },
      { to: to('spacing'), title: 'Spacing', text: '間距刻度和三種節奏' },
      { to: to('radius'), title: 'Radius', text: '圓角刻度' },
      { to: to('motion'), title: 'Motion', text: 'Easing、時長和減少動態效果' },
      { to: to('breakpoints'), title: 'Breakpoints', text: '版面切換的寬度' },
    ],
  },
  color: {
    name: 'Color',
    lead: '色階、語意 token 和使用方式',
    toc: [
      ['accent', '強調色'],
      ['gray', '灰階'],
      ['alpha', '透明色'],
      ['semantic', '語意 token'],
      ['backgrounds', '背景'],
      ['focus', 'Hover 和聚焦'],
      ['spec', '實際使用'],
    ],
    intro: '兩組 12 階色階：灰階和金色，每一階都有實色和透明兩種。介面只用語意 token，語意 token 指向色階的某一階。',
    accent: '金色用在目前頁、聚焦和 hover，佔畫面約 5%，不填大面積，也不當一般的邊框。',
    gray: '灰階從帶暖色的黑到象牙白，頁面背景、卡片、邊框和文字都來自灰階。',
    alpha: '每一階都有透明版本（-a1 到 -a12）。透明色疊在背景上，在頁面和卡片上都保持一樣的對比，線和文字用透明色。',
    alphaCode: `var(--gray-a6);   /* --line */
var(--gray-a12);  /* --text-body */
var(--accent-a4); /* --ember-whisper：hover 的淡底 */`,
    semantic: '元件和頁面只用這一層。右邊兩欄是文字在頁面背景和卡片上的對比值，4.5 以上才能用在要閱讀的字。',
    backgrounds: '三層背景，越上層越亮：頁面、卡片、浮起的元素（選單、工具列）。',
    backgroundsCode: `.journal-page { background: var(--surface-0); }
.code-card { background: var(--surface-1); }
.dropdown-menu__list { background: var(--surface-2); }`,
    focus: 'hover 用 --ember-whisper 的淡底或 --ember-soft 的字。鍵盤聚焦框用 1px 的 --ember，文字欄位只顯示游標，不加聚焦框。',
    focusCode: `.journal-card:hover { color: var(--ember-soft); }
.cms-btn:focus-visible {
  outline: 1px solid var(--ember);
  outline-offset: 1px;
}`,
    spec: '卡片裡每個元素用的 token 和實際色值都從畫面量出來。',
  },
  spacing: {
    name: 'Spacing',
    lead: '間距刻度和三種節奏',
    toc: [
      ['scale', '刻度'],
      ['rhythm', '節奏'],
      ['spec', '實際使用'],
      ['rules', '原則'],
    ],
    scale: '8 階，以 4px 為基礎，只用刻度上的值。',
    rhythm: '三種節奏：元件內 4–12px、段落之間 24px、區塊之間 --section-gap。外面的間距永遠大於裡面的間距。',
    rhythmRows: [
      ['元件內', '--space-1 – --space-3', '4–12px', '按鈕內距、圖示和文字之間'],
      ['段落之間', '--space-6', '24px', '段落、卡片之間'],
      ['區塊之間', '--section-gap', '96–128px', '頁面的大區塊之間'],
    ],
    spec: '粉紅色的 I 是實際的間距，數字單位是 px。',
  },
  radius: {
    name: 'Radius',
    lead: '圓角刻度',
    toc: [
      ['scale', '刻度'],
      ['usage', '使用'],
    ],
    scale: '4 階，小控制項最小，卡片最大，膠囊和圓點用 full。',
    rows: [
      ['--radius-sm', '8px', '按鈕、輸入框、選單項目'],
      ['--radius-md', '12px', '選單、工具列'],
      ['--radius-lg', '16px', '卡片、示範框'],
      ['--radius-full', '999px', '膠囊按鈕、圓點'],
    ],
    code: `.code-card { border-radius: var(--radius-lg); }
.dropdown-menu__item { border-radius: var(--radius-sm); }`,
  },
  motion: {
    name: 'Motion',
    lead: 'Easing、時長和減少動態效果',
    toc: [
      ['easing', 'Easing'],
      ['duration', '時長'],
      ['reduced', '減少動態效果'],
      ['signature', '招牌效果'],
    ],
    easing: '一條 easing：--ease-touch，起步快，結尾慢慢停下。',
    easingCode: `transition: opacity 0.6s var(--ease-touch), transform 0.6s var(--ease-touch);`,
    durations: [
      ['hover', '0.3–0.4s', '顏色、底色的變化'],
      ['淡入', '0.6s', 'FadeIn 和頁面的進場'],
      ['依序淡入', '70ms', '一組項目之間的間隔'],
    ],
    durationNote: '位移只用 opacity 和 transform。',
    reduced: '每個效果都要支援 prefers-reduced-motion：直接顯示最終畫面，並停止 requestAnimationFrame。畫面外的效果也要停止計算。',
    reducedCode: `@media (prefers-reduced-motion: reduce) {
  .fade-in {
    opacity: 1;
    transform: none;
    transition: none;
  }
}`,
    signature: '每頁最多一個，它就是那一頁的記憶點。',
    signatureRows: [
      ['mountHeroFx', '首頁 Hero', '游標移入出現追蹤框和 ASCII，雙擊出現 glitch'],
      ['mountGlyphField', 'Journal 頁首', '暗淡的字元落下，游標附近變亮'],
      ['mountFallScene', 'About', '粒子人形隨捲動往下掉'],
      ['mountShatterImage', 'Journal 頁尾', '碎片從左到右拼成一張圖'],
    ],
  },
  breakpoints: {
    name: 'Breakpoints',
    lead: '版面切換的寬度',
    toc: [
      ['sizes', '寬度'],
      ['usage', '用法'],
    ],
    rows: [
      ['手機', '768px 以下', '一欄版面、手機選單的細節'],
      ['平板以下', '900px 以下', '導覽列收進選單、雙欄改成一欄'],
      ['最大寬度', '1920px 以上', '內容停止變寬，兩側只延伸背景'],
    ],
    usage: '用 max-width 寫，新程式碼只用 900px 和 768px。',
    code: `@media (max-width: 900px) {
  .journal-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .journal-card { padding: var(--space-4); }
}`,
  },
}
