# DESIGN.md

TEKUEI 的視覺與動態規範。改畫面、樣式或動畫之前讀這份檔案。
為什麼這樣設計，見 [PRODUCT.md](PRODUCT.md)。怎麼寫程式，見 [AGENTS.md](AGENTS.md)。

這份規範從現有程式碼整理出來。「待決定」的項目，以使用者的新指示為準。

## 方向

- 安靜的版面，配一個精準的記憶點。
- 深色底、象牙白字、少量金色。
- 喜歡：乾淨整齊的格線、量測和標註線、暗淡的字元背景、真實影像轉成字元或粒子的質感。
- 不要：鮮豔的大色塊、超大的字、復古風、3D 遊戲感、插畫角色、太空的極簡。

## 顏色

Token 都在 `src/styles/tokens.css`。底層是兩組 12 階色階：`--gray-1…12`、`--accent-1…12`，各有透明版本（`-a1…a12`）。語意 token 指向色階，新程式碼只用這張表的語意 token。

| 用途 | Token | 值 |
|---|---|---|
| 頁面背景 | `--surface-0` | `#0b0b0d` obsidian |
| 卡片、區塊背景 | `--surface-1` | `#181719` charcoal |
| 浮起的元素 | `--surface-2` | `#242024` |
| 分隔線、格線 | `--line` | ivory 8% |
| 邊框、要看得到的分隔 | `--line-strong` | ivory 14% |
| 強調 | `--ember` | `#c99a63` gold |
| hover、光暈 | `--ember-soft` | `#e4b57b` amber |
| 聚焦框、目前頁的底線 | `--ember-line` | gold 30% |
| hover 的淡底 | `--ember-whisper` | gold 14% |
| 錯誤 | `--danger` | `#e8907c` |

- 比例：約 70% 黑與炭灰、25% 象牙白文字、5% 金色。
- 金色只用在三個地方：目前頁、聚焦、hover。一般的邊框和分隔線用 `--line`。
- 頁面自己的變數（例如 `--j-lamp`、`--hh-gold`）必須指向全站 token，不可以寫色碼。
- 舊的名稱（`--paper*`、`--ink-*`、`--gold-10*`、`--ls-*` 等）已經全部移除。頁面只用語意 token，不直接用色階的某一階或品牌色。

### 文字四階

| Token | 用途 |
|---|---|
| `--text-primary` | 標題、最先要讀的字 |
| `--text-body` | 內文段落 |
| `--text-secondary` | 說明、圖說 |
| `--text-tertiary` | 日期、提示、meta。最暗但仍達 4.5:1 |
| `--text-faint` | 只當裝飾，不可用在要讀的字 |

## 字級

- 字級、行高、字距都是 token：`--type-display`、`--type-h1`……`--type-mono`，各自帶 `-lh`（行高），大標和標籤另有 `-ls`（字距）。
- 內文 17px、行高 1.9。小標題 22px、行高 1.5。大標 clamp(44–72px)。
- 需要閱讀的字至少 12px（`--type-caption`）。只有標籤可以用 11px。
- 一行中文 35–40 字（約 640–720px）。
- 這組字級是 2026-11-19 從 jakub.kr、interfaces.dev、Promptfolio 比對後定的。

### 字重

- 只有兩種：內文和介面 `--weight-regular`（400），大標 `--weight-light`（300）。
- 不要用 400 以上。思源宋體只載入 200/300/400，Instrument Serif 只有 400。更粗會變成瀏覽器合成的假粗體。
- 層級靠字級和文字階，不靠字重。

### 字距

- 只有三種：大標 `--type-display-ls`（-0.02em）、標籤 `--type-label-ls`（0.1em）、其他全部 0。
- 品牌字（頁尾的「T E K U E I」、報到頁的品牌名）例外，維持 0.3em 以上。
- 字距會加在最後一個字後面。置中的字距文字要補 `margin-right: -<字距>`。

### 標籤

- 標籤、日期、數值、快速鍵用 `--font-label`（等寬）、大寫、11–12px、字距 0.1em。
- 例：`JOURNAL`、`2026.11.19`、`6 MIN`。

## 間距

- 4px 為基礎，只有八階：`--space-1`（4）、`-2`（8）、`-3`（12）、`-4`（16）、`-6`（24）、`-8`（32）、`-12`（48）、`-24`（96）。2026-11-19 從十三階減到八階。
- 只用刻度上的值。刻度上沒有的數字，改成最近的一階。剛好在兩階中間時，取大的一階。
- 三種節奏：
  - 元件內：4–12px。
  - 段落之間：24px。
  - 區塊之間：`--section-gap`（96–128px，跟著螢幕寬度變）。
- 外面的間距永遠大於裡面的間距。
- 圓角：`--radius-sm` 8px（小控制項）、`--radius-md` 12px、`--radius-lg` 16px（卡片）、`--radius-full`（膠囊）。
- 完整示範在 Component Library 的「基礎」。間距、字級、色值都標在真的介面上，數值從 DOM 即時量測。

## 字型

| 用途 | Token | 字型 |
|---|---|---|
| 英文、中文 | `--font-serif` | Instrument Serif 400（含斜體），中文自動改用思源宋體（Noto Serif TC 200/300/400） |
| 標籤、數值 | `--font-label` | `ui-monospace`、Cascadia Mono、Consolas，中文用思源宋體 |
| 程式碼 | `--font-mono` | 同上，只用在程式碼卡 |

- Instrument Serif 排第一。它沒有中文字，所以中文自動改用思源宋體。
- Instrument Serif 只用在 18px 以上。更小的英文改用 `--font-label`。
- CSS 一律寫 `font-family: var(--font-serif)` 或 `var(--font-label)`。頁面自己的字型變數（例如 `--j-fd`）都指向它們。不要另外寫字型名稱。
- Canvas 不能用 CSS 變數，直接寫 `"Instrument Serif", "Noto Serif TC", "Source Han Serif TC", serif`。
- 兩種字型都由 `index.html` 從 Google Fonts 載入。
- 斜體只對英文有效。中文的 `font-style: italic` 會變成瀏覽器合成的斜體。

## 版面

### 最大寬度 1920（所有頁面都適用）

- 所有內容最寬 `--page-max`（1920px）。螢幕更寬時，內容置中，只有兩側的背景延伸。
- 「內容」包括文字、按鈕、圖片、Canvas 效果、跟內容對齊的裝飾（浮水印、軸線、格線）。
- 可以延伸到全寬的只有：背景色、背景漸層、整條的分隔線、導覽列和讀取條的底色。
- 寫法：區塊左右留白用 `calc(var(--page-gutter) + var(--page-pad))`。`--page-gutter` 在 1920 以下是 0。
- 絕對定位的裝飾：`left`、`right` 也要加上 `var(--page-gutter)`。
- 全寬的圖帶：寬度用 `min(100vw, var(--page-max))`，置中用 `margin`，不要用 `transform`（淡入動畫會覆寫 `transform`）。
- 會被螢幕邊緣切掉的大圖：寬螢幕上改在內容邊緣切掉，或讓邊緣淡出（例如 `mask-image`）。
- `heroFx.js` 的 `MAX_W` 要和 `--page-max` 一致。
- 驗收：用 2560px 寬的視窗打開頁面，文字和圖片都要在中間的 1920px 內。

- 左右留白用 `--page-pad`（`clamp(20px, 4vw, 68px)`）。
- Work 和 Journal 列表的欄寬是 `--page-column`（1104px）。容器寫 `max-width: var(--page-column-box)`，左右 padding 用 `var(--page-pad)`。
- Journal 列表：最新一篇用大卡片，其他文章是一列一篇（約 68px），按年份分組，年份標在左欄。
- Journal 列表上方有一排標籤篩選（`Tag`），一次選一個，網址帶 `?tag=`。每篇文章可以有多個標籤，英文大寫，中英文共用。標籤取代了舊的分類（category）。
- Journal 文章頁和列表用同一個外框（`--page-column-box`）。分隔線和頁尾從左邊緣到右邊緣。其他內容（返回連結、標題、內文、圖片、程式碼、引言、輪播）離外框左右各 8px（`--space-2`），和列表同寬。卡片和文字同寬。（2026-11-19 Wade 決定拿掉 656px 的上限。）
- 斷點：主要用 900px（平板以下）和 768px（手機）。新程式碼只用這兩個。
- 線：0.5px，顏色 `--ember-line` 或 `--ember-whisper`。格線和分隔線可以用虛線。

## 動態

- Easing：`--ease-touch`（`cubic-bezier(0.16, 0.08, 0.12, 1)`）。
- 時長：hover 0.3–0.4s。淡入 0.6s。依序淡入的間隔 70ms。
- 進場淡入用 `FadeIn`（`useReveal`，IntersectionObserver 觸發一次）。案例頁自己的 `case/CaseReveal` 也一樣。
- 位移只用 `opacity` 和 `transform`。淡入的位移寫在各頁 CSS（首頁 20px、Journal 24px）。
- 每個效果都要支援 `prefers-reduced-motion`：直接顯示最終畫面。
- 效果停下後，停止 `requestAnimationFrame`。畫面外不要繼續算。

### 招牌效果

每頁最多一個。它就是那一頁的記憶點。

| 檔案 | 用在哪 | 效果 |
|---|---|---|
| `src/lib/heroFx.js` | 首頁 Hero | hover 出現追蹤框和 ASCII，雙擊出現 glitch |
| `src/lib/glyphField.js` | Journal 頁首 | 字元雨，游標附近的字會亮 |
| `src/lib/fallScene.js` | About | 粒子人形往下掉，穿過刻字石板 |
| `src/lib/shatterImage.js` | Journal 頁尾 | 版畫圖由碎片從左到右組合，然後靜止 |

另有一個小互動：`src/lib/waterRipple.js`。按下語言按鈕時，水波從點擊處擴散，整頁文字跟著扭曲，1 秒內結束，語言在 0.3 秒時切換（`playWaterRipple(x, y, onSwap)`，動完自己移除）。扭曲用 SVG 濾鏡，掛在 `<html>` 上，因為只有根元素的 filter 不會改變 `position: fixed`。

新效果照同樣的方式寫：`mountXxx(canvas, opts)`，回傳 cleanup。檔案開頭用一兩行說明效果和數字的來源。

## Logo

- 頁首 logo：「TEKUEI CHU」後面接一個 8 × 2px、約 1 秒亮 1 秒暗的底線游標。只有頁首用到，所以直接寫在 SiteNav 和 NavOverlay 裡，不抽成元件（class `site-logo`）。
- 頁尾的品牌字維持字距拉開的「T E K U E I」。

## 文章內的 card

文章存在 R2 `data.json` 的 `journal`，在網站前台的編輯模式修改（見下方「編輯模式」）。`src/data/journal.js` 只是 R2 還沒有資料時的預設值。內文是 Tiptap 文件，由 `Editor` 編輯、`RichText` 顯示，格式寫在 `src/lib/richText.js`。

| 文件節點 | 元件 | 屬性 |
|---|---|---|
| `codeBlock` | `CodeCard` | 內容是程式碼。屬性：`language`（預設 `ts`）、`filename` |
| `imageCard` | `ImageCard` | `src`、`alt`（必填）、`caption`、`frame`（小圖置中留白） |
| `videoCard` | `VideoCard` | `src`、`poster`、`caption`、`loop` |
| `slidesCard` | `SlidesCard` | `slides`：`[{ src, alt, caption }]`。圖片輪播，寬螢幕比內文欄左右各寬 80px |

- 文字的部分（段落、前言、小標題、引言、清單）沿用 `journal.css` 的 `journal-post__*` 樣式。

- 外觀：`--paper-warm` 底、圓角 16px、1px 象牙白光環，不用邊框。樣式在 `src/styles/cards.css`。
- 程式碼字型用 `--font-mono`，顏色用 `--code-*` token。上色由 `src/lib/highlight.js` 處理，只支援類 C 語法。
- 介面文字（複製、播放等）在 `CARD_LABELS`。
- 三種 card 的示範和完整規範在 Component Library（見下一節）。

## 編輯模式

- 按 Ctrl+S（Mac 是 ⌘+S）。沒登入時出現密碼框，登入後進入編輯模式，編輯中則是儲存。
- 密碼框：半透明黑底加模糊（`backdrop-filter`），6 格數字，只顯示圓點。
- 編輯面板從右側滑出。寬螢幕時頁面往左移，讓編輯中的頁面當成即時預覽。
- 面板頂端只有三個按鈕：收合（>）、登出、儲存。儲存只有在有修改時才亮。
- 收合後右下角留一顆「編輯面板」按鈕，有未儲存的修改時帶一個琥珀色圓點。
- 清單排序用拖曳（⠿），不用上下箭頭。
- 編輯器工具列是一條圓角長條，按鈕的提示用 warm tooltip：第一次等 400ms，之後在按鈕間移動時立刻出現並滑過去。
- 面板一列一個欄位：左邊欄位名稱，右邊值。值看起來像一般文字，點進去才能編輯。
- 面板和密碼框只給 Wade 用，介面文字只寫中文。
- 只有 Journal 可以編輯。About、Work、案例頁刻意不提供編輯面板，內容改在程式碼裡。
- 面板沒有聚焦框：文字欄位和編輯器只顯示游標。按鈕保留鍵盤聚焦框。
- 面板的字小於 18px，所以一律用 `--font-label`：英文是等寬字，中文是思源宋體。日期、編號、狀態加標籤字距 0.1em。

## Component Library

- 開發模式打開 `/dev/component-library`。編排參考 Radix Themes 的文件：一頁一個主題或元件，網址是 `/dev/component-library/<id>`。
- 分類：概覽（開始使用、樣式、版面、資源）、主題（總覽、Color、Typography、Spacing、Radius、Motion、Breakpoints）、元件、效果、編輯模式。
- 每種頁面有自己的編排：指南用步驟和延伸閱讀，token 頁用色階或刻度、token 程式碼和表格，元件頁用示範、API Reference（每個零件一個小標題）、Examples、鍵盤、說明。
- 左側目錄固定不動。右側的「本頁」列出段落，寬度 1280px 以下隱藏。手機上目錄收成一顆按鈕。
- 文字在 `src/components/dev/`：`guides.data.js`（概覽和主題）、`componentLibrary.data.js`（元件）、`foundations.data.js`（字級、間距、色票）。這一頁只給開發用，只寫中文，不進正式 build。
- 新增或修改元件時，同一個變更裡更新這份資料。標「待修」的項目是已知問題。

## 無障礙

- 內文對比至少 4.5:1。內文字級 16px 以上。
- Canvas 是裝飾，加 `aria-hidden`。真正的標題、按鈕、連結要是 HTML 文字。
- 手機上要順暢。粒子類效果把 `devicePixelRatio` 上限設在 1.5–2。

## 待決定

這些項目程式碼和 PRODUCT.md 不一致。處理前先問使用者。

1. **大標字級**：各頁的大標（24–80px）還是頁面自己的數字，沒有全部換成 `--type-*`。內文、說明、標籤已在 2026-11-19 換完。
2. **Journal 頁尾的圖**（Wade 會換）：`src/assets/journal/footer-sea.webp` 是參考網站的截圖，上線前要換成有授權的圖。

和紙樣式已全部移除（2026-11-18）。不要再加回和紙、水墨、紙紋的元素。
