# DESIGN.md

TEKUEI 全站共用的視覺與動態規則。改畫面、樣式或動畫之前讀這份檔案。

- 為什麼這樣設計：[PRODUCT.md](PRODUCT.md)。
- 怎麼寫程式：[AGENTS.md](AGENTS.md)。
- 某一頁長什麼樣：[PAGES.md](PAGES.md)。
**以誰為準：** 這份檔案和 `src/styles/tokens.css` 的值不一致時，以 `tokens.css` 為準，並告訴使用者哪裡不一致。

## 方向

- 安靜的版面，配一個精準的記憶點。
- 深色底、象牙白字、少量金色。
- 喜歡：乾淨整齊的格線、量測和標註線、暗淡的字元背景、真實影像轉成字元或粒子的質感。
- 不要：鮮豔的大色塊、超大的字、復古風、3D 遊戲感、插畫角色、太空的極簡、和紙、水墨、紙紋。

## 用詞

規範檔和 Component Library 裡，這些詞只有一個意思。

| 詞 | 只指 | 其他東西改叫 |
|---|---|---|
| 區塊 | 編輯器裡的一個 block（段落、標題、圖片……） | 頁面的 section 叫「區段」，可以捲動的容器叫「捲動區」或「容器」 |
| 區段 | 頁面上的一個 section，彼此間距是 `--section-gap` | |
| 面板 | 編輯面板（`SidePanel`） | `Drawer`、選單直接寫名稱 |
| 提示 | Tooltip | 給讀者的說明小字叫「操作說明」，音效的類別叫「狀態音」 |
| 卡片 | 文章內的 `CodeCard`、`ImageCard`、`VideoCard`、`SlidesCard`，以及它們共用的 `Card` | 不寫「卡」或「card」 |
| 外殼 | `Card` 的底色、圓角和光環 | |
| 外欄 | Journal 文章的 696px 欄寬（680px 加左右各 8px） | 選取的框叫「框線」，鍵盤聚焦的叫「聚焦框」 |
| 首頁 Hero | 首頁唯一的一屏（錦鯉池） | 不寫「第一屏」 |
| 圖說 | 圖片和影片下方的 `caption` | |

## 顏色

Token 都在 `src/styles/tokens.css`。底層是兩組 12 階色階：`--gray-1…12`、`--accent-1…12`，各有透明版本（`-a1…a12`）。語意 token 指向色階，新程式碼只用這張表的語意 token。

| 用途 | Token | 值 |
|---|---|---|
| 頁面背景 | `--surface-0` | `#0b0b0d` obsidian |
| 卡片、區段背景 | `--surface-1` | `#181719` charcoal |
| 浮起的元素 | `--surface-2` | `#242024` |
| 載入中的佔位方塊（Skeleton） | `--surface-3` | ivory 14% 混入 obsidian |
| 分隔線、格線 | `--line` | ivory 8% |
| 邊框、要看得到的分隔 | `--line-strong` | ivory 14% |
| 強調、聚焦框 | `--ember` | `#c99a63` gold |
| hover、光暈 | `--ember-soft` | `#e4b57b` amber |
| 目前頁的底線、裝飾線 | `--ember-line` | gold 30% |
| hover 的淡底、選取的標籤底色 | `--ember-whisper` | gold 14% |
| 錯誤 | `--danger` | `#e8907c` |
| 成功，只用在狀態燈 | `--success` | `#7fc08f` |

- 比例：約 70% 黑與炭灰、25% 象牙白文字、5% 金色。
- 金色只用在三個地方：目前頁、聚焦、hover。一般的邊框和分隔線用 `--line`。
- 頁面自己的變數（例如 `--j-lamp`、`--hh-gold`）必須指向全站 token，不可以寫色碼。
- 頁面只用語意 token，不直接用色階的某一階或品牌色。舊的名稱（`--paper*`、`--ink-*`、`--gold-10*`、`--ls-*` 等）已經全部移除。

```css
/* BAD：寫色碼，或直接用色階 */
.journal-row:hover { color: #c99a63; }
.journal-page { --j-lamp: var(--accent-9); }

/* GOOD：語意 token；頁面變數指向語意 token */
.journal-row:hover { color: var(--ember); }
.journal-page { --j-lamp: var(--ember); }
```

### 文字四階

| Token | 用途 |
|---|---|
| `--text-primary` | 標題、最先要讀的字 |
| `--text-body` | 內文段落 |
| `--text-secondary` | 說明、圖說 |
| `--text-tertiary` | 日期、操作說明、meta。最暗但仍達 4.5:1 |
| `--text-faint` | 只當裝飾，不可用在要讀的字 |

## 字級

- 字級、行高、字距都是 token：`--type-display`、`--type-h1`……`--type-mono`，各自帶 `-lh`（行高），大標和標籤另有 `-ls`（字距）。
- 字級 token 用 rem，讀者在瀏覽器調大字級時，網站跟著變大。根字級是 16px，token 旁的註解寫 px。
- 內文 17px、行高 1.9。小標題 22px、行高 1.5。大標 clamp(44–72px)。
- 例外：Journal 文章的段落和清單照 Editor.js 的間距，行高 1.6，段落之間 12px（`--space-3`）。
- 需要閱讀的字至少 12px（`--type-caption`）。只有標籤可以用 11px。
- 一行中文 35–40 字（約 640–720px）。英文在同一欄約 119 個字元，比一般建議的 60–75 長。這是刻意的：文字和圖片同寬優先（見 PAGES.md）。
- 換行：標題用 `text-wrap: balance`，段落、清單、引言、圖說用 `text-wrap: pretty`，避免最後一行只剩一個字。全站寫在 `src/index.css`。

### 字重

- 只有兩種：內文和介面 `--weight-regular`（400），大標 `--weight-light`（300）。
- 不要用 400 以上。思源宋體只載入 300/400，Instrument Serif 只有 400。更粗會變成瀏覽器合成的假粗體。
- 層級靠字級和文字階，不靠字重。

### 字距

- 只有三種：大標 `--type-display-ls`（-0.02em）、標籤 `--type-label-ls`（0.1em）、其他全部 0。
- 品牌字（頁尾的「T E K U E I」、報到頁的品牌名）例外，維持 0.3em 以上。
- 字距會加在最後一個字後面。置中的字距文字要補 `margin-right: -<字距>`。

### 標籤

- 標籤、日期、數值、快速鍵用 `--font-label`（等寬）、大寫、11–12px、字距 0.1em。
- 例：`JOURNAL`、`2026.11.19`、`6 MIN`。

## 間距

- 4px 為基礎，只有八階：`--space-1`（4）、`-2`（8）、`-3`（12）、`-4`（16）、`-6`（24）、`-8`（32）、`-12`（48）、`-24`（96）。
- 只用刻度上的值。刻度上沒有的數字，改成最近的一階。剛好在兩階中間時，取大的一階。
- 三種節奏：
  - 元件內：4–12px。
  - 段落之間：24px。Journal 文章是 12px（見「字級」）。
  - 區段之間：`--section-gap`（96–128px，跟著螢幕寬度變）。
- 外面的間距永遠大於裡面的間距。
- 圓角：`--radius-sm` 8px（小控制項）、`--radius-md` 12px、`--radius-lg` 16px（卡片）、`--radius-full`（膠囊）。
- 完整示範在 Component Library 的「基礎」。間距、字級、色值都標在真的介面上，數值從 DOM 即時量測。

```css
/* BAD：刻度外的數字 */
.case-meta { gap: 20px; margin-bottom: 40px; }

/* GOOD：20 在 16 和 24 中間，取大的一階；40 同理 */
.case-meta { gap: var(--space-6); margin-bottom: var(--space-12); }
```

## 字型

| 用途 | Token | 字型 |
|---|---|---|
| 英文、中文 | `--font-serif` | Instrument Serif 400（含斜體），中文自動改用思源宋體（Noto Serif TC 300/400） |
| 標籤、數值 | `--font-label` | `ui-monospace`、Cascadia Mono、Consolas，中文用思源宋體 |
| 程式碼 | `--font-mono` | 同上，只用在 `CodeCard` |

- Instrument Serif 排第一。它沒有中文字，所以中文自動改用思源宋體。
- Instrument Serif 只用在 18px 以上。更小的英文改用 `--font-label`。
- 例外：英文的文章內文用 `--type-body`（17px）的 Instrument Serif，和中文內文同一個字級，讓兩種語言的文章看起來一致。
- 例外：導覽連結（頁首導覽列、語言按鈕、頁尾的連結）用 Instrument Serif，字級 `--type-nav`（13–15px）。頁首和頁尾的連結要一樣。這是刻意的，不要改成 `--font-label`。
- CSS 一律寫 `font-family: var(--font-serif)` 或 `var(--font-label)`。頁面自己的字型變數（例如 `--j-fd`）都指向它們。不要另外寫字型名稱。
- Canvas 不能用 CSS 變數。字型和顏色從 canvas 元素的 `getComputedStyle` 讀（參考 `glyphField.js`）。讀不到時，直接寫 `"Instrument Serif", "Noto Serif TC", "Source Han Serif TC", serif`。
- 兩種字型都由 `index.html` 從 Google Fonts 載入。
- 斜體只對英文有效。中文的 `font-style: italic` 會變成瀏覽器合成的斜體。

## 版面

### 最大寬度 1920（所有頁面都適用）

- 所有內容最寬 `--page-max`（1920px）。螢幕更寬時，內容置中，只有兩側的背景延伸。
- 「內容」包括文字、按鈕、圖片、Canvas 效果、跟內容對齊的裝飾（浮水印、軸線、格線）。
- 可以延伸到全寬的只有：背景色、背景漸層、整條的分隔線、導覽列和讀取條的底色。
- 寫法：區段左右留白用 `calc(var(--page-gutter) + var(--page-pad))`。`--page-gutter` 在 1920 以下是 0。
- 絕對定位的裝飾：`left`、`right` 也要加上 `var(--page-gutter)`。
- 全寬的圖帶：寬度用 `min(100vw, var(--page-max))`，置中用 `margin`，不要用 `transform`（淡入動畫會覆寫 `transform`）。
- 會被螢幕邊緣切掉的大圖：寬螢幕上改在內容邊緣切掉，或讓邊緣淡出（例如 `mask-image`）。
- `heroFx.js` 的 `MAX_W` 要和 `--page-max` 一致。
- 驗收：用 2560px 寬的視窗打開頁面，文字和圖片都要在中間的 1920px 內。

```css
/* BAD：寬螢幕上內容貼到螢幕邊緣；transform 會被 .fade-in 蓋掉 */
.case-band { padding-inline: var(--page-pad); }
.case-band__img { width: 100vw; left: 50%; transform: translateX(-50%); }

/* GOOD */
.case-band { padding-inline: calc(var(--page-gutter) + var(--page-pad)); }
.case-band__img { width: min(100vw, var(--page-max)); margin-inline: auto; }
```

### 欄寬和其他

- 左右留白用 `--page-pad`（`clamp(20px, 4vw, 68px)`）。
- 列表的欄寬（Work、Journal）是 `--page-column`（1104px）。容器寫 `max-width: var(--page-column-box)`，左右 padding 用 `var(--page-pad)`。
- 閱讀的欄寬（Journal 文章、案例內文）是 `--page-reading`（680px）。
- 各頁怎麼用這些欄寬，見 PAGES.md。
- 斷點：主要用 900px（平板以下）和 768px（手機）。新程式碼只用這兩個。
- 線：0.5px，顏色 `--ember-line` 或 `--ember-whisper`。格線和分隔線可以用虛線。

## 動態

- Easing：`--ease-touch`（`cubic-bezier(0.16, 0.08, 0.12, 1)`）。
- 時長只用六個 token（`tokens.css`）：

  | Token | 值 | 用途 |
  |---|---|---|
  | `--duration-exit` | 90ms | 選單和 Tooltip 關閉 |
  | `--duration-fast` | 150ms | 小控制項：按鈕、選單項目、輸入框 |
  | `--duration-base` | 300ms | hover、Drawer 關閉、Accordion |
  | `--duration-slow` | 400ms | Drawer 打開、導覽、比較慢的 hover |
  | `--duration-fade` | 600ms | 淡入 |
  | `--duration-reveal` | 800ms | 頁面進場、縮圖放大 |

- 延遲（delay）和依序淡入的間隔（70ms）直接寫數字，不用 token。
- 關閉比打開快。手機選單是例外，打開 0.25s、關閉約 0.2s，由 JS 的 `OVERLAY_MS` 控制。
- JS 要等動畫結束時，用 `tokenMs('--duration-xxx')`（`src/lib/tokenMs.js`）讀 token，不另寫數字。`usePresence` 直接收 token 名稱。
- 過渡不超過 1s。
- 每個 `transition` 和 `animation` 都寫 easing。一般用 `--ease-touch`，循環動畫可以用 `linear` 或 `steps()`。
- 循環動畫的時長寫成變數，例如 `--duration-shake`（tokens.css，兩處共用）、`--spin-ms`、`--skeleton-ms`。
- 關閉的元素用 `usePresence` 留到退場動畫播完再移除。
- 會打開和關閉的選單和 Drawer 用 `transition`，不用 keyframes。進場寫在 `@starting-style`，退場寫在 `[data-closing]`。這樣動到一半改變方向時，會從目前的位置接著動。Tooltip 例外，維持 keyframes：它只淡出 90ms，而 transitions-agent 會把它滑動用的 300ms 誤判成打開的時長。
- 依狀態切換的圖示（複製 → 打勾、播放 → 暫停）用 `icon-swap`：兩個圖示放在同一格，隱藏的那個加 `data-off`，用 opacity、`scale(0.25)`、`blur(4px)` 交叉淡入淡出，時長 `--duration-fast`。transition 在第一次渲染時不會播放，所以頁面剛載入時不會動。
- `Button` 按下時縮成 `scale(0.96)`，不要小於 0.95。
- 進場淡入：在元素加上 `fade-in` class。`src/lib/reveal.js` 的 `mountReveal` 在 App.jsx 掛一次，元素露出 15% 時加上 `is-visible`，只觸發一次。不要為淡入包元件。
- 位移只用 `opacity` 和 `transform`。淡入的位移寫在各頁 CSS（首頁 20px，Journal 見 PAGES.md）。
- 每個效果都要支援 `prefers-reduced-motion`：直接顯示最終畫面。
- 效果停下後，停止 `requestAnimationFrame`。畫面外不要繼續算。
- 載入中：資料還沒回來時，用 `Skeleton` 排出內容的形狀。不要先顯示預設資料再整批換掉。
- 可以捲動的容器用 `ScrollShadow`：還有內容的那一邊淡出 40px（`CodeCard` 32px）。

### 招牌效果

每頁最多一個。它就是那一頁的記憶點。

| 檔案 | 用在哪 | 效果 |
|---|---|---|
| `src/lib/koiPond.js` | 首頁 Hero | 字元拼成的錦鯉在文字後面游，點一下水面丟飼料，附近的錦鯉游過來吃 |
| `src/lib/grainHaze.js` | 首頁 Hero，錦鯉的背景；About 的背景 | 一塊柔邊的光碎成沙粒，明暗很慢地流動。在首頁它和錦鯉算同一個招牌效果，在 About 它是那一頁唯一的效果 |
| `src/labs/living-portrait/heroFx.js` | Labs 的 Living Portrait | hover 出現追蹤框和 ASCII，雙擊出現 glitch |
| `src/lib/glyphField.js` | Journal 頁首 | 字元雨，游標附近的字會亮 |
| `src/labs/falling-figure/fallScene.js` | About | 粒子人形往下掉，穿過刻字石板 |
| `src/labs/shatter-footer/shatterImage.js` | Labs 的 Shatter Footer | 版畫圖由碎片從左到右組合，然後靜止 |

另有一個小互動：`src/lib/waterRipple.js`。按下語言按鈕時，水波從點擊處擴散，整頁文字跟著扭曲，1 秒內結束，語言在 0.3 秒時切換（`playWaterRipple(x, y, onSwap)`，動完自己移除）。扭曲用 SVG 濾鏡，掛在 `<html>` 上，因為只有根元素的 filter 不會改變 `position: fixed`。

新效果照同樣的方式寫：`mountXxx(canvas, opts)`，回傳 cleanup。檔案開頭用一兩行說明效果和數字的來源。

```js
// BAD：效果寫在元件裡，沒有 cleanup，減少動態效果時照樣跑
useEffect(() => { const loop = () => { draw(); requestAnimationFrame(loop) }; loop() }, [])

// GOOD：src/lib/xxx.js
export function mountXxx(canvas) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    drawFinalFrame(canvas)
    return () => {}
  }
  let raf = requestAnimationFrame(function tick() { draw(); raf = requestAnimationFrame(tick) })
  return () => cancelAnimationFrame(raf)
}
// 元件
useEffect(() => mountXxx(canvas.current), [])
```

### 音效

- 點擊連結和按鈕時有短音效（`src/lib/uiSound.js`），用 Web Audio 即時合成，沒有音檔。參數照抄 recent.design，授權不明，上線前要確認。
- 預設開，沒有開關。減少動態效果開啟時不出聲。
- `App.jsx` 在 document 掛一個點擊監聽，新元件不用另外接。預設：選單項目 `select`、儲存 `press`、連結 `pressGhost`、其他按鈕 `pressSoft`。
- 要換音效或靜音，在元素上寫 `data-sound="<名稱>"` 或 `data-sound="off"`。
- 會連續點很多次的控制項不出聲。目前是 `Tag` 篩選按鈕。全部音效在 Component Library 的 playSound 頁可以試聽。

## 無障礙

- 內文對比至少 4.5:1。內文字級 16px 以上。
- 點擊範圍：手機上至少 44 × 44px，桌面的編輯面板至少 40 × 40px。外觀小的按鈕用 `::before` 撐大，有 `overflow: hidden` 的元素改用 padding 加上相同的負 margin。相鄰的點擊範圍不能重疊，排得太密時，點擊範圍只撐到兩者間距的一半。
- 圖示線寬一律 1.5（文字都是 400 字重）。
- 聚焦框用 `--ember`（7.76:1）。`--ember-line` 只有 1.69:1，不可用在聚焦框。聚焦框和元件邊界至少 3:1。
- 狀態不能只靠顏色。例如選取的標籤，除了金色框線，還要有填滿的底色。
- `<html lang>` 跟著語言切換：中文 `zh-Hant`，英文 `en`。一段文字的語言和頁面不同時，在那一段加 `lang`。
- 每頁的主要內容包在一個 `<main>` 裡。換頁後，焦點移到新頁面的 `<h1>`（`App.jsx` 的 `ScrollClasses`）。
- 蓋住整頁的浮層（手機選單）打開時，`#root` 加上 `inert`，Tab 不會跑到被蓋住的頁面。浮層要 portal 到 `<body>`。
- 頁首是固定的，`html` 設 `scroll-padding-top: var(--space-24)`，焦點和錨點不會停在頁首底下。
- 只用 `box-shadow` 畫邊緣的元件，在 `@media (forced-colors: active)` 裡補一條 `CanvasText` 邊框。
- hover 樣式寫在 `@media (hover: hover)` 裡，手機點一下之後不會一直亮著。和 `:focus-visible`、`.is-active` 寫在同一條規則時，只把 `:hover` 拆出去，其他狀態留在原處。
- Canvas 是裝飾，加 `aria-hidden`。真正的標題、按鈕、連結要是 HTML 文字。
- 手機上要順暢。粒子類效果把 `devicePixelRatio` 上限設在 1.5–2。

## Do

- 先查 Component Library，有就用，差一點就加變體。
- 顏色、間距、字級、圓角、easing 都用 token。
- 層級靠字級和文字階。
- 金色只給目前頁、聚焦、hover。
- 每個動畫都有減少動態效果的版本，停下後停止 `requestAnimationFrame`。
- 用 375px、1440px、2560px 三種寬度看過畫面。

## Don't

- 不寫色碼、不寫刻度外的間距、不直接用色階的某一階。
- 不用 400 以上的字重，不對中文用斜體。
- 不在帶 `fade-in` 的元素上用 `transform` 置中。淡入會蓋掉它。
- 不在 Canvas 裡寫 `var(--xxx)`。Canvas 讀不到 CSS 變數，要用 `getComputedStyle`。
- 不把 `filter` 掛在 `<html>` 以外的大容器上。它會讓裡面的 `position: fixed` 失效。
- 置中的字距文字不要忘了補負的 `margin-right`。
- 不讓內容超出中間的 1920px。改 `--page-max` 時，同時改 `heroFx.js` 的 `MAX_W`。
- 一頁不放兩個招牌效果。
- 不加回和紙、水墨、紙紋的元素。

## 待決定

這些項目程式碼和 PRODUCT.md 不一致。處理前先問使用者。

1. **大標字級**：各頁的大標（24–80px）還是頁面自己的數字，沒有全部換成 `--type-*`。內文、說明、標籤已經換完。
