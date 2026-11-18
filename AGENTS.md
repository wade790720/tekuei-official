# AGENTS.md

給 AI 與協作者的工作規範。這份檔案每次都要先讀。

## 開始之前

1. 讀這份檔案。
2. 讀 [PRODUCT.md](PRODUCT.md)。它說明網站為什麼存在、給誰看、品牌喜歡和不喜歡什麼。
3. 要改畫面、樣式或動畫時，讀 [DESIGN.md](DESIGN.md)。
4. 規範和使用者的指示衝突時，照使用者的指示做。做完後，問使用者要不要更新規範。

## 專案

TEKUEI 德溎，Wade 的個人網站。文章是主角，案例第二，聯絡方式第三。

| 項目 | 現況 |
|---|---|
| 前端 | Vite、React 19、React Router 7（library 模式，`BrowserRouter`） |
| 後端 | Cloudflare Pages Functions（`functions/`）、一個 R2 bucket `tekuei-cms` |
| 語言 | 中英雙語。目前用 `localStorage` 的 `lang` 切換，網址不變 |
| 動畫 | 原生 Canvas 2D、IntersectionObserver。About 頁用 Lenis |

PRODUCT.md 寫的「React Router framework 模式」和「語言放進網址」是目標，還沒做。沒有被要求時，不要順便遷移。

## 指令

```bash
npm run dev        # 本機開發，Vite
npm run lint       # ESLint
npm run build      # 正式 build，輸出到 dist/
npm test           # node --test
npm run dev:pages  # build 後用 wrangler 跑 Functions + R2
```

## 資料夾

| 路徑 | 放什麼 |
|---|---|
| `src/components/` | 頁面元件，一頁一檔（`XxxPage.jsx`）。編輯模式的元件在 `admin/` 和 `journal/` |
| `src/data/` | 所有文案與內容。雙語內容的形狀是 `{ zh: …, en: … }` |
| `src/data/cases/` | 案例內容，一個案例一檔 |
| `src/styles/` | CSS，一頁一檔。`tokens.css` 是全站 token |
| `src/lib/` | 不依賴 React 的邏輯。Canvas 效果也放這裡 |
| `src/hooks/` | React hook，例如 `useReveal`、`useCmsSection` |
| `src/assets/` | 圖片，依頁面分資料夾 |
| `functions/` | API：`/api/data`、`/api/upload`、`/api/file/*`、`/api/admin/verify` |

## 寫程式的規則

- 文案不要寫死在元件裡。放進 `src/data/`，並同時提供 `zh` 和 `en`。
- 顏色、線條、easing 只用 `tokens.css` 的 token。不要寫新的色碼。細節見 DESIGN.md。
- 新的 class 用「頁面或區塊前綴 + BEM」，例如 `journal-footer__link`、`is-in`。
- Canvas 效果寫成 `mountXxx(canvas, opts)`，回傳 cleanup 函式。元件在 `useEffect` 裡呼叫它。參考 `src/lib/glyphField.js`。
- 每個動畫都要支援 `prefers-reduced-motion`。效果停下後要停止 `requestAnimationFrame`。
- 先用專案裡已有的東西。可重複使用的元件和規範都列在 `/dev/component-library`（開發模式）。
- 新增或修改元件時，同時更新 `src/components/dev/componentLibrary.data.js`。
- 不要新增依賴。真的需要時，先問使用者。
- 註解只寫程式碼看不出來的原因。

## 編輯模式（前台 CMS）

- Ctrl+S／⌘+S 打開密碼框，密碼是 Cloudflare Pages 的 `ADMIN_SECRET`，必須是 6 位數字。
- Journal 文章存在 R2 `data.json` 的 `journal`。不要直接改 `src/data/journal.js` 裡的文章，那只是預設值。
- 本機的 `.env.local` 把 `/api` 代理到正式站。在本機登入或儲存會寫到正式資料。測試時先在瀏覽器裡把 `/api` 換成假的。

## 內容的規則

- 不可以捏造真實資料：案例圖片、文章、照片、帳號、數字。缺資料時，用明顯的佔位文字，並告訴使用者。
- Wade 只寫中文。英文是翻譯。
- 從別人網站拿來的圖或文字，不可以直接上線。要先告訴使用者版權風險。

## 寫作規則（ASD-STE100，做到約八成）

適用於文件、UI 文案、commit message、回報。

- 一個詞只有一個意思。同一個東西不換名稱。
- 句子要短。英文 20 字以內，中文以同等長度為準。用主動語態。
- 一句只講一個指示。
- 只有在照規則寫反而讓文字變差時，才可以破例。

## 禁止

- 不要 commit `.env.local`、`.dev.vars` 或任何金鑰。
- 不要直接 push 到 `main`。沒有被要求時，不要 commit 或 push。
- 不要改 `functions/_middleware.js`（CORS）和 admin 驗證（`functions/api/admin/`、`ADMIN_SECRET`），除非任務就是這件事。
- 不要把測試或 prototype 檔案放進 `public/`。`public/` 會整包進到 `dist/`。暫存檔放 repo 外。
- 不要刪除或覆寫 `src/data/data.json`。它是 R2 的 fallback 內容。

## 完成的定義

1. `npm run lint` 和 `npm run build` 都通過。改到 `scripts/` 或 `lib/phoneE164.js` 時，也要跑 `npm test`。
2. 畫面有變時，用瀏覽器打開實際頁面確認。要看三種寬度：手機 375px、桌面 1440px、寬螢幕 2560px（內容不可超出中間 1920px，見 DESIGN.md）。
3. 有動畫時，確認「減少動態效果」開啟時畫面正常。
4. 回報時說清楚：改了什麼、驗證了什麼、沒有驗證什麼。

## 維護這份規範

- 決定改變時，同一個變更裡就更新 PRODUCT.md、DESIGN.md 或這份檔案。
- 這份檔案保持在 120 行以內。細節放 DESIGN.md。
