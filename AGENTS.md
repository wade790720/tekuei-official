# AGENTS.md

給 AI 與協作者的工作規範。這份檔案每次都要先讀。

## 開始之前

1. 讀 [PRODUCT.md](PRODUCT.md)。它說明網站為什麼存在、給誰看、品牌喜歡和不喜歡什麼。
2. 要改畫面、樣式或動畫時，讀 [DESIGN.md](DESIGN.md)（全站規則）和 [PAGES.md](PAGES.md)（各頁規格），並先查 Component Library。
3. 規範和使用者的指示衝突時，照使用者的指示做。做完後，問使用者要不要更新規範。

## 專案

TEKUEI 德溎，Wade 的個人網站。文章是主角，案例第二，聯絡方式第三。

| 項目 | 現況 |
|---|---|
| 前端 | Vite、React 19、React Router 7（library 模式，`BrowserRouter`）、TypeScript strict |
| 後端 | Cloudflare Pages Functions（`functions/`）、一個 R2 bucket `tekuei-cms` |
| 語言 | 中英雙語。目前用 `localStorage` 的 `lang` 切換，網址不變 |
| 動畫 | 原生 Canvas 2D、IntersectionObserver。Falling Figure lab 用 Lenis |

PRODUCT.md 寫的「React Router framework 模式」和「語言放進網址」是目標，還沒做。沒有被要求時，不要順便遷移。

## 指令

```bash
npm run dev        # 本機開發，Vite
npm run lint       # ESLint、noSlop、tsc 型別檢查
npm run build      # 正式 build，輸出到 dist/
npm test           # node --test
npm run dev:pages  # build 後用 wrangler 跑 Functions + R2
```

## 資料夾

| 路徑 | 放什麼 |
|---|---|
| `src/components/` | 頁面（`XxxPage.tsx`）和共用元件（`Editor.tsx`、`RichText.tsx`、`CodeBlock.tsx`……），一個元件一個檔案 |
| `src/components/<頁面>/` | 只有那一頁用的元件，例如 `journal/JournalEditPanel.tsx`、`admin/OtpGate.tsx` |
| `src/data/` | 所有文案與內容。雙語內容的形狀是 `{ zh: …, en: … }` |
| `src/data/cases/` | 案例內容，一個案例一檔 |
| `src/styles/` | CSS，一頁一檔。`tokens.css` 是全站 token |
| `src/lib/` | 不依賴 React 的邏輯。Canvas 效果也放這裡 |
| `src/hooks/` | React hook，例如 `useCmsSection` |
| `src/assets/` | 圖片，依頁面分資料夾 |
| `src/labs/` | Labs。`index.ts` 是清單，每個 lab 一個資料夾，元件、樣式、效果、素材都放在一起（依類型分資料夾的例外） |
| `functions/` | API：`/api/data`、`/api/upload`、`/api/file/*`、`/api/admin/verify` |
| `functions/journal/`、`sitemap.xml.ts`、`llms.txt.ts` | SEO：把 Journal 的內文、meta、JSON-LD 寫進 HTML，並產生 sitemap 和 llms.txt。邏輯在 `src/lib/seo.ts` |

## 寫程式的規則

- 全部用 TypeScript strict。不用 `any`、`@ts-ignore`；`as` 只用在剛檢查過的值。R2 和 API 的資料在邊界用 `parseSiteData`（`src/lib/siteData.ts`）解析，資料型別也從那裡匯入。
- 文案不要寫死在元件裡。放進 `src/data/`，並同時提供 `zh` 和 `en`。
- 顏色、線條、easing 只用 `tokens.css` 的 token。不要寫新的色碼。細節見 DESIGN.md。
- 新的 class 用「頁面或區段前綴 + BEM」，例如 `site-footer__logo`、`is-in`。
- Canvas 效果寫成 `mountXxx(canvas, opts)`，回傳 cleanup 函式。元件在 `useEffect` 裡呼叫它。參考 `src/lib/glyphField.ts`。
- 每個動畫都要支援 `prefers-reduced-motion`。效果停下後要停止 `requestAnimationFrame`。
- 樣式一個元件或一頁一個檔案，放在 `src/styles/`，檔名和元件或頁面相同。

## 元件：先查 Component Library

做任何介面之前，照這個順序決定。不可以跳步。

1. **先查。** 打開 `/dev/component-library`（開發模式），或讀 `src/components/dev/componentLibrary.data.tsx`。
2. **有就用。** 直接匯入既有元件，用它的 props。不要在頁面裡另寫一份功能相同的標記或樣式。
3. **差一點就擴充。** 既有元件不完全符合時，在原元件加 prop 或變體。不要複製一份再改。
4. **真的沒有，先問。** 說明現有元件為什麼不能用，提出新元件的名稱和用途，得到使用者同意後再建立。
5. **放對位置。** 兩個以上的地方會用到：放在 `src/components/` 第一層，名稱不綁頁面（`Editor`，不是 `PostEditor`）。只有一頁用：放在那一頁的資料夾。只用一次的小東西（例如 logo）直接寫在用到的地方。
6. **零件寫在一起。** 只有某個元件自己用的零件，寫在同一個檔案，例如 `SiteNav.tsx` 裡的 `NavOverlay`。

- 頁面的 CSS 只負責排版（位置、寬度、間距）。不要在頁面裡改元件的外觀。要改外觀，改元件本身或加變體。
- 新增或修改元件時，同一個變更裡更新 Component Library：`componentLibrary.data.tsx` 的說明，有需要時加 `demos.tsx` 的示範。
- 回報時列出：用了哪些既有元件、擴充了哪一個、新增了哪一個以及原因。
- 不要新增相依套件。真的需要時，先問使用者。
- 註解只寫程式碼看不出來、而且我們改不了的原因（外部規則、授權、API 說明）。自己的程式碼很怪時改程式碼，不寫註解辯解。`npm run lint` 的 `no-slop` 會擋下區塊橫幅、日期、lint 抑制、em dash、AI 用詞、指向不存在的檔案（`scripts/noSlop.ts`），Claude Code 每次改檔也會跑。它也檢查 CSS 的三條設計規則：色碼、400 以上的字重、刻度外的間距。原本就有的違規記在 `scripts/designBaseline.json`，數量只能減少。

## 不明顯的坑

1. **本機會寫到正式資料。** `.env.local` 把 `/api` 代理到正式站。測試登入或儲存之前，先在瀏覽器裡把 `/api` 換成假的：在頁面執行 `await import('/scripts/fakeAdminApi.ts')`，重新整理後要再執行一次。
2. **文章不在程式碼裡。** Journal 文章在 R2 `data.json` 的 `journal`。`src/data/journal.ts` 只有文案和工具函式，沒有文章；R2 讀不到時 Journal 是空的。
3. **CSS 和 Canvas 的坑**（`transform` 被淡入蓋掉、Canvas 讀不到變數、假粗體……）列在 DESIGN.md 的「Don't」。

## 內容的規則

- 不可以捏造真實資料：案例圖片、文章、照片、帳號、數字。缺資料時，用明顯的佔位文字，並告訴使用者。
- Wade 只寫中文。英文是翻譯。
- 從別人網站拿來的圖或文字，不可以直接上線。要先告訴使用者版權風險。

## 寫作規則
同一個東西只用一個名稱。固定的用詞列在 DESIGN.md 的「用詞」。

**網站上的所有文字（UI 文案、案例、About、文章、Component Library）：照 zh-tw-writing skill 的台灣正式中文寫法。**

- 同一個主題的短句用逗號接成一句，講完一個意思才用句號。
- 名詞片語、標題、表格儲存格、按鈕和標籤，結尾不加句號。
- 並列用頓號「、」，不用「·」或「/」。破折號寫成「──」，刪節號寫成「……」。

## 禁止

- 不要 commit `.env.local`、`.dev.vars` 或任何金鑰。
- 不要直接 push 到 `main`。沒有被要求時，不要 commit 或 push。
- 不要改 `functions/_middleware.ts`（CORS）和 admin 驗證（`functions/api/admin/`、`ADMIN_SECRET`），除非任務就是這件事。
- 不要把測試或 prototype 檔案放進 `public/`。`public/` 會整包進到 `dist/`。暫存檔放 repo 外。
- 不要刪除或覆寫 `src/data/data.json`。它是 R2 的 fallback 內容。

## 完成的定義

1. `npm run lint` 和 `npm run build` 都通過。改到 `scripts/` 或 `lib/phoneE164.ts` 時，也要跑 `npm test`。
2. 畫面有變時，用瀏覽器打開實際頁面確認。要看三種寬度：手機 375px、桌面 1440px、寬螢幕 2560px（內容不可超出中間 1920px，見 DESIGN.md）。貼著邊緣的文字和線要放大截圖，確認沒有被切掉。
3. 改到共用元件、token 或全站樣式時，先用搜尋列出每個用到它的地方，逐一打開確認，並在回報裡寫出看過哪些。例：改了 `DropdownMenu` 的最小寬度，編輯器的選單就被擠成兩行，只看原本那個選單不會發現。
4. 有動畫時，確認「減少動態效果」開啟時畫面正常。
5. 回報時說清楚：改了什麼、驗證了什麼、沒有驗證什麼。

## 維護這份規範

- 決定改變時，同一個變更裡就更新規則所在的檔案。原因寫在 commit message。
- 全站規則放 DESIGN.md，某一頁的規格放 PAGES.md。兩者都不寫日期和「誰決定」。例外規則在同一行補半句原因，例如「行高 1.6（照 Editor.js）」。
- 這份檔案保持在 120 行以內。細節放 DESIGN.md。
