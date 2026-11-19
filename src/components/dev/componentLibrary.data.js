// Component pages of /dev/component-library. Dev-only, Chinese only (internal page, not site copy).
// Page model, as in the Radix Themes docs:
//   summary   one sentence: what the component does
//   hero      the first example: a live demo (key in demos.jsx) and/or its code
//   api       API Reference, one entry per part (a component made of parts lists each part)
//   examples  one entry per prop or variant worth showing
//   keyboard  key → action, for interactive components
//   notes     behavior and accessibility facts that props do not show
// `family` groups related components in the sidebar (Card, Post). Write as reference docs:
// what the component does, no design history, no outside sites.

export const GROUPS = [
  {
    id: 'components',
    title: '元件',
    intro: '可以在多個地方使用的介面元件。',
    items: [
      // ── Card ──
      {
        id: 'code-card',
        family: 'Card',
        name: 'CodeCard',
        file: 'src/components/CodeCard.jsx',
        summary: '顯示一段程式碼，附語言標籤、檔名和複製按鈕。',
        hero: { demo: 'code', code: `<CodeCard lang="ts" filename="route.ts" code={source} />` },
        api: [
          {
            description: '以 figure 元素渲染。文章裡的 codeBlock 節點由 RichText 轉成 CodeCard。',
            props: [
              ['code', 'string', '—', '必填。程式碼原文，保留換行和縮排。'],
              ['lang', 'string', "'ts'", '語言。決定標籤文字和上色規則。'],
              ['filename', 'string', '—', '標題列的檔名。沒有時顯示語言。'],
            ],
          },
        ],
        examples: [
          {
            id: 'shell',
            title: 'Shell',
            description: 'lang 設成 bash，# 開頭的內容會顯示成註解。',
            demo: 'code-shell',
            code: `<CodeCard lang="bash" code={'# install and run\\nnpm install'} />`,
          },
          {
            id: 'no-filename',
            title: '沒有檔名',
            description: '不傳 filename 時，標題列顯示語言。',
            demo: 'code-plain',
            code: `<CodeCard lang="css" code={css} />`,
          },
        ],
        notes: [
          '上色支援類 C 語法（JS、TS、CSS、JSON）和 shell 的 # 註解。',
          '複製先用 Clipboard API，瀏覽器擋住時改用 execCommand。',
          '複製成功時，螢幕閱讀器讀出「已複製」。',
          '程式碼區可以用鍵盤聚焦，並橫向捲動。',
        ],
      },
      {
        id: 'image-card',
        family: 'Card',
        name: 'ImageCard',
        file: 'src/components/ImageCard.jsx',
        summary: '顯示一張圖片和選填的圖說。',
        hero: { demo: 'image', code: `<ImageCard src={src} alt="設定頁的截圖" caption="滿版" />` },
        api: [
          {
            description: '以 figure 元素渲染，圖說是 figcaption。',
            props: [
              ['src', 'string', '—', '必填。圖片網址或 import 的檔案。'],
              ['alt', 'string', '—', '必填。描述圖片內容。'],
              ['caption', 'string', '—', '圖說。'],
              ['frame', 'boolean', 'false', '縮小置中，四周留白。'],
              ['width / height', 'number', '—', '原始尺寸，載入前先保留空間。'],
            ],
          },
        ],
        examples: [
          {
            id: 'frame',
            title: 'Frame',
            description: '用 frame 顯示手機截圖或小圖：最寬 280px，置中，四周留白。',
            demo: 'image-frame',
            code: `<ImageCard src={src} alt="手機畫面" caption="frame" frame />`,
          },
          {
            id: 'size',
            title: '尺寸',
            description: '知道原始尺寸時傳入 width 和 height，圖片載入時版面不會位移。',
            code: `<ImageCard src={src} alt="設定頁的截圖" width={1600} height={1000} />`,
          },
        ],
        notes: ['圖片延遲載入（loading="lazy"）。', 'alt 不要寫「圖片」或「截圖的圖片」。描述圖裡的內容。'],
      },
      {
        id: 'slides-card',
        family: 'Card',
        name: 'SlidesCard',
        file: 'src/components/SlidesCard.jsx',
        summary: '一組可以左右切換的圖片，相鄰的圖從兩側露出一部分。',
        hero: {
          demo: 'slides',
          code: `<SlidesCard slides={[{ src, alt: '步驟一', caption: '打開設定' }, …]} />`,
        },
        api: [
          {
            description: '以 figure 元素渲染。文章裡的 slidesCard 節點由 RichText 轉成 SlidesCard。',
            props: [['slides', '{ src, alt, caption? }[]', '—', '必填。沒有 src 的項目不顯示。']],
          },
        ],
        examples: [],
        keyboard: [
          ['← / →', '圖片區聚焦時，切到上一張或下一張。'],
          ['Tab', '移到上一張和下一張按鈕。'],
        ],
        notes: [
          '可以用觸控滑動、觸控板或滑鼠拖曳切換。',
          '寬度 900px 以上時，比內文欄左右各寬 80px，兩側淡出。',
          '圖片比例固定 16:10，裁切置中。',
          '減少動態效果開啟時，切換不使用平滑捲動。',
        ],
      },
      {
        id: 'video-card',
        family: 'Card',
        name: 'VideoCard',
        file: 'src/components/VideoCard.jsx',
        summary: '播放一段影片，附播放、時間、進度、倍速和全螢幕控制。',
        hero: { demo: 'video', code: `<VideoCard src={clip} poster={poster} caption="拖曳排序的過程" />` },
        api: [
          {
            description: '以 figure 元素渲染。不會自動播放。',
            props: [
              ['src', 'string', '—', '必填。建議 mp4（H.264）。'],
              ['poster', 'string', '—', '播放前顯示的圖。'],
              ['caption', 'string', '—', '說明。'],
              ['loop', 'boolean', 'false', '播完重新播放。'],
            ],
          },
        ],
        examples: [
          {
            id: 'loop',
            title: 'Loop',
            description: '短的操作示範用 loop，播完自動重來。',
            demo: 'video-loop',
            code: `<VideoCard src={clip} caption="播完重新播放" loop />`,
          },
        ],
        notes: [
          '播放時，控制列只在游標移入或鍵盤聚焦時出現。觸控裝置上一直顯示。',
          '手機寬度不顯示總長度。',
          'iOS Safari 上，全螢幕作用在 video 元素本身。',
          '影片用 -movflags +faststart 輸出，才能邊下載邊播放。',
        ],
      },

      // ── DropdownMenu ──
      {
        id: 'dropdown-menu',
        name: 'DropdownMenu',
        file: 'src/components/DropdownMenu.jsx',
        summary: '從按鈕打開的一組動作或選項。',
        hero: { demo: 'menu-actions', code: `<DropdownMenu label="插入" trigger="＋ 插入" items={ACTIONS} onSelect={insert} />` },
        api: [
          {
            description: '按鈕加上 role="menu" 的清單。點清單外面會關閉。',
            props: [
              ['label', 'string', '—', '必填。按鈕和選單的無障礙名稱。'],
              ['trigger', 'node', '—', '必填。按鈕的內容。'],
              ['items', "({ value, label, icon?, kbd? } | 'divider')[]", '—', "必填。'divider' 是分隔線。"],
              ['value', 'string', '—', '有值時當作選擇器，目前的項目打勾。'],
              ['onSelect', '(value) => void', '—', '必填。'],
              ['triggerClassName', 'string', "'dropdown-menu__trigger'", '按鈕的 class。'],
              ['tip', 'string', '—', '工具列提示的文字。'],
            ],
          },
        ],
        examples: [
          {
            id: 'picker',
            title: '選擇器',
            description: '傳入 value，選單變成單選：項目是 menuitemradio，目前的項目打勾。',
            demo: 'menu-picker',
            code: `<DropdownMenu label="段落樣式" trigger={current} items={STYLES} value={style} onSelect={setStyle} />`,
          },
          {
            id: 'shortcuts',
            title: '快捷鍵和分隔線',
            description: '項目的 kbd 顯示在右側。用字串 divider 把項目分組。',
            code: `const STYLES = [
  { value: 'paragraph', label: '段落', kbd: '⌘⌥0' },
  { value: 'lead', label: '前言' },
  'divider',
  { value: 'h2', label: '小標題', kbd: '⌘⌥2' },
]`,
          },
          {
            id: 'trigger',
            title: '自訂按鈕',
            description: '用 triggerClassName 換掉按鈕樣式，例如編輯器工具列的圖示按鈕。',
            code: `<DropdownMenu label="插入" tip="插入" trigger={<PlusIcon />} items={INSERTS} triggerClassName="cms-ed-btn" onSelect={insert} />`,
          },
        ],
        keyboard: [
          ['Enter / Space / ↓', '按鈕聚焦時，打開選單。'],
          ['↑ / ↓', '移到上一個或下一個項目。'],
          ['Home / End', '移到第一個或最後一個項目。'],
          ['Enter', '選擇目前的項目。'],
          ['Esc', '關閉選單，焦點回到按鈕。'],
          ['Tab', '關閉選單。'],
        ],
        notes: ['打開時，焦點移到目前的項目。', '按下項目不會清掉編輯器的選取範圍。', '不要用原生 <select>：它打開的清單由作業系統繪製，不跟網站的深色樣式。'],
      },


      // ── Editor ──
      {
        id: 'editor',
        name: 'Editor',
        file: 'src/components/Editor.jsx',
        summary: '文章內文的所見即所得編輯器，輸出 RichText 使用的文件。',
        hero: { demo: 'editor', code: `<Editor key={slug} doc={getDoc(body)} onChange={setDoc} upload={upload} />` },
        api: [
          {
            description: '工具列：插入、段落樣式、粗體、斜體、底線、連結、引言、行內程式碼、清單。',
            props: [
              ['doc', 'object', '—', '必填。只在掛載時讀取。換文章時用新的 key 重新掛載。'],
              ['onChange', '(doc) => void', '—', '必填。每次修改都傳出新的文件。'],
              ['upload', '(file) => Promise<string>', '—', '必填。上傳圖片，回傳圖片網址。'],
            ],
          },
        ],
        examples: [
          {
            id: 'markdown',
            title: 'Markdown 輸入',
            description: '在段落開頭輸入 Markdown 符號，會自動轉成對應的區塊。',
            code: `## 小標題
> 引言
- 清單
1. 編號清單
\`\`\` 程式碼`,
          },
        ],
        keyboard: [
          ['⌘ / Ctrl + B', '粗體'],
          ['⌘ / Ctrl + I', '斜體'],
          ['⌘ / Ctrl + U', '底線'],
          ['⌘ / Ctrl + Z', '復原'],
          ['⌘ / Ctrl + S', '儲存（由 AdminProvider 處理）'],
        ],
        notes: [
          '「＋」插入程式碼、圖片、輪播、影片和分隔線。Card 的設定直接在 Card 上填。',
          '工具列提示第一次等 400ms 才出現。之後 300ms 內移到別的按鈕，提示立刻出現並滑過去。',
          '新增節點時，同時修改 Editor.jsx、RichText 和 src/lib/richText.js。',
        ],
      },

      // ── FadeIn ──
      {
        id: 'fade-in',
        name: 'FadeIn',
        file: 'src/components/FadeIn.jsx',
        summary: '元素露出 15% 時淡入，並從下方移入。',
        hero: { demo: 'fade', code: `<FadeIn className="journal-card">…</FadeIn>` },
        api: [
          {
            description: '用 useReveal（IntersectionObserver）。顯示後加上 is-visible，位移和時長寫在各頁的 CSS。',
            props: [
              ['as', 'string | Component', "'div'", '要渲染的元素。'],
              ['className', 'string', "''", '附加的 class。'],
              ['children', 'node', '—', '內容。'],
              ['…rest', '—', '—', '其他 props 傳給元素。'],
            ],
          },
        ],
        examples: [
          {
            id: 'as-link',
            title: '作為連結',
            description: '用 as 渲染成 Link，其他 props（例如 to）會傳給它。',
            code: '<FadeIn as={Link} to={`/journal/${slug}`} className="journal-card">…</FadeIn>',
          },
        ],
        notes: ['首頁位移 20px，Journal 位移 24px。', '減少動態效果開啟時直接顯示。', '包住整個區塊，不要每一行各包一次。'],
      },

      // ── RichText ──
      {
        id: 'rich-text',
        name: 'RichText',
        file: 'src/components/RichText.jsx',
        summary: '把文章內文（Tiptap 文件）顯示成網頁。',
        hero: {
          demo: 'postdoc',
          code: `<div className="journal-post__body">
  <RichText doc={getDoc(journal.content[lang][slug])} />
</div>`,
        },
        api: [
          {
            description: '每個最上層區塊各自淡入。放在 .journal-post__body 裡，才有文章的字級和間距。',
            props: [['doc', '{ type: "doc", content }', '—', '必填。用 getDoc(body) 取得，舊格式會自動轉換。']],
          },
        ],
        examples: [
          {
            id: 'nodes',
            title: '區塊',
            description: '段落、前言、小標題、次標題、引言（含出處）、清單、分隔線，以及 CodeCard、ImageCard、SlidesCard、VideoCard。',
            code: `blocksToDoc([
  { type: 'lead', text: '前言' },
  { type: 'h2', text: '小標題' },
  { type: 'p', text: '段落' },
  { type: 'quote', text: '引言', attr: '出處' },
])`,
          },
          {
            id: 'marks',
            title: '行內格式',
            description: '粗體、斜體、底線、刪除線、行內程式碼和連結。示範在 Typography 的「行內格式」。',
            code: `{ type: 'text', text: '保持安靜', marks: [{ type: 'bold' }] }`,
          },
        ],
        notes: ['連結只接受 http(s)、mailto、tel 和站內網址（safeHref）。外部連結在新分頁開啟。'],
      },

      // ── SecretInput ──
      {
        id: 'secret-input',
        name: 'SecretInput',
        file: 'src/components/SecretInput.jsx',
        summary: '輸入固定長度的密碼或驗證碼。一格一個字元，只顯示圓點。',
        hero: { demo: 'secret', code: `<SecretInput value={code} onChange={setCode} onComplete={verify} label="密碼" />` },
        api: [
          {
            description: '一排格子，上面蓋著一個實際的 input。',
            props: [
              ['value', 'string', '—', '必填。目前的內容。'],
              ['onChange', '(value) => void', '—', '必填。內容改變時呼叫。'],
              ['onComplete', '(value) => void', '—', '最後一格填滿時呼叫。'],
              ['length', 'number', '6', '格數。'],
              ['numeric', 'boolean', 'true', '只接受數字，手機顯示數字鍵盤。'],
              ['invalid', 'boolean', 'false', '格子搖動一次並變成錯誤色。'],
              ['disabled', 'boolean', 'false', '停用輸入。'],
              ['label', 'string', '—', '必填。無障礙名稱。'],
              ['describedBy', 'string', '—', '錯誤訊息元素的 id。'],
              ['ref', 'Ref<HTMLInputElement>', '—', '指向實際的 input，用來聚焦。'],
            ],
          },
        ],
        examples: [
          {
            id: 'invalid',
            title: 'Invalid',
            description: '驗證失敗時設定 invalid，並清空 value。下一次輸入時取消 invalid。',
            demo: 'secret-invalid',
            code: `<SecretInput value={code} onChange={change} invalid={wrong} label="密碼" />`,
          },
          {
            id: 'length',
            title: 'Length',
            description: '用 length 設定格數。',
            demo: 'secret-length',
            code: `<SecretInput length={4} value={pin} onChange={setPin} label="PIN" />`,
          },
          {
            id: 'text',
            title: '英數字',
            description: '設定 numeric={false}，接受字母和數字。',
            code: `<SecretInput numeric={false} length={8} value={code} onChange={setCode} label="邀請碼" />`,
          },
        ],
        notes: [
          '打字、貼上和手機自動填入驗證碼（autocomplete="one-time-code"）都能用。',
          '只顯示圓點，不顯示字元。目前要輸入的格子有金色框和閃爍的游標。',
          '減少動態效果開啟時，invalid 不搖動。',
        ],
      },

      // ── SidePanel ──
      {
        id: 'side-panel',
        name: 'SidePanel',
        file: 'src/components/SidePanel.jsx',
        summary: '從右側滑出的編輯面板。每列左邊是欄位名稱，右邊是值。',
        hero: {
          code: `<SidePanel title="編輯文章" dirty={dirty} saving={saving} onSave={save} onLogout={logout}>
  <PanelSection title="文章">
    <FormRow label="標題">
      <TextInput value={title} onChange={setTitle} />
    </FormRow>
  </PanelSection>
</SidePanel>`,
        },
        api: [
          {
            part: 'SidePanel',
            description: '用 portal 放在 body 底下。寬度 1100px 以上時，頁面往左移出面板的寬度。',
            props: [
              ['title / subtitle', 'string', '—', '面板標題和副標。'],
              ['dirty / saving / error', 'boolean / boolean / string', '—', '儲存狀態：尚未儲存、儲存中、已儲存、儲存失敗。'],
              ['onSave / onLogout', '() => void', '—', '必填。儲存按鈕只在 dirty 時可以按。'],
              ['children', 'node', '—', 'PanelSection 和 FormRow。'],
            ],
          },
          {
            part: 'PanelSection',
            description: '一組欄位，有標題和選填的動作按鈕。',
            props: [
              ['title', 'string', '—', '區段標題。'],
              ['action', 'node', '—', '標題右側的按鈕。'],
            ],
          },
          {
            part: 'FormRow',
            description: '一列：左邊欄位名稱，右邊值。',
            props: [
              ['label', 'string', '—', '欄位名稱。'],
              ['hint', 'string', '—', '說明，聚焦時出現。'],
              ['htmlFor', 'string', '—', '對應欄位的 id。'],
            ],
          },
          {
            part: 'TextInput / TextArea',
            description: '看起來像一般文字的輸入欄位，只顯示游標，沒有聚焦框。TextArea 隨內容長高。',
            props: [
              ['value', 'string', '—', '必填。'],
              ['onChange', '(value) => void', '—', '必填。'],
              ['mono', 'boolean', 'false', '只有 TextArea：使用等寬字。'],
            ],
          },
          {
            part: 'Switch',
            description: '開關。',
            props: [
              ['checked', 'boolean', '—', '必填。'],
              ['onChange', '(checked) => void', '—', '必填。'],
              ['label', 'string', '—', '無障礙名稱。'],
            ],
          },
        ],
        examples: [],
        notes: ['收合後，右下角出現「編輯面板」按鈕。有未儲存的修改時，按鈕帶一個圓點。', '面板的介面文字只寫中文。'],
      },

      // ── SiteNav ──
      {
        id: 'site-nav',
        name: 'SiteNav',
        file: 'src/components/SiteNav.jsx',
        summary: '全站的頂部導覽：logo、導覽連結和語言切換。手機寬度改成全螢幕選單。',
        hero: { code: `<SiteNav variant="case" highlightWorkSection />` },
        api: [
          {
            part: 'SiteNav',
            description: '固定在頁面頂端。往下捲動 80px 後加上半透明底色。App.jsx 依路徑放置，頁面不用再放。',
            props: [
              ['variant', "'default' | 'case'", "'default'", '案例頁用 case，一開始就有底色。'],
              ['highlightJournal', 'boolean', 'false', '把 Journal 標成目前頁。'],
              ['highlightWorkSection', 'boolean', 'false', '把 Work 標成目前頁。'],
            ],
          },
          {
            part: 'SiteNavLinks',
            description: '導覽連結清單。桌面導覽列和手機選單共用同一份。新增或刪除導覽項目時改這裡。',
            props: [
              ['variant', "'desktop' | 'overlay'", "'desktop'", '手機選單用 overlay。'],
              ['onNavigate', '() => void', '—', '點連結後呼叫，用來關閉選單。'],
              ['highlightJournal / highlightWorkSection', 'boolean', 'false', '同 SiteNav。'],
            ],
          },
          {
            part: 'NavToggle',
            description: '寬度 900px 以下的選單按鈕，打開 NavOverlay。',
            props: [
              ['onToggle', '() => void', '—', '必填。按下時呼叫。'],
              ['ref', 'Ref<HTMLButtonElement>', '—', '選單關閉後，焦點回到這個按鈕。'],
            ],
          },
          {
            part: 'NavOverlay',
            description: '全螢幕的導覽選單，以對話框渲染。',
            props: [
              ['open', 'boolean', '—', '必填。是否打開。'],
              ['onClose', '() => void', '—', '必填。關閉時呼叫。'],
              ['id', 'string', "'nav-overlay'", '選單元素的 id。'],
            ],
          },
        ],
        examples: [
          {
            id: 'case',
            title: 'Case',
            description: '案例頁用 variant="case"，並把 Work 標成目前頁。',
            code: `<SiteNav variant="case" highlightWorkSection />`,
          },
        ],
        keyboard: [
          ['Enter / Space', 'NavToggle 聚焦時，打開選單。'],
          ['Esc', '關閉選單，焦點回到 NavToggle。'],
          ['Tab', '在選單的連結之間移動。'],
        ],
        notes: [
          '目前頁的連結加上 is-active，顯示為金色。路徑相符時，NavLink 另外加上 aria-current="page"。',
          '選單打開時，焦點移到「關閉」按鈕。',
          'NavToggle 只在選單關閉時出現，所以用 aria-haspopup="dialog"，不用 aria-expanded。',
          '語言按鈕的 aria-label 以畫面上的字（EN／中文）開頭，語音控制可以直接說出來。',
          '語言按鈕顯示要切換過去的語言：中文時顯示 EN，英文時顯示 TW。兩個都是等寬字，切換時導覽列的高度不變。',
          '按下語言按鈕，水波從點擊的位置往外擴散，0.8 秒內擴散到畫面對角，波碰到畫面邊緣不會反彈，整頁文字跟著波紋扭曲，1 秒內結束（waterRipple：波動方程式、SVG feDisplacementMap、Canvas 2D 打光）。語言在 0.3 秒時切換。動畫中再按一次，會重新計算 1 秒。用鍵盤按時，從按鈕中心開始。減少動態效果開啟時沒有水波，語言直接切換。',
          '/checkin 不顯示導覽列。',
        ],
      },
    ],
  },
  {
    id: 'effects',
    title: '效果',
    intro: 'Canvas 視覺效果。常駐的效果每頁最多一個，寫成 mountXxx(canvas, opts)，回傳 cleanup。按一下才播一次的效果寫成 playXxx(…)，自己建立畫面、播完自己移除。',
    items: [
      {
        id: 'shatter-image',
        name: 'mountShatterImage',
        file: 'src/lib/shatterImage.js',
        summary: '碎片從左到右拼成一張圖，然後靜止。',
        hero: { demo: 'shatter', code: `useEffect(() => mountShatterImage(canvas.current, { src, crop: [0, 0, 1280, 470] }), [])` },
        api: [
          {
            description: '圖的亮度轉成透明度，所以要用黑底、亮線條的圖。',
            props: [
              ['canvas', 'HTMLCanvasElement', '—', '必填。尺寸由 CSS 決定。'],
              ['opts.src', 'string', '—', '必填。圖片網址。'],
              ['opts.crop', '[x, y, w, h]', '—', '必填。要使用的原圖範圍，單位是原圖像素。'],
              ['opts.onPlay', '() => void', '—', '開始拼圖時呼叫。'],
            ],
          },
        ],
        examples: [],
        notes: ['露出 35% 時播放一次。', '減少動態效果開啟時，直接顯示完成的圖。', 'devicePixelRatio 上限 1.5。'],
      },
      {
        id: 'glyph-field',
        name: 'mountGlyphField',
        file: 'src/lib/glyphField.js',
        summary: '持續落下的暗淡字元。游標附近的字元變亮。',
        hero: { demo: 'glyph', code: `useEffect(() => mountGlyphField(glyphs.current), [])` },
        api: [
          {
            description: '顏色讀取 canvas 的 CSS color 和 --glyph-glow。搭配遮罩淡出邊緣。',
            props: [['canvas', 'HTMLCanvasElement', '—', '必填。CSS 尺寸 1200 × 400。']],
          },
        ],
        examples: [],
        notes: ['離開畫面時停止繪製。', '減少動態效果開啟時不啟動。'],
      },
      {
        id: 'hero-fx',
        name: 'mountHeroFx',
        file: 'src/lib/heroFx.js',
        summary: '首頁 Hero 的互動：游標移到人物上出現追蹤框和 ASCII，雙擊出現 glitch。',
        hero: { code: `useEffect(() => mountHeroFx({ root, bg, cut, alt, canvas }), [])` },
        api: [
          {
            description: '依賴 src/assets/hero/ 的圖片尺寸和焦點位置，只用在首頁。',
            props: [['els', '{ root, bg, cut, alt, canvas }', '—', '必填。Hero 的根元素、三張圖和 canvas。']],
          },
        ],
        examples: [],
        notes: ['MAX_W 要和 --page-max 一致。', '更換 Hero 圖時，同時修改 IW、IH 和焦點座標。'],
      },
      {
        id: 'fall-scene',
        name: 'mountFallScene',
        file: 'src/lib/fallScene.js',
        summary: '粒子組成的人形隨捲動往下掉，穿過刻字的石板。',
        hero: { code: `useEffect(() => mountFallScene({ canvas, figure, sections, acts, progressDot, onAct }), [])` },
        api: [
          {
            description: '接管整頁的捲動（Lenis），只用在 About 頁。',
            props: [['opts', '{ canvas, figure, sections, acts, progressDot, onAct }', '—', '必填。場景元素和每一幕的資料。']],
          },
        ],
        examples: [],
        notes: ['cleanup 時一起銷毀 Lenis。'],
      },
      {
        id: 'water-ripple',
        name: 'playWaterRipple',
        file: 'src/lib/waterRipple.js',
        summary: '在一個點滴下水滴，水波 0.8 秒內擴散到畫面對角，整頁文字跟著扭曲，1 秒內結束。',
        hero: { demo: 'ripple', code: `playWaterRipple(e.clientX, e.clientY, toggleLang)` },
        api: [
          {
            description: '一次性的效果：自己建立 Canvas 和 SVG 濾鏡，播完全部移除。動畫中再呼叫，會加一顆水滴並重新計算 1 秒。',
            props: [
              ['x', 'number', '—', '必填。水滴位置，視窗座標。'],
              ['y', 'number', '—', '必填。'],
              ['onSwap', '() => void', '—', '0.3 秒時呼叫一次，用來在波紋中換內容。減少動態效果開啟時立刻呼叫。'],
            ],
          },
        ],
        examples: [],
        notes: [
          '波動方程式在 CPU 上計算，每秒固定 360 步，和螢幕更新率無關。',
          '扭曲用 SVG feDisplacementMap，掛在 <html> 上，因為只有根元素的 filter 不會改變 position: fixed。',
          '畫面外有一圈吸收帶，波碰到邊緣不反彈。離邊緣 40px 內扭曲減到 0，避免露出白底。',
          '用在 SiteNav 的語言按鈕。',
          '待修：Safari 和手機尚未測試。',
        ],
      },
    ],
  },
  {
    id: 'edit-mode',
    title: '編輯模式',
    intro: '在網站前台編輯 Journal 的元件。只有登入後看得到。',
    items: [
      {
        id: 'admin-provider',
        name: 'AdminProvider',
        file: 'src/context/AdminProvider.jsx',
        summary: '管理登入狀態、編輯模式和 Ctrl/⌘+S 快捷鍵。',
        hero: {
          code: `const admin = useAdmin()
useAdminSave(admin.editing ? save : null)`,
        },
        api: [
          {
            part: 'AdminProvider',
            description: '包在 App.jsx 最外層，並放出密碼框（OtpGate）。',
            props: [['children', 'node', '—', '整個網站。']],
          },
          {
            part: 'useAdmin()',
            description: '讀取和改變編輯狀態。',
            props: [
              ['editing', 'boolean', 'false', '是否在編輯模式。html 會加上 is-cms-editing。'],
              ['setEditing', '(on: boolean) => void', '—', '開關編輯模式。'],
              ['getToken', '() => string | null', '—', '儲存和上傳時使用的憑證。'],
              ['openGate / logout', '() => void', '—', '打開密碼框／登出。登出同時結束編輯。'],
              ['panelOpen / setPanelOpen', 'boolean / (open) => void', 'true', '編輯面板是否打開。'],
            ],
          },
          {
            part: 'useAdminSave(fn)',
            description: '編輯中按 Ctrl/⌘+S 時呼叫 fn。傳 null 取消。',
            props: [['fn', '(() => void) | null', '—', '儲存函式。']],
          },
        ],
        examples: [],
        keyboard: [
          ['Ctrl / ⌘ + S', '沒登入：打開密碼框。登入後：進入編輯模式。編輯中：儲存。'],
        ],
        notes: [
          '密碼是 Cloudflare Pages 的 ADMIN_SECRET，6 位數字。',
          '登入狀態存在 sessionStorage，關閉分頁後要重新輸入。',
          'Ctrl/⌘+S 會取代瀏覽器的「另存網頁」。',
        ],
      },
      {
        id: 'otp-gate',
        name: 'OtpGate',
        file: 'src/components/admin/OtpGate.jsx',
        summary: '全螢幕的密碼框，輸入滿 6 碼自動驗證。',
        hero: { demo: 'otp', code: `<OtpGate open={open} onVerify={login} onUnlocked={enter} onClose={close} />` },
        api: [
          {
            description: '模糊的背景和一個 SecretInput。驗證時輸入框換成「驗證中」，成功後顯示「已解鎖」。',
            props: [
              ['open', 'boolean', '—', '必填。'],
              ['onVerify', '(code) => Promise<boolean>', '—', '必填。回傳密碼是否正確。'],
              ['onUnlocked', '() => void', '—', '必填。顯示「已解鎖」後呼叫。'],
              ['onClose', '() => void', '—', '必填。按 Esc 或點背景時呼叫。'],
            ],
          },
        ],
        examples: [],
        keyboard: [['Esc', '關閉密碼框。']],
        notes: ['密碼錯誤時，格子搖動並清空，焦點留在輸入框，螢幕閱讀器讀出錯誤訊息。', '其他需要驗證碼的地方，直接用 SecretInput。'],
      },
      {
        id: 'journal-edit-panel',
        name: 'JournalEditPanel',
        file: 'src/components/journal/JournalEditPanel.jsx',
        summary: 'Journal 的編輯面板：文章頁編輯欄位和內文，列表頁新增、排序和刪除文章。',
        hero: { code: `<JournalPostEditPanel slug={slug} />
<JournalListEditPanel />` },
        api: [
          {
            part: 'JournalPostEditPanel',
            description: '放在 JournalPostPage。內文用 Editor 編輯。',
            props: [['slug', 'string', '—', '必填。目前文章的網址代稱。']],
          },
          {
            part: 'JournalListEditPanel',
            description: '放在 JournalListPage。沒有 props。',
            props: [],
          },
        ],
        examples: [],
        keyboard: [['↑ / ↓', '文章列表的 ⠿ 聚焦時，往上或往下移一格。']],
        notes: [
          '資料存在 R2 data.json 的 journal。src/data/journal.js 只是 R2 沒有資料時的預設值。',
          '日期、分類、閱讀時間、排序、新增和刪除套用到中英文。標題、摘要和內文只改目前的語言。',
          '圖片上傳上限 1MB（JPG、PNG、WEBP），存在 R2 的 images/。影片只能填網址。',
          '有未儲存的修改時，登出前會先確認。',
        ],
      },
    ],
  },
]
