# 風險檢查（以 e4344b5 為準）

處理方式照使用者的決定：一般問題在這次修，CORS 和 admin 驗證只回報。

| # | 嚴重度 | 位置 | 問題 | 處理 |
|---|---|---|---|---|
| 1 | 高 | `src/lib/adminAuth.ts:34` | 登入成功會把失敗次數歸零，每次存檔都重新驗證密碼，所以 Wade 每存一次，攻擊者就多 4 次猜測機會。6 位數密碼約 200 到 1000 天可猜中一半 | 已修：成功只撤回自己那一次的計數，之前猜錯的次數保留，有測試。現在一天最多猜 480 次，猜中一半的機率約要 1000 天；session token 沒做 |
| 2 | 中 | `src/lib/adminAuth.ts:21` | 鎖定是全站共用，任何人每 15 分鐘錯 5 次就能讓 Wade 一直被鎖住，已登入的分頁存檔也會 429 | 只回報（admin）。session token 一併解決 |
| 3 | 中 | `src/App.tsx:131`、`src/hooks/useCmsSection.ts` | 每個頁面（含首頁、報到頁、lab iframe）都下載整份 `data.json`，含全部文章和草稿；自動儲存也整檔重寫 | 已修（#9）：每一頁的 loader 只送出那一頁的已發布內容，首頁、Lab、報到頁不讀 R2。自動儲存仍是整個區段寫入（第 7 項） |
| 4 | 中 | `functions/api/data.ts:5` | 草稿全文經 `/api/data` 公開 | 已修（#12）：`GET /api/data` 要管理密碼，讀者的頁面只讀 loader 的資料。沒有做 session token，用的仍是密碼 |
| 5 | 中低 | `functions/api/data.ts:16` | `If-None-Match` 逐字比對，弱 ETag `W/"…"` 時永遠不會 304 | 這次修 |
| 6 | 中低 | `src/data/journal.ts` `differsOnlyIn`、`JournalEditPanel.tsx:35` | 每打一個字都把整個 journal 序列化兩次 | 這次修 |
| 7 | 低 | `functions/api/data.ts:39` | ETag 全檔共用，兩個分頁改不同區段時，後存的會收到假的 409 | 回報 |
| 8 | 低 | `src/components/ProjectPage.tsx:103`、`src/lib/projectHref.ts:15` | 專案的外部連結沒有經過 `safeHref`，`javascript:` 會上線 | 這次修 |
| 9 | 低 | `functions/_middleware.ts:5` | CORS 回應沒有 `Vary: Origin`，`/api/file` 的 immutable 快取會帶著 ACAO | 只回報（middleware） |
| 10 | 低 | `public/` 沒有 `_headers` | 沒有 `nosniff`、`frame-ancestors`、CSP；sessionStorage 存的是原始密碼 | 回報。CSP 會影響 Google Fonts、YouTube、LIFF，需要另外測 |
| 11 | 低 | `src/lib/adminAuth.ts:33` | 密碼比對不是 timing-safe，但每次嘗試都先計數，實際無影響 | 只回報（admin） |

## 轉換過程中另外發現

| # | 嚴重度 | 位置 | 問題 | 處理 |
|---|---|---|---|---|
| 12 | 中 | `functions/api/data.ts` PUT | data.json 已存在時，沒帶 `If-Match` 的儲存會直接覆寫 | 已修：回 409，有測試 |
| 13 | 中低 | `src/lib/adminApi.ts` `translateTexts` | 翻譯 API 少回一筆時，譯文會錯位到別的文字上 | 已修：筆數不符時丟出錯誤 |
| 14 | 中低 | `src/components/journal/JournalEditPanel.tsx:162` | journal 沒有 `posts.en` 時，新增文章會當掉 | 已修：`parseSiteData` 補空清單，有測試 |
| 15 | 低 | `src/hooks/useCmsSection.ts` | 儲存中途離開編輯模式時，對 null 呼叫 `copyDraft` 會當掉 | 已修 |
| 16 | 低 | `functions/_middleware.ts` | 沒有 `Access-Control-Expose-Headers: ETag`。跨網域直連時前端讀不到 ETag，每次儲存都會 409。`VITE_API_BASE` 已經刪掉（issue #8），前端一律走同網域，不受影響 | 只回報（middleware） |
| 17 | 低 | `functions/api/data.ts` PUT | 只檢查 body 是物件，沒有用 `parseSiteData` 驗證區段格式 | 回報 |
| 18 | 低 | `src/lib/seo.ts` `docHtml` | 和 `RichText` 處理的區塊種類一致，但 SEO 版不輸出底線、刪除線，外部連結沒有 `target`、`rel` | 已修（#11）：刪掉 `docHtml`，伺服器直接用 `RichText` 畫出內文 |
| 19 | 低 | `src/lib/adminAuth.ts` | 嘗試次數檔的 `fails` 不是數字時，原本會讓鎖定永遠失效，型別化後改為重設成 0 | 型別轉換的副作用，屬於 admin，請確認 |
| 20 | 中 | `src/lib/siteData.ts` `parseSiteData` | 解析很嚴格：R2 裡任何一篇文章有一個欄位型別不符（例如 `alt: null`），整個 Journal 會被當成載入失敗，讀者看到空的 Journal，sitemap 也變空。好處是編輯器此時拒絕儲存，不會蓋掉正式資料。目前正式 `data.json` 解析結果 `invalid` 為空 | 刻意的取捨，回報。若想改成只略過壞掉的那篇，要另外處理儲存時不能把它刪掉 |
| 21 | 低 | Journal 文章頁 | 載入資料的那一瞬間，分頁標題先顯示「Not Found」再換成文章標題。改前就是這樣 | 已修（#4）：標題改成 React 的 `<title>`，載入中不畫「Not Found」。#9 之後資料由 loader 送出，沒有載入中的狀態 |
| 22 | 低 | `src/components/Editor.tsx:325`、`:513` | 沒有傳 `upload` 時，圖片卡片上傳改成不做事，原本是丟錯後顯示錯誤文字。實務上一定有傳 `upload` | 回報 |
| 23 | 中 | R2 `data.json` | 所有文章只存在這一個檔案，被蓋掉就回不來 | 已修：每天第一次儲存前備份到 `backup/data-<日期>.json`，有測試。備份不會自動清除，一年約幾十 MB |

## 架構

- 已修（#11）：`docHtml` 和 `RichText` 各寫一套節點 switch 的問題，`docHtml` 已刪除。
- 已修（#11）：頁面 Function 經由 `seo.ts` 匯入前端資料的問題，頁面 Function 已刪除，`seo.ts` 只由頁面和 resource route 使用。
- `src/labs/falling-figure/fallScene.ts:529` 在畫面外不停 rAF（只在 lab iframe 內）。

## 檢查過沒有問題

`seo.ts` 的跳脫與 JSON-LD、`safeHref`、`/api/file` 的路徑檢查、upload 的類型和大小上限、translate 的驗證和字數上限、`/cases` 轉址、各頁 Canvas 的減少動態效果。
