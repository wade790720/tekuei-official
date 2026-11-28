# React Router 8 遷移成果報告

## 目標

把網站從 React Router 的 library 模式（在 Cloudflare Pages 上跑的 SPA）換成 React Router 8 的 framework 模式，在 Cloudflare Workers 上做伺服器渲染。語言放進網址，中文在 `/`，英文在 `/en`，因為 Wade 要接國外的案子，英文和中文一樣重要。每一頁只讀自己需要的資料，讀者不再下載整份 `data.json`，也看不到草稿。頁面的 head 和 SEO 改由伺服器畫出，取代 `src/lib/seo.ts` 的注入程式。

計畫在 [`docs/rr-framework-migration.md`](rr-framework-migration.md)，決定的事寫在它的第十一節。

## 現在的狀態

- 遷移的程式碼全部在整合分支 `migrate/rr8`（目前在 `363dcc3`），還沒有進 `main`。
- 正式站 tekuei.com 沒有變，仍是 Pages 上的舊 SPA。Pages 連著 Git，`main` 有任何變動就會重新部署，framework 模式的程式碼會讓 Pages 的建置失敗，所以不能先合進 `main`。
- 切換之前，正式站的 `/api/data` 仍然公開，草稿也讀得到。這件事要到切換之後才會改變。
- 這次遷移沒有部署任何東西，沒有改網域或 DNS，每一輪有請求正式站的驗收都只發 GET，前後量到的 `/api/data` ETag 都是 `6c8b4d864c0db9d094956b14cfd2e519`，`data.json` 沒有變。
- 切換要由 Wade 操作，步驟寫在 `migrate/rr8` 的 `docs/rr8-cutover.md`。

## 合併了哪些 PR

除了 #3 的計畫文件，每個 PR 都由開發的 session 開出，再由沒寫過那段程式的驗收 session 檢查，驗收通過後才 squash merge。

| PR | 目標分支 | 內容 | 驗收輪數 |
|---|---|---|---|
| [#3](https://github.com/wade790720/tekuei-official/pull/3) | `main` | 遷移計畫 | 無，Wade 決定後合併 |
| [#4](https://github.com/wade790720/tekuei-official/pull/4) | `main` | 在 SPA 裡先清掉 SSR 的障礙，`document.title` 改成 React 19 的 `<title>` | 1 |
| [#5](https://github.com/wade790720/tekuei-official/pull/5) | `migrate/rr8` | 換成 framework 模式，在 Worker 上跑，加上 `wrangler.jsonc` 和預覽環境 `tekuei-next` | 3 |
| [#9](https://github.com/wade790720/tekuei-official/pull/9) | `migrate/rr8` | 每一頁自己的 loader、`/en` 網址、語言跟著網址、404 和 503 | 2 |
| [#11](https://github.com/wade790720/tekuei-official/pull/11) | `migrate/rr8` | head、hreflang、JSON-LD、sitemap、llms.txt 由伺服器畫出，刪掉注入的程式 | 2 |
| [#12](https://github.com/wade790720/tekuei-official/pull/12) | `migrate/rr8` | 編輯模式只在登入後讀完整資料，`GET /api/data` 要密碼 | 1 |
| [#13](https://github.com/wade790720/tekuei-official/pull/13) | `migrate/rr8` | 規範文件改成遷移後的狀態，刪掉不再需要的設定，切換清單 | 2 |
| [#16](https://github.com/wade790720/tekuei-official/pull/16) | `migrate/rr8` | 驗收留下的 SEO 小問題，以及 401、429 的快取標頭 | 1 |
| [#18](https://github.com/wade790720/tekuei-official/pull/18) | `migrate/rr8` | Lab 頁換語言時不多留瀏覽紀錄，不存在的 live 頁回 404 | 1 |

不存在的頁面（例如 `/labs/nope`、`/projects/nope`）狀態碼是 404，但畫面仍是遷移前就有的「案例詳情頁面尚未接上」佔位畫面，這次沒有改。

## 讀者會看到的改變

- 英文有自己的網址，例如 `/en/journal`，用英文搜尋進來的人直接看到英文，不用先按語言按鈕。舊的 `localStorage` 語言設定仍然有效，記住英文的讀者打開中文網址時，頁面載入後由瀏覽器換到對應的英文網址，伺服器不轉址。
- 還沒翻成英文的文章、專案和 About，英文網址顯示中文內文，canonical 指向中文網址，sitemap 和 hreflang 也不列它的英文版。
- 每一頁的 HTML 一開始就有完整的內文和 head，不跑 JavaScript 也讀得到。
- 讀者不再讀 `/api/data`。每一頁只拿自己的資料，例如 Journal 列表約 1.3 kB，整份 `data.json` 是 104 kB。
- 切換之後，草稿不會出現在任何讀者拿得到的地方。
- 換語言的水波、捲動位置、上一頁和下一頁的行為和舊站相同。

## 驗證了什麼

以下結果來自各 PR 的驗收，test 和 checkPages 的數字是最後一輪（#18）的。

- 每個 PR 的 `npm run lint`、`npm run build`、`npm test` 都通過，最後一輪是 149/149。
- `scripts/checkPages.ts` 檢查每頁中英文的狀態碼、內文、head 和 sitemap，在 dev 和 preview 都要通過，preview 另外測 R2 壞掉和 `data.json` 不存在兩種情況，最後一輪是 85/85。
- 為了確認草稿不外洩，在本機的 R2 放一份「金絲雀」資料，裡面有中英文的草稿文章和草稿專案，再請求每一頁的中英文 HTML、每頁的 `.data`、sitemap 和 llms.txt，102 個請求裡金絲雀字串出現 0 次，草稿的網址都回 404 且不快取。
- 中文頁的 JSON-LD 和正式站現在注入的內容逐欄相同，只有 WebSite 和 Person 從 head 移到 body。三種寬度（375、1440、2560px）的 DOM 快照中英文各 27 張，扣掉 About 一直在動的 Marquee，和遷移前的基準完全相同。
- 編輯流程在 #12 用本機的 R2 和測試密碼，在 Journal、Projects、About 各跑一次，包括 Ctrl+S 登入、草稿、自動儲存、發布、更新、取消公開、兩個分頁同時存檔時的 409 和登出，也確認換頁和換語言之後沒存的修改還在，存檔後讀者的畫面和另一個語言都會更新。之後的 #13、#16、#18 沒有改編輯器，沒有重跑。
- `GET /api/data` 在沒有密碼、密碼錯、密碼對、全站鎖住四種情況下的回應都正確，401 和 429 的回應裡沒有內容。完全沒帶密碼的請求不算一次猜錯，因為舊連結和爬蟲會一直讀這個網址，算進去的話讀 5 次就會鎖住 Wade，帶了錯的密碼則仍然算一次。
- 減少動態效果在 #9 和 #12 用 Chrome 的 CDP 模擬，錦鯉靜止，影片換成圖片，畫面內沒有停在透明狀態的淡入元素。

每一輪的證據在兩個 notes 資料夾裡，資料夾名稱的數字是遷移的階段，不是 PR 編號：

| 驗收資料夾 | PR |
|---|---|
| `local_4ac3…/pr1-verify` | #4 |
| `local_4ac3…/pr2-verify` | #5 |
| `local_4870…/pr3-verify` | #9 |
| `local_4870…/pr4-verify` | #11 |
| `local_4870…/pr5-verify` | #12 |
| `local_4870…/pr6-verify` | #13 |
| `local_4870…/leftovers-verify` | #16 |
| `local_4870…/lab-verify` | #18 |

## 沒有驗證的

- CPU 時間：只有開發者在 #9 開發時用 Node 量過，暖機後每頁平均 1.2 到 3.8 ms，第一次請求的時間比較長。之後加上 head 和 JSON-LD 的版本沒有重量，驗收也沒有量，在 Cloudflare 上的實際值要部署 `tekuei-next` 後用 `wrangler tail` 量。
- Cloudflare 上的其他行為：沒有部署 `tekuei-next`，Rich Results Test 也還沒跑。
- 切換清單裡的後台步驟（Workers Builds、網域搬移、DNS），只對照了 Cloudflare 的官方文件，沒有實際操作。
- `workers/app.ts` 呼叫 `routeApi` 的程式，以及 `wrangler.jsonc` 頂層綁定正式 `tekuei-cms` 的設定，都沒有自動測試。
- `/checkin` 的 LIFF 流程：它會把人導去 LINE 登入，要用手機在 LINE 裡測。
- `/api/translate`：測了會用掉正式的 Workers AI 額度。
- 登入失效時（401）面板顯示的訊息：只讀了程式碼。
- 新舊內文的純文字比對：沒有做，只比對了 DOM 快照。
- 每頁邊緣的放大截圖：#9 和 #11 用程式檢查了 9 頁中英文在 375 和 2560px 的邊緣，也拍了兩倍放大的截圖，但只用眼睛抽看了幾張，#12 之後沒有重拍。
- 瀏覽器：只用 Chrome 測，沒有測 Safari、Firefox 和手機實機。從 #5 起，驗收時內建瀏覽器面板是隱藏的，所以改用 headless Chrome，沒有用肉眼看畫面，#4 則用內建瀏覽器。減少動態效果是用 CDP 或替換 `matchMedia` 模擬的，沒有在系統設定裡打開。

## Issue

| Issue | 狀態 | 說明 |
|---|---|---|
| [#6](https://github.com/wade790720/tekuei-official/issues/6) | 已關閉 | About 的標題和描述重複，#11 修好 |
| [#7](https://github.com/wade790720/tekuei-official/issues/7) | 已關閉 | 淡入在 Suspense 的內容 hydrate 之前就加上 class。原因是頁面包在 `App.tsx` 的 Suspense 裡；拆成 route module 後整頁一次 hydrate，`mountReveal` 在那之後才跑，讀者頁面剩下的 Suspense 都只在編輯模式出現 |
| [#8](https://github.com/wade790720/tekuei-official/issues/8) | 已關閉 | `VITE_API_BASE` 可能讓本機開發連到正式站，#13 刪掉了這個設定 |
| [#10](https://github.com/wade790720/tekuei-official/issues/10) | 已關閉 | 文章內文的站內連結沒有跟著語言，#11 修好 |
| [#14](https://github.com/wade790720/tekuei-official/issues/14) | 已關閉 | 驗收留下的 SEO 小問題，#16 修好 |
| [#15](https://github.com/wade790720/tekuei-official/issues/15) | 已關閉 | 第 1 項（401、429 的快取標頭）由 #16 修好。第 2 項改成登入後只存 12 小時失效的簽章 token，不再存密碼 |
| [#17](https://github.com/wade790720/tekuei-official/issues/17) | 已關閉 | Lab 頁換語言後第一次按上一頁沒有反應、不存在的 live 頁回 200，#18 修好 |

## 要 Wade 做的事

1. 照 `docs/rr8-cutover.md`（在 `migrate/rr8`）切換。`functions/api/data.ts` 由新舊兩邊共用，所以合併 `migrate/rr8` 到 `main` 之前，一定要先停掉 Pages 的自動部署（清單第 5 步），否則合併後 Pages 會用新程式建置。現在這個建置會失敗，正式站會停在上一次的部署，但只要 Pages 的建置設定改過、讓建置成功，Pages 就會部署要密碼的 `GET /api/data`，舊站的讀者頁面會讀不到資料。清單裡另外幾件要先知道的事：
   - 第 3、4 步：在停掉自動部署和合併之前，先部署 `tekuei-next`，用 `wrangler tail` 確認每頁的 CPU 時間在 10 ms 以內，超過時再考慮 Cache API 或付費方案。
   - 第 6 步要在 Worker `tekuei-official` 設定和 Pages 相同的 `ADMIN_SECRET`。
   - 第 7 步連上 Workers Builds 時要關掉 preview builds，因為它們可能綁到正式的 `tekuei-cms`。
   - 第 9 步刪掉 CNAME 之後到新網域生效之前，網站會短暫連不上，要選沒人在看的時段。
   - Pages 專案至少保留 30 天，回復時要用。回復要照清單的順序：先中斷 Workers Builds 和 Git 的連結，網域移回 Pages 之後才 revert，最後才恢復 Pages 的自動部署。
2. 切換後用手機在 LINE 裡測 `/checkin`，在 Search Console 送出新的 sitemap，並檢查 hreflang。
3. 決定 #15 第 2 項要不要改。

## 決策紀錄

這次的每一個決定，包括驗收時要修什麼、哪些延後、為什麼同意開發者偏離計畫，都記在 `local_4870…` notes 資料夾的 `rr8-decisions.tsv`。
