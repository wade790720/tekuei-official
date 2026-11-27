# 風險檢查（以 e4344b5 為準）

處理方式照使用者的決定：一般問題在這次修，CORS 和 admin 驗證只回報。

| # | 嚴重度 | 位置 | 問題 | 處理 |
|---|---|---|---|---|
| 1 | 高 | `src/lib/adminAuth.ts:34` | 登入成功會把失敗次數歸零，每次存檔都重新驗證密碼，所以 Wade 每存一次，攻擊者就多 4 次猜測機會。6 位數密碼約 200 到 1000 天可猜中一半 | 只回報（admin）。建議 verify 改發隨機 session token，密碼只在登入時用 |
| 2 | 中 | `src/lib/adminAuth.ts:21` | 鎖定是全站共用，任何人每 15 分鐘錯 5 次就能讓 Wade 一直被鎖住，已登入的分頁存檔也會 429 | 只回報（admin）。session token 一併解決 |
| 3 | 中 | `src/App.tsx:131`、`src/hooks/useCmsSection.ts` | 每個頁面（含首頁、報到頁、lab iframe）都下載整份 `data.json`，含全部文章和草稿；自動儲存也整檔重寫 | 回報。屬於架構改動，適合和 React Router framework 模式一起做 |
| 4 | 中 | `functions/api/data.ts:5` | 草稿全文經 `/api/data` 公開 | 回報。要先有第 1 項的 token 才能只給登入者看 |
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
| 16 | 低 | `functions/_middleware.ts` | 沒有 `Access-Control-Expose-Headers: ETag`。若改用 `VITE_API_BASE` 跨網域直連，前端讀不到 ETag，第 12 項修好後這種連法每次儲存都會 409。目前正式站和本機都走同網域，不受影響 | 只回報（middleware） |
| 17 | 低 | `functions/api/data.ts` PUT | 只檢查 body 是物件，沒有用 `parseSiteData` 驗證區段格式 | 回報 |
| 18 | 低 | `src/lib/seo.ts` `docHtml` | 和 `RichText` 處理的區塊種類一致（`scripts/blockTypes.test.ts` 守住），但 SEO 版不輸出底線、刪除線，外部連結沒有 `target`、`rel` | 回報 |
| 19 | 低 | `src/lib/adminAuth.ts` | 嘗試次數檔的 `fails` 不是數字時，原本會讓鎖定永遠失效，型別化後改為重設成 0 | 型別轉換的副作用，屬於 admin，請確認 |

## 架構

- `src/lib/seo.ts` 的 `docHtml` 和 `RichText` 各寫一套節點 switch。新增節點時 SEO 版會無聲漏掉內容。TS 轉換時用同一個節點型別讓兩邊都做窮舉檢查。
- Functions 經由 `seo.ts` 匯入 `src/data` 和 `src/labs`，後端 bundle 綁著前端資料。
- `src/labs/falling-figure/fallScene.ts:529` 在畫面外不停 rAF（只在 lab iframe 內）。

## 檢查過沒有問題

`seo.ts` 的跳脫與 JSON-LD、`safeHref`、`/api/file` 的路徑檢查、upload 的類型和大小上限、translate 的驗證和字數上限、`/cases` 轉址、各頁 Canvas 的減少動態效果。
