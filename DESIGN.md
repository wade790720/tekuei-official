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

Token 都在 `src/styles/tokens.css`。新程式碼只用語意 token（第二欄）。

| 用途 | Token | 值 |
|---|---|---|
| 頁面背景 | `--paper` | `#0b0b0d` obsidian |
| 卡片、區塊背景 | `--paper-warm` | `#181719` charcoal |
| 浮起的元素 | `--paper-cool` | `#242024` |
| 主要文字 | `--ink` | `#f4eee7` ivory |
| 次要文字 | `--ink-70`、`--ink-65` | ivory 72%、66% |
| 裝飾文字 | `--ink-40`、`--ink-22` | ivory 40%、22%。不可用在需要閱讀的文字 |
| 強調 | `--ember` | `#c99a63` gold |
| hover、光暈 | `--ember-soft` | `#e4b57b` amber |
| 線 | `--ember-line` | gold 30% |
| 細線 | `--ember-whisper` | gold 14% |

- 比例：約 70% 黑與炭灰、25% 象牙白文字、5% 金色。
- 金色只用在小地方：標籤、目前所在的導覽項目、hover、細線。不要用金色填大面積。
- `--ink-30`、`--gold-10`、`--paper-60-*`、`--ease-haunt` 是舊名稱。只為了相容保留，新程式碼不要用。
- 頁面自己的變數（例如 `--j-lamp`、`--home-ember`）必須指向全站 token，不可以寫色碼。

## 字型

| 用途 | 現況 |
|---|---|
| 英文（拉丁字母、數字） | Instrument Serif 400，含斜體 |
| 中文 | 思源宋體。Google Fonts 名稱是 Noto Serif TC，載入 200/300/400 |
| 等寬（字元效果） | `ui-monospace`、Cascadia Mono、Consolas |

- 兩種字型合在一個 token：`--font-serif`。Instrument Serif 排第一。它沒有中文字，所以中文自動改用思源宋體。
- CSS 一律寫 `font-family: var(--font-serif)`。頁面自己的字型變數（例如 `--j-fd`、`--home-fc`）都指向它。不要另外寫字型名稱。
- Canvas 不能用 CSS 變數，直接寫 `"Instrument Serif", "Noto Serif TC", "Source Han Serif TC", serif`。
- 兩種字型都由 `index.html` 從 Google Fonts 載入。
- 斜體只對英文有效。思源宋體沒有斜體，中文的 `font-style: italic` 會變成瀏覽器合成的斜體。

- 標籤：大寫或字母間加空格，字距 `--ls-label`（0.46em）或 0.3em，字級 10–11px。
- 標題字距 `--ls-title`（0.05em）。內文字距 `--ls-body`（0.025em）。
- 字距會加在最後一個字後面。置中的字距文字要補 `margin-right: -<字距>`。

## 版面

### 最大寬度 1920（所有頁面都適用）

- 所有內容最寬 `--page-max`（1920px）。螢幕更寬時，內容置中，只有兩側的背景延伸。
- 「內容」包括文字、按鈕、圖片、Canvas 效果、跟內容對齊的裝飾（浮水印、軸線、格線）。
- 可以延伸到全寬的只有：背景色、背景漸層、整條的分隔線、導覽列和讀取條的底色。
- 寫法：區塊左右留白用 `calc(var(--page-gutter) + var(--page-pad))`。`--page-gutter` 在 1920 以下是 0。
- 絕對定位的裝飾：`left` / `right` 也要加上 `var(--page-gutter)`。
- 全寬的圖帶：寬度用 `min(100vw, var(--page-max))`，置中用 `margin`，不要用 `transform`（淡入動畫會覆寫 `transform`）。
- 會被螢幕邊緣切掉的大圖：寬螢幕上改在內容邊緣切掉，或讓邊緣淡出（例如 `mask-image`）。
- `heroFx.js` 的 `MAX_W` 要和 `--page-max` 一致。
- 驗收：用 2560px 寬的視窗打開頁面，文字和圖片都要在中間的 1920px 內。

- 左右留白用 `--page-pad`（`clamp(20px, 4vw, 68px)`）。
- 斷點：主要用 900px（平板以下）和 768px（手機）。新程式碼只用這兩個。
- 線：0.5px，顏色 `--ember-line` 或 `--ember-whisper`。格線和分隔線可以用虛線。

## 動態

- Easing：`--ease-touch`（`cubic-bezier(0.16, 0.08, 0.12, 1)`）。
- 時長：hover 0.3–0.4s。淡入 0.6s。依序淡入的間隔 70ms。
- 進場淡入用 `HomeFadeIn` 或 `Reveal`（都用 `useReveal`，IntersectionObserver 觸發一次）。
- 位移只用 `opacity` 和 `transform`。淡入的位移約 6px。
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

新效果照同樣的方式寫：`mountXxx(canvas, opts)`，回傳 cleanup。檔案開頭用一兩行說明效果和數字的來源。

## 文章內的 card

文章存在 R2 `data.json` 的 `journal`，在網站前台的編輯模式修改（見下方「編輯模式」）。`src/data/journal.js` 只是 R2 還沒有資料時的預設值。內文是 Tiptap 文件，由 `PostEditor` 編輯、`PostDoc` 顯示，格式寫在 `src/lib/postDoc.js`。

| 文件節點 | 元件 | 屬性 |
|---|---|---|
| `codeBlock` | `CodeCard` | 內容是程式碼；`language`（預設 `ts`）、`filename` |
| `imageCard` | `ImageCard` | `src`、`alt`（必填）、`caption`、`frame`（小圖置中留白） |
| `videoCard` | `VideoCard` | `src`、`poster`、`caption`、`loop` |

- 文字的部分（段落、前言、小標題、引言、清單）沿用 `journal.css` 的 `journal-post__*` 樣式。

- 外觀：`--paper-warm` 底、圓角 16px、1px 象牙白光環，不用邊框。樣式在 `src/styles/postCards.css`。
- 程式碼字型用 `--font-mono`，顏色用 `--code-*` token。上色由 `src/lib/highlight.js` 處理，只支援類 C 語法。
- 介面文字（複製、播放等）在 `POST_CARD_LABELS`。
- 三種 card 的示範和完整規範在 Component Library（見下一節）。

## 編輯模式

- 按 Ctrl+S（Mac 是 ⌘+S）。沒登入時出現密碼框，登入後進入編輯模式，編輯中則是儲存。
- 密碼框：半透明黑底加模糊（`backdrop-filter`），6 格數字，只顯示圓點。
- 編輯面板從右側滑出。寬螢幕時頁面往左移，讓編輯中的頁面當成即時預覽。
- 面板頂端只有三個按鈕：收合（>）、登出、儲存。儲存只有在有修改時才亮。
- 收合後右下角留一顆「編輯面板」按鈕，有未儲存的修改時帶一個琥珀色圓點。
- 清單排序用拖曳（⠿），不用上下箭頭。
- 面板一列一個欄位：左邊欄位名稱，右邊值。值看起來像一般文字，點進去才能編輯。
- 面板和密碼框只給 Wade 用，介面文字只寫中文。
- 只有 Journal 可以編輯。About、Work、案例頁刻意不提供編輯面板，內容改在程式碼裡。
- 面板沒有聚焦框：文字欄位和編輯器只顯示游標。按鈕保留鍵盤聚焦框。

## Component Library

- 開發模式打開 `/dev/component-library`。這一頁列出每個可重複使用的元件：用途、什麼時候用、不要用在哪、Props、用法、注意事項，能示範的附即時示範。
- 規範文字在 `src/components/dev/componentLibrary.data.js`。這一頁只給開發用，所以只寫中文，不進正式 build。
- 新增或修改元件時，同一個變更裡更新這份資料。標「待修」的項目是已知問題。

## 無障礙

- 內文對比至少 4.5:1。內文字級 16px 以上。
- Canvas 是裝飾，加 `aria-hidden`。真正的標題、按鈕、連結要是 HTML 文字。
- 手機上要順暢。粒子類效果把 `devicePixelRatio` 上限設在 1.5–2。

## 待決定

這些項目程式碼和 PRODUCT.md 不一致。處理前先問使用者。

1. **字型統一**（之後處理）：字型已定為英文 Instrument Serif、中文思源宋體。各頁的字級、字重、斜體還沒統一。
2. **小字**（跟第 1 項一起處理）：Journal 和 footer 有不少 10–13px 的文字，低於「內文 16px 以上」。標籤可以小，需要閱讀的文字要調整。
3. **Journal 頁尾的圖**（Wade 會換）：`src/assets/journal/footer-sea.webp` 是參考網站的截圖，上線前要換成有授權的圖。

和紙樣式已全部移除（2026-11-18）。不要再加回和紙、水墨、紙紋的元素。
