# TEKUEI 德溎官網

> Repo 名稱是 `tekuei-official`，網站品牌名是 **TEKUEI 德溎**。

![react](https://img.shields.io/badge/React-19-61DAFB)
![typescript](https://img.shields.io/badge/TypeScript-strict-3178C6)
![vite](https://img.shields.io/badge/Vite-7-646CFF)
![router](https://img.shields.io/badge/React%20Router-8-CA4245)
![cloudflare](https://img.shields.io/badge/Cloudflare-Workers%20%2B%20R2-F38020)
![lang](https://img.shields.io/badge/lang-zh%20%2F%20en-c99a63)

Wade 的個人網站，文章是主角，案例第二，聯絡方式第三。Wade 在網站前台直接寫文章和專案內頁，內容存在 Cloudflare R2，網站本身就是能力的展示。

## 目錄

- [背景](#背景)
- [安裝](#安裝)
- [使用方式](#使用方式)
- [部署](#部署)
- [架構](#架構)
- [專案結構](#專案結構)
- [貢獻](#貢獻)
- [授權](#授權)

## 背景

Wade 寫了十年程式，也做了兩年策展，網站要讓人看得出他會寫程式，也有美感。新增一篇文章或一個案例只需要幾分鐘。產品方向見 [PRODUCT.md](PRODUCT.md)，全站視覺規範見 [DESIGN.md](DESIGN.md)，各頁規格見 [PAGES.md](PAGES.md)。

## 安裝

| 項目 | 版本或說明 |
| --- | --- |
| 作業系統 | Windows、macOS、Linux 皆可 |
| Node.js | 22.18 以上，測試直接用 Node 執行 `.ts` 檔 |
| npm | 隨 Node.js 安裝 |
| Wrangler | 已在 devDependencies，本機的 R2 和部署時使用 |

技術：React 19、React Router 8（framework 模式，伺服器渲染）、TypeScript（strict）、Vite 7、Cloudflare Workers、Tiptap 3、Lenis、原生 Canvas 2D 和 WebGL。

### 本機開發

```sh
npm ci
cp .dev.vars.example .dev.vars   # 填入本機用的 6 位數 ADMIN_SECRET
npm run seed                     # 把 src/data/data.json 放進本機的 R2
npm run dev                      # http://localhost:5173
```

`npm run dev` 用 Cloudflare 的 Vite 外掛在本機跑整個 Worker，頁面和 `/api` 讀寫的是 `.wrangler/state` 裡模擬的 R2，不會碰到正式資料。要用正式資料測試時，只讀取一份副本再放進本機的 bucket：

```sh
npx wrangler r2 object get tekuei-cms/data.json --remote --file <repo 外的路徑>/data.json
npx wrangler r2 object put tekuei-cms/data.json --local --persist-to=.wrangler/state --file <repo 外的路徑>/data.json --content-type application/json
```

副本裡有草稿，放在 repo 外。不要寫入正式的 `tekuei-cms`。

## 使用方式

### 頁面

中文在 `/`，英文在 `/en` 底下，例如 `/en/journal`。

| 網址 | 內容 |
| --- | --- |
| `/`、`/en` | 首頁 Hero（錦鯉池） |
| `/journal`、`/journal/:slug` | 文章列表和文章頁 |
| `/projects`、`/projects/:slug` | 專案列表和專案內頁（含三個案例頁） |
| `/labs/:slug` | 互動實驗的介紹頁 |
| `/labs/:slug/live` | 互動實驗的全螢幕預覽，只有一個網址，用 `?lang=en` 指定語言 |
| `/about` | 關於 |
| `/how-to-checkin` | 報到教學 |
| `/checkin` | LINE LIFF 報到，只有一個網址 |
| `/sitemap.xml`、`/llms.txt` | 兩種語言的 sitemap 和給 AI 讀的網站地圖 |
| `/dev/component-library` | Component Library，只在開發模式 |

舊網址 `/work` 和 `/cases/:slug` 301 轉到 `/projects` 或 `/labs`，網址結尾的斜線、大小寫不同的網站用字（例如 `/EN/Journal`）也 301 轉到正式的網址。右上角的語言按鈕換到另一個語言的同一頁，讀者選過英文之後，下次直接打開中文網址時，會換到同一頁的英文網址。

### 編輯內容

在網站上按 Ctrl+S（Mac 是 ⌘+S）登入編輯模式，再按一次 Ctrl+S 儲存。可以在前台編輯的有 Journal、Projects 和 About，文章內文直接在頁面上編輯，標題、標籤、日期等欄位在右側的編輯面板。文章有草稿和已發布兩種狀態，草稿停止打字 3 秒後自動儲存。最早的三個案例頁內文寫在 `src/data/cases/`，只有卡片欄位能在面板改。

讀者的頁面只拿到 loader 送出的已發布內容，編輯模式登入後才用密碼讀完整的 `data.json`。完整的編輯規格見 [PAGES.md](PAGES.md) 的「編輯模式」。

### 測試與檢查

```sh
npm run lint                            # ESLint、noSlop（註解和 CSS 規則）、tsc 型別檢查
npm run build                           # 正式 build，輸出到 build/
npm test                                # node --test，執行 scripts/*.test.ts
npm run preview                         # build 後用正式版跑 Worker，http://localhost:4173
node scripts/checkPages.ts <網址>       # 每一頁的中英文網址：狀態碼、head、sitemap、草稿有沒有外洩
```

`checkPages.ts` 加上 `--r2=broken` 或 `--r2=missing`，可以檢查本機 bucket 的 `data.json` 壞掉或不存在時各頁的狀態碼。它只把 `.dev.vars` 的密碼送到本機的伺服器，對其他網址不帶密碼，因為密碼不對會算一次猜錯。

## 部署

整個網站是一個 Cloudflare Worker，設定在 `wrangler.jsonc`：`workers/app.ts` 處理轉址和 `/api/*`，其他網址交給 React Router 在伺服器上畫出頁面，靜態檔在 `build/client/`。

| 環境 | 分支 | Worker | R2 bucket |
| --- | --- | --- | --- |
| 正式站 tekuei.com | `main` | 目前仍是 Pages 專案 tekuei-official | `tekuei-cms` |
| 整合測試 | `migrate/rr8` | `tekuei-next` | `tekuei-cms-next` |

正式站還沒切換到 Worker，切換步驟和回復方式見 [docs/rr8-cutover.md](docs/rr8-cutover.md)。在那之前不要把 `migrate/rr8` 合併到 `main`：`main` 一有變動，Pages 就會自動部署。

部署整合測試的 Worker：

```sh
npm run build:next
npx wrangler deploy
```

`build:next` 把 `wrangler.jsonc` 的 `env.next` 寫進 `build/server/wrangler.json`，`wrangler deploy` 讀這個檔案，所以不要再加 `--env next`。管理密碼用 `npx wrangler secret put ADMIN_SECRET --name tekuei-next` 設定，必須是 6 位數字。

### 登入疑難排解

| 狀況 | 處理 |
| --- | --- |
| 本機密碼錯誤 | 確認 `.dev.vars` 的 `ADMIN_SECRET`，改完要重新啟動 `npm run dev` |
| 線上密碼錯誤 | 確認那個 Worker 設了 `ADMIN_SECRET` |
| 顯示「錯太多次」或「網站暫時鎖住」 | 15 分鐘內密碼錯 5 次，全站暫時鎖住，等 15 分鐘再試 |

## 架構

```text
瀏覽器 → Cloudflare Worker（workers/app.ts）
           ├── 轉址（結尾斜線、大小寫）
           ├── /api/*  → functions/api/ → R2 bucket tekuei-cms
           └── 其他    → React Router（伺服器渲染，每頁的 loader 讀 R2）
                                         ├── data.json            全站內容（文章、專案、About）
                                         ├── backup/              data.json 的每日備份
                                         ├── images/              上傳的圖片
                                         └── admin/attempts.json  登入失敗次數
```

每一頁的 loader 用 `readSite`（`src/lib/cf.server.ts`）讀 `data.json`，經過 `parseSiteData`（`src/lib/siteData.ts`）檢查格式，只送出那一頁需要、已發布的內容。R2 讀不到時回 503，`data.json` 不存在時用 `src/data/data.json` 的預設內容。

| Method | Path | 說明 |
| --- | --- | --- |
| GET | `/api/data` | 讀取完整的 `data.json`（含草稿），需要管理密碼 |
| PUT | `/api/data` | 管理員合併寫入，需要帶載入時的版本（`If-Match`） |
| POST | `/api/upload` | 上傳圖片 |
| GET | `/api/file/*` | 讀取上傳的圖片，只開放 `images/` |
| POST | `/api/translate` | 把中文翻成英文，用 Workers AI |
| POST | `/api/admin/verify` | 驗證管理密碼 |

SEO：每一頁的 title、description、canonical、hreflang、og 和 JSON-LD 由 `src/components/PageHead.tsx` 在伺服器上畫出，JSON-LD 的內容在 `src/lib/seo.ts`。`/sitemap.xml` 和 `/llms.txt` 由 `src/routes/sitemap.ts`、`src/routes/llms.ts` 產生。

### 還原備份

每天第一次儲存時，被取代的 `data.json` 會存成 R2 的 `backup/data-<日期>.json`（日期是 UTC）。要還原時，在 Cloudflare Dashboard 的 R2 下載那一天的備份，再上傳覆蓋 `data.json`。

## 專案結構

```text
src/
  root.tsx                 全站外殼：<html>、head、Provider、頁首、捲動
  routes.ts、routes/       路由表和每一頁的 route module（loader、狀態碼）
  entry.server.tsx         伺服器渲染的入口
  components/              頁面（XxxPage.tsx）和共用元件
  components/<頁面>/       只有那一頁用的元件，例如 journal/、work/、admin/
  components/dev/          Component Library，只在開發模式
  context/、hooks/         React Context（編輯模式的狀態）和 hook
  data/                    所有文案與內容，雙語形狀是 { zh, en }
  data/cases/              案例內容，一個案例一檔
  data/data.json           R2 的 fallback 內容，不要刪除或覆寫
  i18n/                    語言：從網址算出，useLocalePath 產生站內連結
  lib/                     不依賴 React 的邏輯和 Canvas 效果，*.server.ts 只在伺服器執行
  labs/                    互動實驗，每個 lab 一個資料夾
  styles/                  CSS，一頁一檔，tokens.css 是全站 token
  assets/                  圖片和影片，依頁面分資料夾
workers/                   Worker 入口（app.ts）和 /api 的路由表（api.ts）
functions/api/             API 的處理函式
scripts/                   seed-data.ts、checkPages.ts、noSlop.ts 和 node --test 測試
public/                    原樣複製到 build/client/，不要放測試檔
docs/                      遷移計畫和切換清單
```

TypeScript 設定分成三組：`tsconfig.app.json`（`src/`）、`tsconfig.functions.json`（`functions/` 和 `workers/`，Workers 型別）、`tsconfig.node.json`（`scripts/` 和設定檔）。

## 貢獻

開始前先讀 [AGENTS.md](AGENTS.md)，它是 AI 與協作者的工作規範。

提交變更前：

1. 執行 `npm run lint`、`npm run build` 和 `npm test`，三者都必須通過。
2. 畫面有變時，在瀏覽器看手機 375px、桌面 1440px、寬螢幕 2560px 三種寬度。
3. 有動畫時，確認「減少動態效果」開啟時畫面正常。
4. 不要 commit `.env.local`、`.dev.vars` 或任何金鑰，不要直接 push 到 `main`。

## 授權

本專案沒有 LICENSE 檔案，程式碼和內容保留所有權利。合作單位的 logo、客戶網站的截圖和影片屬於各自的權利人，只用來展示合作過的作品。
