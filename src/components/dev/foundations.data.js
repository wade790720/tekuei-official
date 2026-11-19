// Brand foundations shown at the top of /dev/component-library: colour, type, spacing.
// Values live in src/styles/tokens.css; this file only says what each token is for.
// Cross-checked against jakub.kr, interfaces.dev and promptfolio-dark.framer.website (measured 2026-11-19).

export const COLOR_GROUPS = [
  {
    title: '表面',
    note: '三層深淺，越上層越亮。',
    swatches: [
      ['--surface-0', '頁面背景'],
      ['--surface-1', '卡片、面板、區塊'],
      ['--surface-2', '浮起的元素：選單、工具列、浮層'],
    ],
  },
  {
    title: '線',
    note: '分隔線和邊框用中性的象牙白，不用金色。金色的線只留給目前頁、聚焦和 hover。',
    swatches: [
      ['--line', '分隔線、格線、卡片內的細框'],
      ['--line-strong', '輸入框、按鈕的邊框、需要看得到的分隔'],
    ],
  },
  {
    title: '文字',
    note: '四階：標題、內文、說明、輔助。faint 只用在裝飾。右邊是在頁面背景和卡片上的對比值。',
    text: true,
    swatches: [
      ['--text-primary', '標題、最先要讀的字'],
      ['--text-body', '內文段落'],
      ['--text-secondary', '說明、圖說'],
      ['--text-tertiary', '日期、提示、meta。仍要達到 4.5:1'],
      ['--text-faint', '只當裝飾（字元雨、浮水印），不可用在要讀的字'],
    ],
  },
  {
    title: '強調',
    note: '金色只佔畫面約 5%，只用在三個地方：目前頁、聚焦、hover。不要填大面積，也不要當一般的邊框。',
    swatches: [
      ['--ember', '目前頁、強調的標籤'],
      ['--ember-soft', 'hover、光暈、未儲存的提示'],
      ['--ember-line', '聚焦框、目前頁的底線'],
      ['--ember-whisper', 'hover 的淡底'],
    ],
  },
  {
    title: '狀態與程式碼',
    note: '錯誤只用一個顏色。程式碼顏色只用在程式碼卡。',
    text: true,
    swatches: [
      ['--danger', '錯誤訊息、刪除'],
      ['--code-keyword', '程式碼：關鍵字'],
      ['--code-fn', '程式碼：函式'],
      ['--code-string', '程式碼：字串'],
      ['--code-number', '程式碼：數字'],
      ['--code-comment', '程式碼：註解'],
    ],
  },
]

// The type scale, smallest last. `family` and `tracking` mark the steps that change font or letter spacing.
export const TYPE_STEPS = [
  { name: 'Display', token: '--type-display', use: '每頁最多一個：Journal、About 的大標', sample: 'Journal', tracking: true },
  { name: 'H1', token: '--type-h1', use: '文章標題', sample: '留白的建築' },
  { name: 'H2', token: '--type-h2', use: '文章裡的小標題', sample: '為什麼高級品牌都敢留白' },
  { name: 'H3', token: '--type-h3', use: '次標題', sample: '數位時代的「間」' },
  { name: 'Lead', token: '--type-lead', use: '文章開頭的前言', sample: '留白不是懶惰，是對觀者的尊重。' },
  {
    name: 'Body',
    token: '--type-body',
    use: '內文。中文用 1.9 行高',
    sample: '在 TEKUEI 的設計哲學裡，「間」從不是裝飾性的空白。It is a pause with intent.',
  },
  { name: 'Small', token: '--type-small', use: '介面文字、次要說明', sample: '顯示在列表和首頁。' },
  { name: 'Caption', token: '--type-caption', use: '圖說、次要的 meta', sample: '圖片來源：作者拍攝' },
  {
    name: 'Label',
    token: '--type-label',
    use: '標籤、日期、數值。等寬字、大寫',
    sample: '2026.11.19 · 6 min',
    family: '--font-label',
    tracking: true,
    upper: true,
  },
  { name: 'Mono', token: '--type-mono', use: '程式碼、快捷鍵', sample: 'const x = 1 · ⌘S', family: '--font-mono' },
]

// Copy for the Typography page, one entry per section.
export const TYPE_DOC = {
  base: {
    lead: '文章的標題和內文由 RichText 畫出。字級、行高、顏色都來自 token，寫文章時不用另外設定。',
    blocks: [
      { type: 'h2', text: '留白是一種節奏' },
      { type: 'p', text: '版面安靜，讀者才聽得見內容。字級和行高成對使用，一行中文約 35–40 字。' },
    ],
  },
  formatting: {
    lead: '行內格式是 Tiptap 的 mark：粗體、斜體、行內程式碼、連結。粗體不會變粗，只換成主要文字的顏色。',
    doc: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '最重要的是' },
            { type: 'text', text: '保持安靜', marks: [{ type: 'bold' }] },
            { type: 'text', text: '，再留' },
            { type: 'text', text: '一個', marks: [{ type: 'italic' }] },
            { type: 'text', text: '記憶點。效果寫成 ' },
            { type: 'text', text: 'mountGlyphField()', marks: [{ type: 'code' }] },
            { type: 'text', text: '，延伸閱讀在 ' },
            { type: 'text', text: 'Journal', marks: [{ type: 'link', attrs: { href: '/journal' } }] },
            { type: 'text', text: '。' },
          ],
        },
      ],
    },
    code: `<p>
  最重要的是<strong>保持安靜</strong>，再留<em>一個</em>記憶點。
  效果寫成 <code>mountGlyphField()</code>，延伸閱讀在 <a href="/journal">Journal</a>。
</p>`,
  },
  scale: '一套 10 階的字級，中英文共用。每一階都有字級和行高，大標和標籤另有字距，三者成組使用。點或滑過上面的 Aa 換一階。',
  weight: {
    lead: '只有兩種字重。思源宋體只載入 200/300/400，Instrument Serif 只有 400，更粗會變成瀏覽器合成的假粗體。',
    rows: [
      ['Light', '--weight-light', '大標：Display、H1'],
      ['Regular', '--weight-regular', '內文、介面、其他全部'],
    ],
  },
  family: {
    lead: '兩個字型 token。Instrument Serif 沒有中文字，中文自動改用思源宋體。Instrument Serif 只用在 18px 以上。',
    rows: [
      ['內文、標題', '--font-serif', 'The quiet page 安靜的版面'],
      ['標籤、日期、數值', '--font-label', '2026.11.19 · CASE 01'],
      ['程式碼', '--font-mono', 'const gap = 24'],
    ],
  },
  spec: '標題的實際大小、基線和 x-height，加上每段文字的字型、字級 / 行高、字重。數值從畫面量出來。',
}

export const TYPE_RULES = [
  '字重只有兩種：內文和介面 400，大標 300。不要用 400 以上，思源宋體只載入 200/300/400，更粗會變成瀏覽器合成的假粗體。',
  '層級靠「字級＋文字階」，不靠字重。',
  '內文 17px。需要閱讀的字至少 12px。',
  'Instrument Serif 只用在 18px 以上。更小的英文細節會糊，改用等寬的標籤字。',
  '字距只有三種：大標 -0.02em、標籤 0.1em、其他全部 0。品牌字（T E K U E I）例外。',
  '標籤、日期、數值用 --font-label（等寬）、大寫、11–12px、字距 0.1em。',
  '中文行高 1.9。方塊字沒有上下伸部，需要比英文更多的行距。',
  '一行中文 35–40 字，約 640–720px。',
]

export const SPACE_SCALE = [
  ['--space-0-5', '圖示和它的小標記之間'],
  ['--space-1', '元件內部：圖示和文字'],
  ['--space-2', '相關的元素：標籤和欄位、同一組按鈕'],
  ['--space-3', '按鈕和輸入框的左右內距'],
  ['--space-4', '不相關的元素、卡片內距'],
  ['--space-5', '捲動後的導覽列上下內距、小卡片之間'],
  ['--space-6', '段落到段落'],
  ['--space-8', '一個區塊裡的大塊之間、圖片上下'],
  ['--space-10', '表單卡片的內距、區塊標題到內容'],
  ['--space-12', '一組一組的區塊之間'],
  ['--space-16', '文章小標題的上方'],
  ['--space-24', '頁面大段落之間（手機）'],
  ['--space-32', '頁面大段落之間（桌面）'],
]

export const SPACE_RULES = [
  '三種節奏就夠：元件內 4–12px、段落之間 24px、區塊之間 --section-gap（96–128px，跟著螢幕寬度變）。',
  '外面的間距永遠大於裡面的間距。越往外，間距越大，關係才看得出來。',
  '全部用刻度上的值。不在刻度上的數字（28、36、52）改成最近的刻度。',
  '文章小標題的上方約是下方的 3 倍，讓標題靠近它帶領的內容。',
  '圓角：小控制項 8px、卡片 12–16px、膠囊 999px。',
]

// Measured on the three reference sites. The TEKUEI column is not stored here:
// Resources reads it live from tokens.css and the journal styles, keyed by `key`.
export const REFERENCE_TABLE = {
  head: ['', 'jakub.kr', 'interfaces.dev', 'Promptfolio', 'TEKUEI'],
  rows: [
    { key: 'background', label: '底色', refs: ['#fcfcfc（淺色）', '#101010', '#141414'] },
    { key: 'body', label: '內文', refs: ['17 / 1.63', '18 / 1.56', '14 / 1.57'] },
    { key: 'h2', label: '小標題', refs: ['17、字重 550', '24 / 1.33、-0.3px', '24 / 1.25'] },
    { key: 'display', label: '大標', refs: ['—', '—', '72 / 1.06、-0.03em'] },
    { key: 'tiers', label: '文字階', refs: ['2 階', '4 階', '2 階'] },
    { key: 'space', label: '間距', refs: ['4 · 8 · 16 · 128', '4 · 8 · 12 · 16 · 32 · 128', '4 · 8 · 16 · 24 · 48 · 96'] },
    { key: 'measure', label: '內文欄寬', refs: ['644px', '720px', '525px'] },
  ],
}

// Sample card for the annotated spec views. Demo copy only, not a real post.
export const SPEC_SAMPLE = {
  section: 'Journal',
  meta: '2026.11.19 · 6 min',
  title: 'Notes on Restraint：留白的工程',
  lead: '安靜的版面，配一個精準的記憶點。',
  body: '每一個間距都在刻度上，每一個顏色都有用途。標註直接量自這張卡片，改了 CSS，數字就跟著變。',
  actions: ['閱讀全文', '分享'],
  captions: {
    spacing: '粉紅色的 I 量出每個間距，數字單位是 px。卡片內距 32、段落之間 16–24、按鈕內距 12、按鈕之間 8。',
    typography: '選取框是標題的實際大小。兩條線是基線和 x-height。右邊是每段文字的字型、字級 / 行高、字重。',
    color: '右邊是每個元素用的 token 和實際色值。邊框和分隔線用中性的 --line，金色只留給強調。',
  },
}

