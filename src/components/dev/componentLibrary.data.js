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
    intro: '可以在多個地方使用的介面元件',
    items: [
      // ── Card ──
      {
        id: 'card',
        family: 'Card',
        name: 'Card',
        file: 'src/components/Card.jsx',
        summary: '卡片的底：炭灰底色、16px 圓角、1px 象牙白光環，不用邊框',
        hero: { demo: 'card', code: '<Card className="code-card">…</Card>' },
        api: [
          {
            description: 'CodeCard、ImageCard、VideoCard、SlidesCard 都用它當外框。內距和內容由使用的元件決定',
            props: [
              ['as', 'string | Component', "'div'", '要渲染的元素，例如 figure'],
              ['className', 'string', "''", '附加的 class'],
              ['children', 'node', '—', '內容'],
              ['…rest', '—', '—', '其他 props 傳給元素，包括 ref'],
            ],
          },
        ],
        examples: [],
        notes: ['overflow 是 hidden，圖片和影片會被裁成圓角。', '光環寫在 --card-ring，要加陰影時接在它後面。'],
      },

      // ── Button ──
      {
        id: 'button',
        name: 'Button',
        file: 'src/components/Button.jsx',
        summary: '按鈕，有實心、透明、圖示、浮在圖上四種',
        hero: { demo: 'button', code: '<Button onClick={save}>儲存</Button>' },
        api: [
          {
            props: [
              ['variant', "'solid' | 'ghost' | 'icon' | 'overlay'", "'solid'", 'solid 是主要動作，ghost 是次要動作，icon 是放一個圖示的 32px 方塊，overlay 是放在圖片或影片上的 32px 圓鈕'],
              ['as', 'string | Component', "'button'", "要渲染的元素。包住檔案欄位時用 'label'，點整顆按鈕就能選檔案"],
              ['className', 'string', "''", '附加的 class'],
              ['…rest', '—', '—', '其他 props 傳給元素'],
            ],
          },
        ],
        examples: [
          {
            id: 'upload',
            title: '選擇檔案',
            description: "用 as='label' 包住隱藏的 input，點按鈕就打開檔案選擇",
            code: '<Button as="label" variant="ghost">選擇檔案<input type="file" hidden onChange={pick} /></Button>',
          },
        ],
        notes: [
          '渲染成 button 時，type 預設是 button，不會送出表單。',
          'disabled 時底色變暗，不能點。',
          'icon 按鈕沒有文字，要加 aria-label。aria-pressed 為 true 時底色變亮。',
          'overlay 按鈕是半透明深底加模糊，放在任何圖片上都看得清楚，一樣要加 aria-label。',
          '按下時縮成 0.96 倍，減少動態效果開啟時不縮。',
        ],
      },

      // ── Switch ──
      {
        id: 'switch',
        name: 'Switch',
        file: 'src/components/Switch.jsx',
        summary: '開和關的切換，開啟時是金色',
        hero: { demo: 'switch', code: '<Switch checked={loop} onChange={setLoop} label="重複播放" />' },
        api: [
          {
            description: "以 role='switch' 的按鈕渲染",
            props: [
              ['checked', 'boolean', '—', '必填'],
              ['onChange', '(checked: boolean) => void', '—', '必填'],
              ['label', 'string', '—', '必填，無障礙名稱'],
            ],
          },
        ],
        examples: [],
        keyboard: [['Space / Enter', '切換']],
        notes: ['Switch 本身沒有文字，旁邊的文字要另外寫。'],
      },

      // ── TextArea ──
      {
        id: 'text-area',
        name: 'TextArea',
        file: 'src/components/TextArea.jsx',
        summary: '多行的 TextField，隨內容長高',
        hero: { demo: 'text-field', code: '<TextArea value={excerpt} onChange={setExcerpt} placeholder="一兩句話說明這篇文章" />' },
        api: [
          {
            description: '外觀和 TextField 相同，高度跟著內容變，裡面不會出現捲軸',
            props: [
              ['value', 'string', "''", '內容'],
              ['onChange', '(value: string) => void', '—', '必填，傳入新的文字，不是事件'],
              ['…rest', '—', '—', '其他 props 傳給 textarea，例如 id、placeholder'],
            ],
          },
        ],
        examples: [],
        notes: [],
      },

      // ── TextField ──
      {
        id: 'text-field',
        name: 'TextField',
        file: 'src/components/TextField.jsx',
        summary: '看起來像一般文字的單行輸入欄位',
        hero: { demo: 'text-field', code: '<TextField value={title} onChange={setTitle} placeholder="文章標題" />' },
        api: [
          {
            description: '沒有邊框和聚焦框，只顯示游標，所以要放在 FormRow 這類有欄位名稱的地方',
            props: [
              ['value', 'string', "''", '內容'],
              ['onChange', '(value: string) => void', '—', '必填，傳入新的文字，不是事件'],
              ['aria-invalid', 'boolean', '—', 'true 時文字變成 --danger'],
              ['…rest', '—', '—', '其他 props 傳給 input，例如 id、type、placeholder'],
            ],
          },
        ],
        examples: [],
        notes: ["type='number' 時沒有上下箭頭，↑、↓ 鍵仍然可以增減。"],
      },

      // ── Tooltip ──
      {
        id: 'tooltip',
        name: 'TooltipGroup',
        file: 'src/components/Tooltip.jsx',
        summary: '一排按鈕共用一個提示：第一次等一下才出現，之後在按鈕間移動時立刻出現並滑過去',
        hero: {
          demo: 'tooltip',
          code: `<TooltipGroup className="toolbar">
  <Button variant="icon" aria-label="粗體" data-tip="粗體" data-kbd="Ctrl B">B</Button>
</TooltipGroup>`,
        },
        api: [
          {
            part: 'TooltipGroup',
            description: '包住一排按鈕，提示顯示在這一排的下方',
            props: [
              ['as', 'string | Component', "'div'", '要渲染的元素'],
              ['ref', 'Ref', '—', '傳給外層元素'],
              ['…rest', '—', '—', '其他 props 傳給元素，例如 role="toolbar"'],
            ],
          },
          {
            part: 'data-tip',
            description: '寫在要有提示的按鈕上',
            props: [
              ['data-tip', 'string', '—', '提示文字'],
              ['data-kbd', 'string', '—', '快速鍵，顯示在提示文字右邊'],
            ],
          },
        ],
        examples: [],
        notes: [
          '第一次停 400ms 才出現。離開後 300ms 內移到別的按鈕，提示立刻出現並滑過去。',
          '鍵盤聚焦到按鈕時立刻出現，按下按鈕時隱藏。',
          'TooltipGroup 要有 position（relative 或 absolute），提示才會對齊。',
          '移開時，提示在 0.09 秒內淡出再移除。',
          '減少動態效果開啟時，提示不淡入、不淡出，也不滑動。',
        ],
      },
      {
        id: 'code-card',
        family: 'Card',
        name: 'CodeCard',
        file: 'src/components/CodeCard.jsx',
        summary: '顯示一段程式碼，附語言標籤、檔名和複製按鈕',
        hero: { demo: 'code', code: `<CodeCard lang="ts" filename="route.ts" code={source} />` },
        api: [
          {
            description: '以 figure 元素渲染，文章裡的 codeBlock 節點由 RichText 轉成 CodeCard',
            props: [
              ['code', 'string', '—', '必填，程式碼原文，保留換行和縮排'],
              ['lang', 'string', "'ts'", '語言，決定標籤文字和上色規則'],
              ['filename', 'string', '—', '標題列的檔名，沒有時顯示語言'],
            ],
          },
        ],
        examples: [
          {
            id: 'shell',
            title: 'Shell',
            description: 'lang 設成 bash，# 開頭的內容會顯示成註解',
            demo: 'code-shell',
            code: `<CodeCard lang="bash" code={'# install and run\\nnpm install'} />`,
          },
          {
            id: 'no-filename',
            title: '沒有檔名',
            description: '不傳 filename 時，標題列顯示語言',
            demo: 'code-plain',
            code: `<CodeCard lang="css" code={css} />`,
          },
        ],
        notes: [
          '上色支援類 C 語法（JS、TS、CSS、JSON）和 shell 的 # 註解。',
          '複製先用 Clipboard API，瀏覽器擋住時改用 execCommand。',
          '複製成功時，螢幕閱讀器讀出「已複製」。',
          '複製和打勾兩個圖示交叉淡入淡出（icon-swap），隱藏的那個縮小、模糊。頁面剛載入時不動。',
          '程式碼區可以用鍵盤聚焦，並橫向捲動。左右還有程式碼時，邊緣淡出（ScrollShadow）。',
        ],
      },
      {
        id: 'image-card',
        family: 'Card',
        name: 'ImageCard',
        file: 'src/components/ImageCard.jsx',
        summary: '顯示一張圖片和選填的圖說',
        hero: { demo: 'image', code: `<ImageCard src={src} alt="設定頁的截圖" caption="滿版" />` },
        api: [
          {
            description: '以 figure 元素渲染，圖說是 figcaption',
            props: [
              ['src', 'string', '—', '必填，圖片網址或 import 的檔案'],
              ['alt', 'string', '—', '必填，描述圖片內容'],
              ['caption', 'ReactNode', '—', '圖說，通常是文字。編輯器傳入一個輸入框，讓圖說直接在原位編輯'],
              ['frame', 'boolean', 'false', '縮小置中，四周留白'],
              ['width / height', 'number', '—', '原始尺寸，載入前先保留空間'],
            ],
          },
        ],
        examples: [
          {
            id: 'frame',
            title: 'Frame',
            description: '用 frame 顯示手機截圖或小圖：最寬 280px，置中，四周留白',
            demo: 'image-frame',
            code: `<ImageCard src={src} alt="手機畫面" caption="frame" frame />`,
          },
          {
            id: 'size',
            title: '尺寸',
            description: '知道原始尺寸時傳入 width 和 height，圖片載入時版面不會位移',
            code: `<ImageCard src={src} alt="設定頁的截圖" width={1600} height={1000} />`,
          },
        ],
        notes: ['圖片延遲載入（loading="lazy"）。', 'alt 不要寫「圖片」或「截圖的圖片」，要描述圖裡的內容。'],
      },
      {
        id: 'slides-card',
        family: 'Card',
        name: 'SlidesCard',
        file: 'src/components/SlidesCard.jsx',
        summary: '一組可以左右切換的圖片，相鄰的圖從兩側露出一部分',
        hero: {
          demo: 'slides',
          code: `<SlidesCard slides={[{ src, alt: '步驟一', caption: '打開設定' }, …]} />`,
        },
        api: [
          {
            description: '以 figure 元素渲染，文章裡的 slidesCard 節點由 RichText 轉成 SlidesCard',
            props: [['slides', '{ src, alt, caption? }[]', '—', '必填，沒有 src 的項目不顯示']],
          },
        ],
        examples: [],
        keyboard: [
          ['← / →', '圖片區聚焦時，切到上一張或下一張'],
          ['Tab', '移到上一張和下一張按鈕'],
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
        summary: '播放一段影片：影片檔用自己的播放器，附播放、時間、進度、倍速和全螢幕控制；YouTube 連結用 YouTube 的播放器',
        hero: { demo: 'video', code: `<VideoCard src={clip} poster={poster} caption="拖曳排序的過程" />` },
        api: [
          {
            description: '以 figure 元素渲染，不會自動播放',
            props: [
              ['src', 'string', '—', '必填。影片檔建議 mp4（H.264），也可以是 YouTube 連結（youtu.be、watch、shorts、embed）'],
              ['poster', 'string', '—', '播放前顯示的圖。YouTube 影片用 YouTube 的縮圖，不用這個'],
              ['caption', 'string', '—', '說明'],
              ['loop', 'boolean', 'false', '播完重新播放'],
            ],
          },
        ],
        examples: [
          {
            id: 'loop',
            title: 'Loop',
            description: '短的操作示範用 loop，播完自動重來',
            demo: 'video-loop',
            code: `<VideoCard src={clip} caption="播完重新播放" loop />`,
          },
          {
            id: 'youtube',
            title: 'YouTube',
            description: 'src 是 YouTube 連結時，換成 YouTube 的播放器（隱私模式 youtube-nocookie.com），比例 16:9',
            code: `<VideoCard src="https://youtu.be/VIDEO_ID" caption="說明" />`,
          },
        ],
        notes: [
          '播放時，控制列只在游標移入或鍵盤聚焦時出現，觸控裝置上則一直顯示。',
          '手機寬度不顯示總長度。',
          '播放和暫停兩個圖示交叉淡入淡出（icon-swap），隱藏的那個縮小、模糊。頁面剛載入時不動。',
          'iOS Safari 上，全螢幕作用在 video 元素本身。',
          '影片用 -movflags +faststart 輸出，才能邊下載邊播放。',
          'YouTube 影片在訪客按下播放前不載入 YouTube 的 cookie。正式站的 HTML 裡寫成一個連到 YouTube 的連結，給搜尋引擎讀。',
        ],
      },

      // ── DropdownMenu ──
      {
        id: 'dropdown-menu',
        name: 'DropdownMenu',
        file: 'src/components/DropdownMenu.jsx',
        summary: '從按鈕打開的一組動作或選項',
        hero: { demo: 'menu-actions', code: `<DropdownMenu label="插入" trigger="＋ 插入" items={ACTIONS} onSelect={insert} />` },
        api: [
          {
            description: '按鈕加上 role="menu" 的清單，點清單外面會關閉',
            props: [
              ['label', 'string', '—', '必填，按鈕和選單的無障礙名稱'],
              ['trigger', 'node', '—', '必填，按鈕的內容'],
              ['items', "({ value, label, icon?, kbd? } | 'divider')[]", '—', "必填，'divider' 是分隔線"],
              ['value', 'string', '—', '有值時當作選擇器，目前的項目打勾'],
              ['onSelect', '(value) => void', '—', '必填'],
              ['triggerClassName', 'string', "'dropdown-menu__trigger'", '按鈕的 class'],
              ['tip', 'string', '—', '工具列提示的文字'],
              ['triggerProps', 'object', '—', '加在按鈕上的其他屬性，例如 draggable、onDragStart。按鈕按下時不會搶走編輯器的選取，可以拖曳的按鈕例外'],
            ],
          },
        ],
        examples: [
          {
            id: 'picker',
            title: '選擇器',
            description: '傳入 value，選單變成單選：項目是 menuitemradio，目前的項目打勾',
            demo: 'menu-picker',
            code: `<DropdownMenu label="段落樣式" trigger={current} items={STYLES} value={style} onSelect={setStyle} />`,
          },
          {
            id: 'shortcuts',
            title: '快速鍵和分隔線',
            description: '項目的 kbd 顯示在右側，用字串 divider 把項目分組',
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
            description: '用 triggerClassName 換掉按鈕樣式，例如編輯器工具列的圖示按鈕',
            code: `<DropdownMenu label="插入" tip="插入" trigger={<PlusIcon />} items={INSERTS} triggerClassName="btn btn--icon" onSelect={insert} />`,
          },
        ],
        keyboard: [
          ['Enter / Space / ↓', '按鈕聚焦時，打開選單'],
          ['↑ / ↓', '移到上一個或下一個項目'],
          ['Home / End', '移到第一個或最後一個項目'],
          ['Enter', '選擇目前的項目'],
          ['Esc', '關閉選單，焦點回到按鈕'],
          ['Tab', '關閉選單'],
        ],
        notes: ['打開時，焦點移到目前的項目。', '關閉時，清單在 0.09 秒內往上淡出再移除。減少動態效果開啟時直接消失。', '按下項目不會清掉編輯器的選取範圍。', '不要用原生 <select>：它打開的清單由作業系統繪製，不跟網站的深色樣式。'],
      },


      // ── Editor ──
      {
        id: 'editor',
        name: 'WYSIWYG Editor',
        file: 'src/components/Editor.jsx',
        summary: '文章內文的所見即所得編輯器，輸出 RichText 使用的文件',
        hero: { demo: 'editor', code: `<Editor key={slug} doc={getDoc(body)} onChange={setDoc} upload={upload} previewing={admin.previewing} renderPreview={(doc) => <RichText doc={doc} />} />` },
        api: [
          {
            description: '沒有固定工具列。每一行左邊的「+」新增區塊、「⠿」拖曳或打開區塊選單。選取文字時浮出格式工具列：轉換成、粗體、斜體、底線、連結、行內程式碼',
            props: [
              ['doc', 'object', '—', '必填，只在掛載時讀取，換文章時用新的 key 重新掛載'],
              ['onChange', '(doc) => void', '—', '必填，每次修改都傳出新的文件'],
              ['upload', '(file) => Promise<string>', '—', '必填，上傳圖片，回傳圖片網址'],
              ['previewing', 'boolean', 'false', '選填。true 時把編輯器換成 renderPreview(doc)，也就是正式頁的畫面。編輯器只是隱藏，游標和復原紀錄都會保留。切換按鈕由呼叫的一方提供（文章頁放在 SidePanel）'],
              ['renderPreview', '(doc) => ReactNode', '—', 'previewing 為 true 時必填，畫出預覽'],
            ],
          },
        ],
        examples: [
          {
            id: 'markdown',
            title: 'Markdown 輸入',
            description: '在段落開頭輸入 Markdown 符號，會自動轉成對應的區塊',
            code: `## 小標題
> 引言
- 清單
1. 編號清單
\`\`\` 程式碼`,
          },
          {
            id: 'block-gutter',
            title: '每一行左邊的 + 和 ⠿',
            description: '滑鼠移到任何一行，左邊出現「+」和「⠿」，對齊這一行的第一行文字。「+」打開區塊選單（段落、標題、前言、引言、清單、程式碼、圖片、輪播、影片、分隔線），新區塊插在這一行下面，這一行是空的時直接換掉它。「⠿」拖曳移動整個區塊，點一下打開區塊選單，裡面有「刪除」。游標停在空行時，那一行也出現「+」。手機和 768px 以下只在空行顯示「+」，放在空行裡面',
          },
          {
            id: 'image-card',
            title: '圖片卡',
            description: '編輯器裡的圖片卡就是正式的 ImageCard，圖說直接在圖片下方輸入。右上角的工具列在滑過或選取時出現：「⋯」設定（替代文字、圖片網址和換圖、小圖置中）、✕ 刪除。沒有替代文字時，工具列一直顯示「缺替代文字」。還沒有圖片時，卡片顯示選擇檔案和圖片網址',
          },
          {
            id: 'paste-image',
            title: '貼上或拖放圖片',
            description: '在內文裡貼上圖片，或把圖檔拖進來，會在游標或放下的位置插入圖片卡並自動上傳。上傳前在瀏覽器裡壓縮（src/lib/compressImage.js）：超過 1MB 或不是 JPG、PNG、WEBP 的圖，長邊縮到 2000px 並轉成 WEBP。貼上或拖進一段含圖片的網頁內容時，每個 <img> 都變成圖片卡，編輯器會下載並轉存一份。對方網站擋下載時，卡片保留原網址並顯示提醒，上線前要改成自己的圖',
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
          '工具列的提示用 TooltipGroup。',
          '新增節點時，同時修改 Editor.jsx、RichText 和 src/lib/richText.js。',
        ],
      },

      // ── Tag ──
      {
        id: 'tag',
        name: 'Tag',
        file: 'src/components/Tag.jsx',
        summary: '文章的標籤。可以只顯示文字，也可以當篩選按鈕',
        hero: { demo: 'tag', code: '<TagList tags={postTags(post)} />' },
        api: [
          {
            part: 'Tag',
            description: '沒有 onClick 時是金色的標籤文字；有 onClick 時是膠囊按鈕，用 aria-pressed 表示選取',
            props: [
              ['children', 'node', '—', '標籤文字，英文大寫'],
              ['count', 'number', '—', '按鈕上的篇數，只在按鈕時顯示'],
              ['selected', 'boolean', 'false', '目前選取的標籤，外框變金色'],
              ['onClick', '() => void', '—', '有這個 prop 就變成按鈕'],
            ],
          },
          {
            part: 'TagList',
            description: '一排純文字標籤，用在列表、精選文章和文章頁的 meta',
            props: [['tags', 'string[]', '—', '必填，用 postTags(post) 取得']],
          },
        ],
        examples: [
          {
            id: 'filter',
            title: '篩選列',
            demo: 'tag-filter',
            description: 'Journal 列表上方的一排按鈕：「全部」加上每個標籤和篇數，一次選一個。選取的標籤寫在網址 ?tag=AI',
            code: '<Tag count={2} selected={tag === "AI"} onClick={() => choose("AI")}>AI</Tag>',
          },
        ],
        notes: [
          '標籤是英文大寫，中英文共用，在編輯面板用逗號分開輸入（parseTags）。',
          '當按鈕時點擊不出聲（data-sound="off"）。',
          '舊文章只有 category，postTags 會把它當成唯一的標籤。',
          '少於兩個標籤時，篩選列不顯示。',
          '選取的標籤有金色框線和淡金色底色，不只靠顏色區分。鍵盤聚焦時是 1px 的 --ember 外框。',
          '768px 以下，按鈕高 32px，列與列相隔 12px，每顆的點擊範圍撐到 44px 也不會和下一列重疊。',
          '按鈕的字用 text-box 裁到大寫字高和基線，大寫字母在膠囊裡上下置中。右側內距少一個字距，因為字距會加在最後一個字後面。不支援 text-box 的瀏覽器（Firefox）字會偏上約 1px。',
        ],
      },

      // ── OtpInput ──
      {
        id: 'otp-input',
        name: 'OtpInput',
        file: 'src/components/OtpInput.jsx',
        summary: '輸入固定長度的密碼或驗證碼，一格一個字元，只顯示圓點',
        hero: { demo: 'otp-input', code: `<OtpInput value={code} onChange={setCode} onComplete={verify} label="密碼" />` },
        api: [
          {
            description: '一排格子，上面蓋著一個實際的 input',
            props: [
              ['value', 'string', '—', '必填，目前的內容'],
              ['onChange', '(value) => void', '—', '必填，內容改變時呼叫'],
              ['onComplete', '(value) => void', '—', '最後一格填滿時呼叫'],
              ['length', 'number', '6', '格數'],
              ['numeric', 'boolean', 'true', '只接受數字，手機顯示數字鍵盤'],
              ['invalid', 'boolean', 'false', '格子左右搖動四下，一下比一下小，然後變成錯誤色'],
              ['disabled', 'boolean', 'false', '停用輸入'],
              ['label', 'string', '—', '必填，無障礙名稱'],
              ['describedBy', 'string', '—', '錯誤訊息元素的 id'],
              ['ref', 'Ref<HTMLInputElement>', '—', '指向實際的 input，用來聚焦'],
            ],
          },
        ],
        examples: [
          {
            id: 'invalid',
            title: 'Invalid',
            description: '驗證失敗時設定 invalid，並清空 value，下一次輸入時取消 invalid',
            demo: 'otp-input-invalid',
            code: `<OtpInput value={code} onChange={change} invalid={wrong} label="密碼" />`,
          },
          {
            id: 'length',
            title: 'Length',
            description: '用 length 設定格數',
            demo: 'otp-input-length',
            code: `<OtpInput length={4} value={pin} onChange={setPin} label="PIN" />`,
          },
          {
            id: 'text',
            title: '英數字',
            description: '設定 numeric={false}，接受字母和數字',
            code: `<OtpInput numeric={false} length={8} value={code} onChange={setCode} label="邀請碼" />`,
          },
        ],
        notes: [
          '打字、貼上和手機自動填入驗證碼（autocomplete="one-time-code"）都能用。',
          '只顯示圓點，不顯示字元。目前要輸入的格子有金色框和閃爍的游標。',
          '減少動態效果開啟時，invalid 不搖動。',
        ],
      },

      // ── Drawer ──
      {
        id: 'drawer',
        name: 'Drawer',
        file: 'src/components/Drawer.jsx',
        summary: '從右側滑出的面板，有標題列和可以捲動的內容',
        hero: {
          demo: 'drawer',
          code: `<Drawer open={open} label="設定" push>
  <DrawerHeader title="設定" subtitle="/journal">
    <Button variant="ghost" onClick={close}>關閉</Button>
  </DrawerHeader>
  <DrawerBody>…</DrawerBody>
</Drawer>`,
        },
        api: [
          {
            part: 'Drawer',
            description: '用 portal 放在 body 底下，蓋在導覽列上面。open 變成 false 後，滑出動畫播完才移除',
            props: [
              ['open', 'boolean', '—', '必填，是否打開'],
              ['label', 'string', '—', '必填，面板的無障礙名稱'],
              ['push', 'boolean', 'false', '寬度 1100px 以上時，頁面往左移出面板的寬度，不被蓋住'],
              ['className', 'string', "''", '附加的 class'],
              ['children', 'node', '—', 'DrawerHeader 和 DrawerBody'],
            ],
          },
          {
            part: 'DrawerHeader',
            description: '標題列：左邊標題和副標，右邊放按鈕',
            props: [
              ['title', 'string', '—', '標題'],
              ['subtitle', 'string', '—', '副標，太長時以刪節號結尾'],
              ['children', 'node', '—', '右側的按鈕'],
            ],
          },
          {
            part: 'DrawerBody',
            description: '可以捲動的內容，捲到底時不會帶動後面的頁面。上下還有內容時，邊緣淡出（ScrollShadow）',
            props: [['children', 'node', '—', '內容']],
          },
        ],
        examples: [],
        notes: [
          '寬度是 --drawer-w（520–820px）。768px 以下佔滿整個寬度。',
          '打開時從右側滑入，關閉時在 0.3 秒內滑回右側。減少動態效果開啟時直接出現、直接消失。',
          '編輯模式的面板（SidePanel）用 Drawer 組成，加上儲存、登出、預覽和收合後的按鈕。',
        ],
      },

      // ── Breadcrumbs ──
      {
        id: 'breadcrumbs',
        name: 'Breadcrumbs',
        file: 'src/components/Breadcrumbs.jsx',
        summary: '顯示這一頁在網站裡的位置：上層的連結，最後是目前這一頁',
        hero: {
          demo: 'breadcrumbs',
          code: `<Breadcrumbs label="導覽路徑">
  <BreadcrumbsItem href="/">首頁</BreadcrumbsItem>
  <BreadcrumbsItem href="/journal">Journal</BreadcrumbsItem>
  <BreadcrumbsItem>{post.title}</BreadcrumbsItem>
</Breadcrumbs>`,
        },
        api: [
          {
            part: 'Breadcrumbs',
            description: 'nav 加上 ol，項目之間放分隔符號',
            props: [
              ['label', 'string', '—', '必填，nav 的無障礙名稱'],
              ['separator', 'node', '箭頭', '換掉項目之間的箭頭'],
              ['className', 'string', "''", '附加的 class'],
              ['children', 'node', '—', 'BreadcrumbsItem'],
            ],
          },
          {
            part: 'BreadcrumbsItem',
            description: '有 href 時是連結，沒有 href 時是目前這一頁（aria-current="page"）',
            props: [
              ['href', 'string', '—', '連結的網址'],
              ['as', 'Component', '—', '改用其他連結元件，例如會回到上一頁的 BackLink'],
              ['children', 'node', '—', '文字'],
            ],
          },
        ],
        examples: [
          {
            id: 'levels',
            title: '層數',
            description: '兩層、三層、四層',
            demo: 'breadcrumbs-levels',
            code: `<Breadcrumbs label="導覽路徑">
  <BreadcrumbsItem href="/">首頁</BreadcrumbsItem>
  <BreadcrumbsItem>Work</BreadcrumbsItem>
</Breadcrumbs>`,
          },
          {
            id: 'separator',
            title: '自訂分隔符號',
            description: '用 separator 換掉箭頭',
            demo: 'breadcrumbs-separator',
            code: '<Breadcrumbs label="導覽路徑" separator="/">…</Breadcrumbs>',
          },
        ],
        notes: [
          '字級 14px（--type-small）、行高 20px，字用 --font-label。連結是灰色，hover 加底線；目前這一頁是金色。',
          '寬度不夠時，目前這一頁的文字以刪節號結尾，上層的連結不縮。',
          '用在 Journal 文章頁的最上面：首頁、Journal、文章標題。',
        ],
      },

      // ── Accordion ──
      {
        id: 'accordion',
        name: 'Accordion',
        file: 'src/components/Accordion.jsx',
        summary: '一組可以展開和收合的段落。標題是按鈕，按下後內容在下面展開',
        hero: {
          demo: 'accordion',
          code: `<Accordion>
  <AccordionItem id="stack" title="網站用什麼做的？">…</AccordionItem>
  <AccordionItem id="update" title="多久更新一次？">…</AccordionItem>
</Accordion>`,
        },
        api: [
          {
            part: 'Accordion',
            description: '管理哪些段落是展開的',
            props: [
              ['multiple', 'boolean', 'false', '可以同時展開多個段落'],
              ['defaultOpen', 'string[]', '[]', '一開始展開的段落 id'],
              ['variant', "'default' | 'surface'", "'default'", 'surface 放在炭灰色的卡片上'],
              ['hideSeparator', 'boolean', 'false', '不顯示段落之間的線'],
              ['headingLevel', '2 | 3 | 4', '3', '標題的層級'],
              ['className', 'string', "''", '附加的 class'],
            ],
          },
          {
            part: 'AccordionItem',
            description: '一個段落：標題按鈕和下面的內容',
            props: [
              ['id', 'string', '—', '必填，段落的識別'],
              ['title', 'node', '—', '必填，標題'],
              ['disabled', 'boolean', 'false', '不能展開'],
              ['indicator', 'node', '箭頭', '換掉右邊的箭頭。展開時轉 180 度'],
              ['children', 'node', '—', '展開後的內容'],
            ],
          },
        ],
        examples: [
          {
            id: 'surface',
            title: 'Surface',
            description: 'variant="surface"',
            demo: 'accordion-surface',
            code: '<Accordion variant="surface">…</Accordion>',
          },
          {
            id: 'no-separator',
            title: 'Without Separator',
            description: 'hideSeparator',
            demo: 'accordion-no-separator',
            code: '<Accordion hideSeparator>…</Accordion>',
          },
          {
            id: 'multiple',
            title: 'Multiple Expanded',
            description: 'multiple：展開一個時，其他的不會收起來',
            demo: 'accordion-multiple',
            code: '<Accordion multiple defaultOpen={["stack", "update"]}>…</Accordion>',
          },
          {
            id: 'disabled',
            title: 'Disabled',
            description: '在 AccordionItem 加 disabled',
            demo: 'accordion-disabled',
            code: '<AccordionItem id="contact" title="…" disabled>…</AccordionItem>',
          },
        ],
        keyboard: [
          ['Tab', '移到下一個標題'],
          ['Enter／Space', '展開或收合'],
        ],
        notes: [
          '標題是 h3（可以用 headingLevel 改），裡面是 button，有 aria-expanded 和 aria-controls。',
          '展開時高度和透明度在 0.25 秒內變化，箭頭轉 180 度。減少動態效果開啟時直接切換。',
          '收合的內容加上 inert，鍵盤和螢幕閱讀器都跳過它。',
        ],
      },

      // ── ScrollShadow ──
      {
        id: 'scroll-shadow',
        name: 'ScrollShadow',
        file: 'src/components/ScrollShadow.jsx',
        summary: '可以捲動的區塊。還有內容沒看到的那一邊會淡出',
        hero: {
          demo: 'scroll-shadow',
          code: `<ScrollShadow className="box">
  <div className="text">
    {paragraphs.map((p) => <p key={p}>{p}</p>)}
  </div>
</ScrollShadow>

/* .box { max-height: 240px; padding: 16px; } */`,
        },
        api: [
          {
            description: '本身就是捲動的容器。淡出是蓋在內容上的遮罩，任何背景都能用',
            props: [
              ['as', 'string', "'div'", '要渲染的元素，例如 pre'],
              ['orientation', "'vertical' | 'horizontal'", "'vertical'", '捲動方向'],
              ['size', 'number', '40', '淡出的長度，單位 px'],
              ['hideScrollBar', 'boolean', 'false', '隱藏捲軸'],
              ['className', 'string', "''", '附加的 class，用來設定高度或寬度'],
              ['…rest', '—', '—', '其他屬性（tabIndex、aria-*）傳給元素'],
            ],
          },
        ],
        examples: [],
        notes: [
          '捲到最上面時只有下緣淡出，捲到最下面時只有上緣淡出。內容不夠長時都不淡出。',
          '淡出的長度在 0.3 秒內展開或收起。減少動態效果開啟時直接切換。',
          '捲軸那一條不加遮罩，捲軸兩端不會淡掉。',
          '用在 CodeCard 的程式碼區和 DrawerBody。',
        ],
      },

      // ── Skeleton ──
      {
        id: 'skeleton',
        name: 'Skeleton',
        file: 'src/components/Skeleton.jsx',
        summary: '資料載入前的灰色佔位方塊，形狀照著之後要出現的內容',
        hero: {
          demo: 'skeleton',
          code: `<div role="status" aria-label="載入中">
  <Skeleton style={{ height: 128 }} />
  <Skeleton style={{ height: 12, width: '60%' }} />
  <Skeleton style={{ height: 12, width: '80%' }} />
  <Skeleton style={{ height: 12, width: '40%' }} />
</div>`,
        },
        api: [
          {
            description: '一個 span，預設高 1em、4px 圓角，底色是 --surface-3 的 70%。寬高用 className 或 style 設定',
            props: [
              ['animation', "'shimmer' | 'pulse' | 'none'", "'shimmer'", 'shimmer 是一道 --surface-3 的亮光從左掃到右，pulse 是整塊忽明忽暗，週期都是 2 秒'],
              ['className', 'string', "''", '附加的 class'],
              ['style', 'CSSProperties', '—', '寬高'],
            ],
          },
        ],
        examples: [
          {
            id: 'text-content',
            title: 'Text Content',
            description: '一段文字的佔位：五行，寬度不同，最後一行最短',
            demo: 'skeleton-text',
            code: `{['100%', '83%', '67%', '100%', '50%'].map((w) => (
  <Skeleton key={w} style={{ height: 16, width: w }} />
))}`,
          },
          {
            id: 'list-items',
            title: 'List Items',
            description: '列表的佔位：左邊一個方形縮圖，右邊兩行文字',
            demo: 'skeleton-list',
            code: `<div className="item">
  <Skeleton style={{ height: 40, width: 40, flexShrink: 0 }} />
  <div>
    <Skeleton style={{ height: 12 }} />
    <Skeleton style={{ height: 12, width: '80%' }} />
  </div>
</div>`,
          },
          {
            id: 'animation-types',
            title: 'Animation Types',
            description: '用 animation 選擇動畫：shimmer（預設）、pulse、none',
            demo: 'skeleton-types',
            code: `<Skeleton animation="shimmer" />
<Skeleton animation="pulse" />
<Skeleton animation="none" />`,
          },
        ],
        notes: [
          '螢幕閱讀器讀不到 Skeleton。外層容器要加 role="status" 和 aria-label，例如「文章載入中」。',
          '減少動態效果開啟時不動，只顯示灰色方塊。',
          'Journal 列表在 R2 資料回來之前，用它排出精選文章和三列文章的形狀。',
        ],
      },
    ],
  },
  {
    id: 'effects',
    title: '效果',
    intro: '視覺效果。常駐的效果每頁最多一個，寫成 mountXxx(canvas, opts) 並回傳 cleanup。按一下才播一次的效果寫成 playXxx(…)，自己建立畫面，播完自己移除',
    items: [
      {
        id: 'shatter-image',
        name: 'mountShatterImage',
        file: 'src/lib/shatterImage.js',
        summary: '碎片從左到右拼成一張圖，然後靜止',
        hero: { demo: 'shatter', code: `useEffect(() => mountShatterImage(canvas.current, { src, crop: [0, 583, 1920, 705] }), [])` },
        api: [
          {
            description: '圖的亮度轉成透明度，所以要用黑底、亮線條的圖',
            props: [
              ['canvas', 'HTMLCanvasElement', '—', '必填，尺寸由 CSS 決定'],
              ['opts.src', 'string', '—', '必填，圖片網址'],
              ['opts.crop', '[x, y, w, h]', '—', '必填，要使用的原圖範圍，單位是原圖像素'],
              ['opts.onPlay', '() => void', '—', '開始拼圖時呼叫'],
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
        summary: '持續落下的暗淡字元，游標附近的字元變亮',
        hero: { demo: 'glyph', code: `useEffect(() => mountGlyphField(glyphs.current), [])` },
        api: [
          {
            description: '顏色讀取 canvas 的 CSS color 和 --glyph-glow，搭配遮罩淡出邊緣',
            props: [['canvas', 'HTMLCanvasElement', '—', '必填，CSS 尺寸 1200 × 400']],
          },
        ],
        examples: [],
        notes: ['離開畫面時停止繪製。', '減少動態效果開啟時不啟動。'],
      },
      {
        id: 'koi-pond',
        name: 'mountKoiPond',
        file: 'src/lib/koiPond.js',
        summary: '字元拼成的錦鯉在畫面裡游，點一下丟飼料，附近的錦鯉游過來吃',
        hero: { demo: 'koi', code: `useEffect(() => mountKoiPond(canvas.current, { surface: root.current, onCount: setCount }), [])` },
        api: [
          {
            description: '顏色讀取 canvas 的 CSS color（身體）、--koi-mark（斑紋）和 --koi-food（飼料），字元的字型讀取 font-family',
            props: [
              ['canvas', 'HTMLCanvasElement', '—', '必填，尺寸由 CSS 決定'],
              ['opts.surface', 'HTMLElement', 'canvas', '點擊這個元素時丟飼料，連結和按鈕上的點擊不算'],
              ['opts.avoid', 'HTMLElement[]', '[]', '錦鯉會避開這些元素，例如蓋在池子上的文字。每秒重新量一次位置'],
              ['opts.onCount', '({ koi, food }) => void', '—', '錦鯉或飼料的數量改變時呼叫'],
            ],
          },
        ],
        examples: [],
        notes: [
          '768px 以下三隻錦鯉、一格 7px，其他寬度七隻、一格 9px。',
          '錦鯉有大有小，最小的是最大的一半，越小的越暗。',
          '每隻錦鯉有自己的速度，會在巡游、漂著不動、衝刺、暴衝之間切換。',
          '池子沒有牆，錦鯉游出一邊會從對面進來。avoid 的元素貼著的那段邊緣算是牆。',
          '越亮的地方字元越密，從「.」到「@」。',
          '飼料最多 12 顆，30 秒沒被吃掉就消失。',
          '丟飼料時從點擊處呼叫 playWaterRipple，水波會扭曲整頁。',
          '模擬每秒固定 60 步，和螢幕更新率無關。',
          '離開畫面時停止繪製。',
          '減少動態效果開啟時只畫一張靜止的畫面，不能餵魚。',
          'devicePixelRatio 上限 2。',
        ],
      },
      {
        id: 'grain-haze',
        name: 'mountGrainHaze',
        file: 'src/lib/grainHaze.js',
        summary: '一塊柔邊的光碎成沙粒，明暗很慢地流動',
        hero: { demo: 'haze', code: `useEffect(() => mountGrainHaze(canvas.current), [])` },
        api: [
          {
            description: '用 WebGL 逐像素計算，顏色讀取 canvas 的 CSS color',
            props: [['canvas', 'HTMLCanvasElement', '—', '必填，尺寸由 CSS 決定']],
          },
        ],
        examples: [],
        notes: [
          '顆粒不會動，動的是底下的雜訊場，所以每秒只畫 10 次。',
          '強度由 SHARE 決定，現在是 0.375。',
          '離開畫面時停止繪製。減少動態效果開啟時只畫一張靜止的畫面。',
          '瀏覽器不支援 WebGL 時不畫任何東西。',
          'devicePixelRatio 上限 1.5。',
        ],
      },
      {
        id: 'hero-fx',
        name: 'mountHeroFx',
        file: 'src/labs/living-portrait/heroFx.js',
        summary: 'Living Portrait 的互動：游標移到人物上出現追蹤框和 ASCII，雙擊出現 glitch',
        hero: { code: `useEffect(() => mountHeroFx({ root, bg, cut, alt, canvas }), [])` },
        api: [
          {
            description: '依賴同一個資料夾裡三張圖的尺寸和焦點位置，只用在 Living Portrait',
            props: [['els', '{ root, bg, cut, alt, canvas }', '—', '必填，Hero 的根元素、三張圖和 canvas']],
          },
        ],
        examples: [],
        notes: ['MAX_W 要和 --page-max 一致。', '更換 Hero 圖時，同時修改 IW、IH 和焦點座標。'],
      },
      {
        id: 'fall-scene',
        name: 'mountFallScene',
        file: 'src/labs/falling-figure/fallScene.js',
        summary: '粒子組成的人形隨捲動往下掉，穿過刻字的石板',
        hero: { code: `useEffect(() => mountFallScene({ canvas, figure, sections, acts, progressDot, onAct }), [])` },
        api: [
          {
            description: '接管整頁的捲動（Lenis），只用在 About 頁',
            props: [['opts', '{ canvas, figure, sections, acts, progressDot, onAct }', '—', '必填，場景元素和每一幕的資料']],
          },
        ],
        examples: [],
        notes: ['cleanup 時一起銷毀 Lenis。'],
      },
      {
        id: 'water-ripple',
        name: 'playWaterRipple',
        file: 'src/lib/waterRipple.js',
        summary: '在一個點滴下水滴，水波 0.8 秒內擴散到畫面對角，整頁文字跟著扭曲，1 秒內結束',
        hero: { demo: 'ripple', code: `playWaterRipple(e.clientX, e.clientY, toggleLang)` },
        api: [
          {
            description: '一次性的效果：自己建立 Canvas 和 SVG 濾鏡，播完全部移除，動畫中再呼叫會加一顆水滴，並重新計算 1 秒',
            props: [
              ['x', 'number', '—', '必填，水滴位置，視窗座標'],
              ['y', 'number', '—', '必填'],
              ['onSwap', '() => void', '—', '0.3 秒時呼叫一次，用來在波紋中換內容，減少動態效果開啟時立刻呼叫'],
            ],
          },
        ],
        examples: [],
        notes: [
          '波動方程式在 CPU 上計算，每秒固定 360 步，和螢幕更新率無關。',
          '扭曲用 SVG feDisplacementMap，掛在 <html> 上，因為只有根元素的 filter 不會改變 position: fixed。',
          '畫面外有一圈吸收帶，波碰到邊緣不反彈。離邊緣 40px 內扭曲減到 0，避免露出白底。',
          '用在 SiteNav 的語言按鈕。',
        ],
      },
    ],
  },
  {
    id: 'utilities',
    title: '工具',
    intro: '不屬於介面元件、也不是視覺效果的共用函式',
    items: [
      {
        id: 'reveal',
        name: 'mountReveal',
        file: 'src/lib/reveal.js',
        summary: '元素露出 15% 時加上 is-visible，全站的淡入都用它',
        hero: { demo: 'fade', code: `<Link to={href} className="fade-in journal-card">…</Link>` },
        api: [
          {
            part: 'mountReveal()',
            description: '監看全站的 .fade-in 元素，進入畫面時加上 is-visible，只觸發一次。App.jsx 呼叫一次，回傳 cleanup。新元件不用另外接',
            props: [],
          },
          {
            part: '.fade-in',
            description: '寫在要淡入的元素上。位移和時長寫在各頁的 CSS，例如 .journal-page .fade-in',
            props: [
              ['fade-in', 'class', '—', '要淡入的元素'],
              ['is-visible', 'class', '—', '進入畫面後由 mountReveal 加上，不要自己寫'],
            ],
          },
        ],
        examples: [],
        notes: [
          '首頁位移 20px，Journal 位移 24px，案例頁位移 30px。',
          '減少動態效果開啟時，各頁的 CSS 直接顯示元素。',
          '包住整個區塊，不要每一行各包一次。',
          '淡入會設定 transform，所以用 transform 置中的元素不要加 fade-in，改用 margin 置中。',
        ],
      },
      {
        id: 'ui-sound',
        name: 'playSound',
        file: 'src/lib/uiSound.js',
        summary: '點擊連結和按鈕時的短音效，用 Web Audio 即時合成，沒有音檔',
        hero: { demo: 'sounds', code: `<button type="button" data-sound="select">…</button>` },
        api: [
          {
            part: 'playSound(name)',
            description: '播放一個音效。要在使用者的點擊或按鍵裡呼叫，瀏覽器才會出聲',
            props: [['name', 'keyof SOUNDS', '—', '必填，音效名稱，見下方「音效」']],
          },
          {
            part: 'mountClickSounds()',
            description: '在 document 掛一個點擊監聽，全站的連結和按鈕自動出聲。App.jsx 呼叫一次，回傳 cleanup。新元件不用另外接',
            props: [],
          },
          {
            part: 'data-sound',
            description: '寫在元素或它的上層，指定點擊時的音效。沒有寫時照下面的預設',
            props: [
              ['data-sound', 'string', '—', '音效名稱，或 "off" 不出聲'],
              ['role="menuitem…"', '—', 'select', '選單項目（DropdownMenu）'],
              ['.cms-save', '—', 'press', '編輯面板的儲存'],
              ['<a href>', '—', 'pressGhost', '連結，包括導覽列'],
              ['<button>', '—', 'pressSoft', '其他按鈕'],
            ],
          },
          {
            part: '音效',
            description: '全部的音效。press 開頭的是按壓聲，其他是狀態的提示聲',
            props: [
              ['press', 'press', '—', '實心的主要按鈕'],
              ['pressOutline', 'press', '—', '外框按鈕'],
              ['pressSoft', 'press', '—', '淡底按鈕，全站按鈕的預設'],
              ['pressGhost', 'press', '—', '透明按鈕和連結，全站連結的預設'],
              ['pop', '提示', '—', '勾選'],
              ['select', '提示', '—', '選單選項'],
              ['toggleOn / toggleOff', '提示', '—', '開關'],
              ['open / close', '提示', '—', '打開和關閉面板'],
              ['success / error', '提示', '—', '成功和錯誤'],
              ['copy', '提示', '—', '複製'],
              ['save / unsave', '提示', '—', '收藏和取消'],
              ['hover', '提示', '—', '滑過'],
            ],
          },
        ],
        examples: [],
        notes: [
          '預設開，沒有開關。減少動態效果開啟時不出聲。',
          '目前只有點擊會出聲。pop、open、success 這些提示聲還沒接到任何互動。',
        ],
      },
    ],
  },
]
