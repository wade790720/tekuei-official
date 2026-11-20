# PAGES.md

各頁和各功能的規格。全站共用的視覺規則在 [DESIGN.md](DESIGN.md)。這份檔案只寫「某一頁長什麼樣、怎麼動」。
## 全站

- 點連結換頁時從最上面開始。瀏覽器的上一頁、下一頁回到離開時的捲動位置（`App.jsx` 的 `ScrollClasses`）。
- 頁首 logo：「TEKUEI CHU」後面接一個 8 × 2px、約 1 秒亮 1 秒暗的底線游標。只有頁首用到，所以直接寫在 SiteNav 和 NavOverlay 裡，不抽成元件（class `site-logo`）。
- 頁尾的品牌字維持字距拉開的「T E K U E I」。

## Journal 列表

- 欄寬 `--page-column`（見 DESIGN.md「版面」）。
- 最新一篇用大卡片，其他文章是一列一篇（約 68px），按年份分組，年份標在左欄。
- 列表上方有一排標籤篩選（`Tag`），一次選一個，網址帶 `?tag=`。
- 每篇文章可以有多個標籤，英文大寫，中英文共用。標籤取代了舊的分類（category）。

## Journal 文章頁

- 最上面是 `Breadcrumbs`：首頁、Journal、文章標題。
- 文末（上一篇、下一篇下面）有「── 返回 Journal」。
- 從列表點進來時，Breadcrumbs 的 Journal 和文末的返回連結都等於「上一頁」，回到列表原本的捲動位置和標籤篩選。從別處進來時，連到 `/journal`。
- 內容寬 `--page-reading`（680px，17px 字一行 40 字），比列表窄。文字、圖片、程式碼、引言、輪播全部同寬。
- 外框是 680px 加左右各 8px（`--space-2`）。分隔線和文末的頁尾從外框左邊緣到右邊緣。
- 段落和清單的行高、間距是例外，見 DESIGN.md「字級」。
- 淡入：位移 8px，加上 `blur(8px)` 到清楚，0.8s。頁首的 Breadcrumbs、meta、編號、標題、副標依序出現，間隔 80ms（`--i`）。
- 內文不淡入，直接顯示。讀長文時畫面不要一直在動。

## Journal 頁尾

- 四欄：品牌、Explore、Latest、Contact。Latest 列出最新三篇文章，跟著 Journal 資料更新。第四欄的內容之後可以換。
- 欄標題和品牌下的「德 溎」用 `--text-tertiary`，不用金色。連結 hover 才變金色。
- 900px 以下排成兩欄兩列。768px 以下品牌字縮成 18px、字距 0.3em，維持一行。

## 案例頁

- 內文段落（`case-prose`）最寬 `--page-reading`，字級 `--type-body`。
- 標題、交付項目、時間軸維持外框寬度。

## 文章內的 card

文章存在 R2 `data.json` 的 `journal`，在前台的編輯模式修改。`src/data/journal.js` 只是 R2 還沒有資料時的預設值，不要直接改裡面的文章。內文是 Tiptap 文件，由 `Editor` 編輯、`RichText` 顯示，格式寫在 `src/lib/richText.js`。

| 文件節點 | 元件 | 屬性 |
|---|---|---|
| `codeBlock` | `CodeCard` | 內容是程式碼。屬性：`language`（預設 `ts`）、`filename` |
| `imageCard` | `ImageCard` | `src`、`alt`（必填）、`caption`、`frame`（小圖置中留白） |
| `videoCard` | `VideoCard` | `src`、`poster`、`caption`、`loop`。`src` 是影片檔（mp4）或 YouTube 連結，YouTube 用它自己的播放器 |
| `slidesCard` | `SlidesCard` | `slides`：`[{ src, alt, caption }]`。圖片輪播，寬螢幕比內文欄左右各寬 80px |

- 文字的部分（段落、前言、小標題、引言、清單）沿用 `journal.css` 的 `journal-post__*` 樣式。
- 編輯器裡的圖片卡就是正式的 `ImageCard`，圖說在圖片下方直接輸入。替代文字、網址、小圖置中收在右上角的「⋯」裡。沒有替代文字時顯示「缺替代文字」。
- 外觀：四種 card 都用 `Card` 當外框：`--surface-1` 底、圓角 16px、1px 象牙白光環，不用邊框（`src/styles/card.css`）。各 card 自己的樣式在 `src/styles/cards.css`。
- 程式碼字型用 `--font-mono`，顏色用 `--code-*` token。上色由 `src/lib/highlight.js` 處理，只支援類 C 語法。
- 介面文字（複製、播放等）在 `CARD_LABELS`。
- 各 card 的示範和完整規範在 Component Library。

## 編輯模式

- 按 Ctrl+S（Mac 是 ⌘+S）。沒登入時出現密碼框，登入後進入編輯模式，編輯中則是儲存。
- 密碼是 Cloudflare Pages 的 `ADMIN_SECRET`，必須是 6 位數字。
- 密碼框：半透明黑底加模糊（`backdrop-filter`），6 格數字，只顯示圓點。
- 文章的內文直接在頁面上編輯（`JournalPostBody`），樣式和正式頁相同。上方沒有固定的工具列。
- 選取文字時，選取處上方浮出格式工具列：轉換成（段落、前言、標題、引言、清單）、粗體、斜體、底線、連結、行內程式碼。
- 格式工具列是一條圓角長條，按鈕的提示用 warm tooltip：第一次等 400ms，之後在按鈕間移動時立刻出現並滑過去。
- 空段落在網站上顯示成一行空白，和編輯器一樣。
- 滑鼠移到內文的任何一行，左邊出現「+」和「⠿」（和 Notion、Editor.js 一樣）。「+」在這一行下面新增區塊，這一行是空的時直接換掉它。「⠿」拖曳移動整個區塊，點一下打開區塊選單（刪除）。
- 「+」和「⠿」都是 24px 的圖示按鈕，上下置中對齊。「+」離文字 12px。游標停在空行時，那一行也出現「+」。手機和 768px 以下只在空行顯示「+」，放在空行裡面。
- 編輯面板從右側滑出，只放標題、英文副標、標籤、日期、閱讀時間、摘要。寬螢幕時頁面往左移，讓出面板的位置。
- 面板頂端的按鈕：收合（>）、預覽（只有文章頁）、登出、儲存。儲存只有在有修改時才亮。
- 「預覽」切換成正式頁的畫面，不用儲存或登出。
- 收合後右下角留一顆「編輯面板」按鈕，有未儲存的修改時帶一個琥珀色圓點。
- 清單排序用拖曳（⠿），不用上下箭頭。
- 面板一列一個欄位：左邊欄位名稱，右邊值。值看起來像一般文字，點進去才能編輯。
- 面板沒有聚焦框：文字欄位和編輯器只顯示游標。按鈕保留鍵盤聚焦框。
- 面板的字小於 18px，所以一律用 `--font-label`：英文是等寬字，中文是思源宋體。日期、編號、狀態加標籤字距 0.1em。
- 面板和密碼框只給 Wade 用，介面文字只寫中文。
- 只有 Journal 可以編輯。About、Work、案例頁刻意不提供編輯面板，內容改在程式碼裡。

## Component Library

- 開發模式打開 `/dev/component-library`。編排參考 Radix Themes 的文件：一頁一個主題或元件，網址是 `/dev/component-library/<id>`。
- 分類：概覽（開始使用、樣式、版面、資源）、主題（總覽、Color、Typography、Spacing、Radius、Motion、Breakpoints）、元件、效果、工具。
- 每種頁面有自己的編排：指南用步驟和延伸閱讀，token 頁用色階或刻度、token 程式碼和表格，元件頁用示範、API Reference（每個零件一個小標題）、Examples、鍵盤、說明。
- 左側目錄固定不動。右側的「本頁」列出段落，寬度 1280px 以下隱藏。手機上目錄收成一顆按鈕。
- 文字在 `src/components/dev/`：`guides.data.js`（概覽和主題）、`componentLibrary.data.js`（元件）、`foundations.data.js`（字級、間距、色票）。這一頁只給開發用，只寫中文，不進正式 build。
- 只列可以自由組合的元件，例如 Button、Drawer、OtpInput。現在只用一次也算，只要它不綁定某個用途。
- 綁定某個用途的組合不列，例如 `SiteNav`、`SidePanel`（編輯面板）、`OtpGate`（密碼框）、`JournalEditPanel`、`AdminProvider`。內部的渲染器（`RichText`）也不列。
- 新增或修改元件時，同一個變更裡更新這份資料。標「待修」的項目是已知問題。
