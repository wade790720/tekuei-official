# 切換到 React Router 8 Worker 的清單

這份清單給 Wade 在 Cloudflare 後台操作時照著做，整合分支 `migrate/rr8` 已經完成 framework 模式、英文網址、伺服器畫出的 head 和編輯模式的改動，但正式站 tekuei.com 目前仍是 `main` 上的舊 Pages 版本。切換就是把網站從 Pages 專案搬到一個 Worker，計畫的細節在 `docs/rr-framework-migration.md` 的第七個 PR。

選一個沒什麼人在看網站的時段做，移網域的那幾分鐘可能連不上。

## 切換前要知道的事

- `functions/api/data.ts` 是 Pages 和 Worker 共用的檔案，整合分支把 `GET /api/data` 改成要密碼，但舊的 SPA 每一頁都靠這個公開的 API 讀資料，所以這個改動只能和 Worker 一起上線，不可以先部署到 Pages。合併到 `main` 之前，要先停掉 Pages 的自動部署（第 5 步）。
- `data.json` 的格式在整個遷移過程中沒有變，Pages 和 Worker 可以讀寫同一個 bucket，切換和回復都不用轉換資料。
- Worker 的名稱寫在 `wrangler.jsonc` 的 `name`，正式的是 `tekuei-official`，整合分支用的是 `env.next` 的 `tekuei-next`。如果後台不允許 Worker 和 Pages 專案同名，先改 `wrangler.jsonc` 的 `name` 再部署，下面的指令也跟著換名稱。

## 1. 準備 tekuei-next 的資料

`tekuei-next` 綁的是另一個 bucket `tekuei-cms-next`，不會動到正式資料。先把正式資料讀出一份放進去：

```sh
npx wrangler r2 object get tekuei-cms/data.json --remote --file <repo 外的路徑>/data.json
npx wrangler r2 object put tekuei-cms-next/data.json --remote --file <repo 外的路徑>/data.json --content-type application/json
```

第一行只讀取正式 bucket。副本裡有草稿，放在 repo 外，用完刪掉。

## 2. 設定 tekuei-next 的管理密碼

```sh
npx wrangler secret put ADMIN_SECRET --name tekuei-next
```

輸入一組 6 位數字，和正式站的密碼不同，測試時才不會用掉正式站的猜錯次數。

## 3. 部署 tekuei-next 並驗證

```sh
npm run build:next
npx wrangler deploy
```

`npm run build:next` 會把 `env.next` 的設定寫進 `build/server/wrangler.json`，`wrangler deploy` 讀的是這個檔案，所以不要加 `--env next`。部署完會拿到一個 `workers.dev` 的網址，接著在本機執行：

```sh
node scripts/checkPages.ts https://tekuei-next.<帳號>.workers.dev
```

腳本只會把 `.dev.vars` 的密碼送到本機的伺服器，對 `workers.dev` 不帶密碼，所以文章內文和草稿那兩項檢查會略過，其他項目照常檢查。

在瀏覽器打開 `workers.dev` 的網址，確認這幾件事：

- 首頁、Journal、文章頁、Projects、專案內頁、About、Lab 的中英文版都正常，語言按鈕的水波和換頁正常。
- 按 Ctrl+S 用 `tekuei-next` 的密碼登入，改一篇草稿、發布、取消公開，再用另一個分頁存一次，看到 409 的提示。
- 用手機打開，看 375px 的版面。

## 4. 量 CPU 時間

Workers Free 每個請求的 CPU 時間上限是 10 ms。一邊在瀏覽器點各頁，一邊執行：

```sh
npx wrangler tail tekuei-next --format json
```

也可以在後台 Workers 的 Observability 看每個請求的 CPU 時間，`wrangler.jsonc` 已經開了 observability。本機量到的是每頁 1.2 到 3.8 ms，如果線上常常超過 10 ms，先停在這一步，和開發者討論用 Cache API 快取 HTML，或升級到 Paid 方案。

## 5. 停掉 Pages 的自動部署

Pages 專案 tekuei-official → Settings → Builds & deployments，暫停 production branch 的自動部署。這一步要在合併之前做，避免 `main` 一有變動，Pages 就部署新的 `functions/api/data.ts`，目前最後一次成功的部署則會繼續提供 tekuei.com。

## 6. 設定正式 Worker

正式 Worker 綁的是正式的 `tekuei-cms` 和 Workers AI，都寫在 `wrangler.jsonc`，不用在後台設定，只有密碼要用指令設定：

```sh
npx wrangler secret put ADMIN_SECRET --name tekuei-official
```

輸入和現在 Pages 專案相同的密碼，Wade 才能用原本的密碼登入。

## 7. 連上 Git（Workers Builds）

後台 Workers & Pages → 正式 Worker → Settings → Builds，連到 GitHub 的 `wade790720/tekuei-official`：

| 欄位 | 值 |
|---|---|
| Production branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

## 8. 合併 migrate/rr8 到 main

開一個從 `migrate/rr8` 到 `main` 的 PR，在本機跑過 `npm run lint`、`npm run build`、`npm test` 再合併（repo 沒有 GitHub Actions）。PR 上 Cloudflare Pages 的建置檢查在整合分支上一直是失敗的，因為 framework 模式的建置產物和 Pages 不相容，這是預期的。合併後 Workers Builds 會建置並部署正式 Worker，部署完先用它的 `workers.dev` 網址看一次，這時資料已經是正式的 `tekuei-cms`，用這個網址登入只讀取資料，先不要存檔。

## 9. 把網域從 Pages 移到 Worker

1. Pages 專案 tekuei-official → Custom domains，移除 `tekuei.com`，有 `www` 的話也一起移除。
2. 正式 Worker → Settings → Domains & Routes，加上 Custom domain `tekuei.com`（和 `www`）。
3. 等憑證生效後打開 `https://tekuei.com/`，確認頁面由 Worker 提供，例如 `https://tekuei.com/en` 打得開。

移除和加入之間網站會短暫連不上，兩個步驟要連著做。

## 10. 切換後的檢查

- 在本機執行 `node scripts/checkPages.ts https://tekuei.com`，同樣不會帶密碼。
- 用手機在 LINE 裡打開報到的 LIFF 網址，完成一次報到，LINE Developers 後台登記的 Endpoint URL 仍是 `https://tekuei.com/checkin`，不用改。
- 登入編輯模式，在一篇文章按英文翻譯，確認 `/api/translate` 正常，這會用掉 Workers AI 的免費額度。
- 改一篇文章並存檔，確認讀者畫面和 `https://tekuei.com/sitemap.xml` 都更新了。

## 11. Search Console

1. 在「Sitemap」送出 `https://tekuei.com/sitemap.xml`，裡面有中英文兩種網址，每一筆都用 `xhtml:link` 標出另一個語言。
2. 用「網址檢查」看一個英文頁（例如 `https://tekuei.com/en/journal`）和一篇還沒翻譯的文章的英文網址。前者的 canonical 是自己，後者的 canonical 是中文網址。
3. 幾天後看「網頁」報告，`/en` 的網頁應該陸續被索引，沒有大量的「重複網頁」或 hreflang 錯誤。

## 回復

Pages 專案和它最後一次的部署至少保留 30 天，這段時間不要刪除。出問題時：

1. 正式 Worker → Domains & Routes，移除 `tekuei.com`。
2. Pages 專案 → Custom domains，加回 `tekuei.com`，舊的 SPA 會立刻回來。
3. 在 GitHub revert 合併到 `main` 的那個 PR，再恢復 Pages 的自動部署。順序不能反過來，否則 Pages 會部署新的 `functions/api/data.ts`。

`data.json` 的格式沒有變，切換期間在 Worker 上存的文章，回到 Pages 之後仍然讀得到。

30 天後確定不再需要回復，就刪掉 Pages 專案。
