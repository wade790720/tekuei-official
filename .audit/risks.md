# 風險檢查（以 e4344b5 為準）

處理方式照使用者的決定：一般問題在這次修，CORS 和 admin 驗證只回報。

| # | 嚴重度 | 位置 | 問題 | 處理 |
|---|---|---|---|---|
| 1 | 高 | `src/lib/adminAuth.js:34` | 登入成功會把失敗次數歸零，每次存檔都重新驗證密碼，所以 Wade 每存一次，攻擊者就多 4 次猜測機會。6 位數密碼約 200 到 1000 天可猜中一半 | 只回報（admin）。建議 verify 改發隨機 session token，密碼只在登入時用 |
| 2 | 中 | `src/lib/adminAuth.js:21` | 鎖定是全站共用，任何人每 15 分鐘錯 5 次就能讓 Wade 一直被鎖住，已登入的分頁存檔也會 429 | 只回報（admin）。session token 一併解決 |
| 3 | 中 | `src/App.jsx:131`、`src/hooks/useCmsSection.js` | 每個頁面（含首頁、報到頁、lab iframe）都下載整份 `data.json`，含全部文章和草稿；自動儲存也整檔重寫 | 回報。屬於架構改動，適合和 React Router framework 模式一起做 |
| 4 | 中 | `functions/api/data.js:5` | 草稿全文經 `/api/data` 公開 | 回報。要先有第 1 項的 token 才能只給登入者看 |
| 5 | 中低 | `functions/api/data.js:16` | `If-None-Match` 逐字比對，弱 ETag `W/"…"` 時永遠不會 304 | 這次修 |
| 6 | 中低 | `src/data/journal.js` `differsOnlyIn`、`JournalEditPanel.jsx:35` | 每打一個字都把整個 journal 序列化兩次 | 這次修 |
| 7 | 低 | `functions/api/data.js:39` | ETag 全檔共用，兩個分頁改不同區段時，後存的會收到假的 409 | 回報 |
| 8 | 低 | `src/components/ProjectPage.jsx:103`、`src/lib/projectHref.js:15` | 專案的外部連結沒有經過 `safeHref`，`javascript:` 會上線 | 這次修 |
| 9 | 低 | `functions/_middleware.js:5` | CORS 回應沒有 `Vary: Origin`，`/api/file` 的 immutable 快取會帶著 ACAO | 只回報（middleware） |
| 10 | 低 | `public/` 沒有 `_headers` | 沒有 `nosniff`、`frame-ancestors`、CSP；sessionStorage 存的是原始密碼 | 回報。CSP 會影響 Google Fonts、YouTube、LIFF，需要另外測 |
| 11 | 低 | `src/lib/adminAuth.js:33` | 密碼比對不是 timing-safe，但每次嘗試都先計數，實際無影響 | 只回報（admin） |

## 架構

- `src/lib/seo.js` 的 `docHtml` 和 `RichText` 各寫一套節點 switch。新增節點時 SEO 版會無聲漏掉內容。TS 轉換時用同一個節點型別讓兩邊都做窮舉檢查。
- Functions 經由 `seo.js` 匯入 `src/data` 和 `src/labs`，後端 bundle 綁著前端資料。
- `src/labs/falling-figure/fallScene.js:529` 在畫面外不停 rAF（只在 lab iframe 內）。

## 檢查過沒有問題

`seo.js` 的跳脫與 JSON-LD、`safeHref`、`/api/file` 的路徑檢查、upload 的類型和大小上限、translate 的驗證和字數上限、`/cases` 轉址、各頁 Canvas 的減少動態效果。
