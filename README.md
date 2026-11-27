# TEKUEI 德溎官網

> Repo 名稱是 `tekuei-official`，網站品牌名是 **TEKUEI 德溎**。

![react](https://img.shields.io/badge/React-19-61DAFB)
![typescript](https://img.shields.io/badge/TypeScript-strict-3178C6)
![vite](https://img.shields.io/badge/Vite-6-646CFF)
![router](https://img.shields.io/badge/React%20Router-7-CA4245)
![cloudflare](https://img.shields.io/badge/Cloudflare-Pages%20%2B%20R2-F38020)
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
| Wrangler | 已在 devDependencies，本機跑 Functions 和部署時使用 |

技術：React 19、React Router 7（library 模式）、TypeScript（strict）、Vite 6、Tiptap 3、Lenis、原生 Canvas 2D 和 WebGL。

### 本機開發

```sh
npm install
npm run dev        # Vite，預設讀 bundled 的 src/data/data.json
```

要讀正式站的資料時，複製 `.env.example` 成 `.env.local`，設定 `VITE_USE_REMOTE=true` 和 `VITE_DEV_PROXY_TARGET`。

> 注意：`.env.local` 把 `/api` 代理到正式站時，在本機登入或儲存會寫到正式資料。測試編輯功能之前，先在瀏覽器主控台執行 `await import('/scripts/fakeAdminApi.ts')`，把 `/api` 換成假的，重新整理後要再執行一次。

### 本機跑 Functions 和 R2

```sh
cp .dev.vars.example .dev.vars   # 填入 ADMIN_SECRET
npm run dev:pages                # build 後用 wrangler 跑，http://localhost:8788
```

## 使用方式

### 頁面

| 網址 | 內容 |
| --- | --- |
| `/` | 首頁 Hero（錦鯉池） |
| `/journal`、`/journal/:slug` | 文章列表和文章頁 |
| `/projects`、`/projects/:slug` | 專案列表和專案內頁（含三個案例頁） |
| `/labs/:slug`、`/labs/:slug/live` | 互動實驗的介紹頁和全螢幕預覽 |
| `/about` | 關於 |
| `/checkin`、`/how-to-checkin` | LINE LIFF 報到 |
| `/dev/component-library` | Component Library，只在開發模式 |

舊網址 `/work` 和 `/cases/:slug` 會轉到 `/projects`。右上角的語言按鈕切換中英文，語言存在 `localStorage` 的 `lang`，網址不變。

### 編輯內容

在網站上按 Ctrl+S（Mac 是 ⌘+S）登入編輯模式，再按一次 Ctrl+S 儲存。可以在前台編輯的有 Journal、Projects 和 About，文章內文直接在頁面上編輯，標題、標籤、日期等欄位在右側的編輯面板。文章有草稿和已發布兩種狀態，草稿停止打字 3 秒後自動儲存。最早的三個案例頁內文寫在 `src/data/cases/`，只有卡片欄位能在面板改。

完整的編輯規格見 [PAGES.md](PAGES.md) 的「編輯模式」。

### 測試與檢查

```sh
npm run lint     # ESLint、noSlop（註解和 CSS 規則）、tsc 型別檢查
npm run build    # 正式 build，輸出到 dist/
npm test         # node --test，執行 scripts/*.test.ts
```

## 部署

`main` 推上 GitHub 後，Cloudflare Pages 自動建置並發布 `dist/` 和 `functions/`。部署 Functions 前必須先建好 R2，沒有 bucket 時部署會失敗並顯示 `R2 bucket 'tekuei-cms' not found`。

### 首次部署

1. **建立 R2 bucket。** Dashboard → R2 Object Storage → 建立 `tekuei-cms`。名稱要和 `wrangler.toml` 的 `bucket_name` 一致，不需要開 r2.dev 公開網址。
2. **綁定 R2 和 Workers AI。** Workers & Pages → tekuei-official → Settings → Bindings，加一個 R2 bucket，Variable name 填 `BUCKET`，Bucket 選 `tekuei-cms`。英文翻譯用的 `AI` 綁定寫在 `wrangler.toml`。
3. **設定管理密碼。** 執行下面的指令，輸入密碼。

   ```sh
   npx wrangler pages secret put ADMIN_SECRET --project-name=tekuei-official
   ```

4. **上傳 data.json。** 先執行 `npx wrangler login`，再執行 `npm run seed`，它上傳到雲端 R2，不是本機模擬。
5. **重新部署。** Deployments → Retry deployment，Functions 要重新部署才讀得到新的 Secret。

### Pages 建置設定

| 欄位 | 值 |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Deploy command | 留空，或 `npm run deploy` |

不要用 `npx wrangler deploy`，那是獨立 Worker 的指令，會部署失敗。

### 登入疑難排解

| 狀況 | 處理 |
| --- | --- |
| 正式站密碼錯誤 | 確認 `ADMIN_SECRET` 設在 Pages 專案，並且已重新部署 |
| 本機 `npm run dev` 登入失敗 | `npm run dev` 沒有 `/api`，改用 `npm run dev:pages`，或設定 `VITE_DEV_PROXY_TARGET` |
| 顯示「錯太多次」 | 密碼錯太多次，全站暫時鎖住，等一段時間再試 |

## 架構

```text
瀏覽器 → Cloudflare Pages（dist/ 靜態檔）
       → Pages Functions（functions/）→ R2 bucket tekuei-cms
                                         ├── data.json            全站內容（文章、專案、About）
                                         ├── backup/              data.json 的每日備份
                                         ├── images/              上傳的圖片
                                         └── admin/attempts.json  登入失敗次數
```

R2 的資料在進站時由 `parseSiteData`（`src/lib/siteData.ts`）檢查格式，某個區段格式不對時，編輯器拒絕儲存，不會蓋掉正式資料。R2 沒有資料時，網站用 `src/data/data.json` 當 fallback。

| Method | Path | 說明 |
| --- | --- | --- |
| GET | `/api/data` | 讀取 `data.json` |
| PUT | `/api/data` | 管理員合併寫入，需要帶載入時的版本（`If-Match`） |
| POST | `/api/upload` | 上傳圖片 |
| GET | `/api/file/*` | 讀取上傳的圖片，只開放 `images/` |
| POST | `/api/translate` | 把中文翻成英文，用 Workers AI |
| POST | `/api/admin/verify` | 驗證管理密碼 |

SEO：`functions/journal/`、`functions/projects/`、`functions/labs/` 和 `functions/about.ts` 把內文、meta 和 JSON-LD 寫進 HTML，`sitemap.xml.ts` 和 `llms.txt.ts` 產生 sitemap 和 llms.txt，邏輯在 `src/lib/seo.ts`。

### 還原備份

每天第一次儲存時，被取代的 `data.json` 會存成 R2 的 `backup/data-<日期>.json`（日期是 UTC）。要還原時，在 Cloudflare Dashboard 的 R2 下載那一天的備份，再上傳覆蓋 `data.json`。

## 專案結構

```text
index.html                 Vite 入口，載入 Google Fonts
src/
  main.tsx、App.tsx        進入點和路由
  components/              頁面（XxxPage.tsx）和共用元件
  components/<頁面>/       只有那一頁用的元件，例如 journal/、work/、admin/
  components/dev/          Component Library，只在開發模式
  data/                    所有文案與內容，雙語形狀是 { zh, en }
  data/cases/              案例內容，一個案例一檔
  data/data.json           R2 的 fallback 內容，不要刪除或覆寫
  lib/                     不依賴 React 的邏輯和 Canvas 效果，資料型別在 siteData.ts
  hooks/、context/         React hook 和 Context
  labs/                    互動實驗，每個 lab 一個資料夾
  styles/                  CSS，一頁一檔，tokens.css 是全站 token
  assets/                  圖片和影片，依頁面分資料夾
functions/                 Pages Functions：API、各頁 SEO、sitemap、llms.txt
scripts/                   seed-data.ts、noSlop.ts 和 node --test 測試
public/                    原樣複製到 dist/，不要放測試檔
```

TypeScript 設定分成三組：`tsconfig.app.json`（`src/`）、`tsconfig.functions.json`（`functions/`，Workers 型別）、`tsconfig.node.json`（`scripts/` 和設定檔）。

## 貢獻

開始前先讀 [AGENTS.md](AGENTS.md)，它是 AI 與協作者的工作規範。

提交變更前：

1. 執行 `npm run lint`、`npm run build` 和 `npm test`，三者都必須通過。
2. 畫面有變時，在瀏覽器看手機 375px、桌面 1440px、寬螢幕 2560px 三種寬度。
3. 有動畫時，確認「減少動態效果」開啟時畫面正常。
4. 不要 commit `.env.local`、`.dev.vars` 或任何金鑰，不要直接 push 到 `main`。

## 授權

本專案沒有 LICENSE 檔案，程式碼和內容保留所有權利。合作單位的 logo、客戶網站的截圖和影片屬於各自的權利人，只用來展示合作過的作品。
