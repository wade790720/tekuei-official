# TEKUEI 德溎官網

> Repo 名稱是 `tekuei-official`；網站品牌名是 **TEKUEI 德溎**。

![react](https://img.shields.io/badge/React-19-61DAFB)
![vite](https://img.shields.io/badge/Vite-6-646CFF)
![router](https://img.shields.io/badge/React%20Router-7-CA4245)
![cloudflare](https://img.shields.io/badge/Cloudflare-Pages%20%2B%20R2-F38020)
![lang](https://img.shields.io/badge/lang-zh%20%2F%20en-c99a63)

這是 Wade 的個人網站，文章是主角，案例第二，聯絡方式第三。
Wade 在網站前台直接寫 Journal 文章，內容存在 Cloudflare R2。
網站不賣服務，網站本身就是能力的展示。

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

Wade 寫了十年程式，也做了兩年策展。網站要讓人看得出他會寫程式，也有美感。
新增一篇文章或一個案例，只需要幾分鐘。產品方向見 [PRODUCT.md](PRODUCT.md)，視覺規範見 [DESIGN.md](DESIGN.md)。

## 安裝

| 項目 | 版本或說明 |
| --- | --- |
| 作業系統 | Windows、macOS、Linux 皆可 |
| Node.js | 能跑 Vite 6 的版本（`node --test` 用來跑測試） |
| npm | 隨 Node.js 安裝 |
| Wrangler | 已在 devDependencies，本機跑 Functions 和部署時使用 |

技術：React 19、React Router 7（library 模式）、Vite 6、Tiptap、Lenis、原生 Canvas 2D。

### 本機開發

```sh
npm install
npm run dev        # Vite，預設讀 bundled 的 src/data/data.json
```

要連遠端 R2 API 時，複製 `.env.example` 成 `.env.local`，設定 `VITE_USE_REMOTE=true` 和 `VITE_DEV_PROXY_TARGET`。

> 注意：`.env.local` 把 `/api` 代理到正式站時，在本機登入或儲存會寫到正式資料。

### 本機跑 Functions 和 R2

```sh
cp .dev.vars.example .dev.vars   # 填入 ADMIN_SECRET
npm run dev:pages                # build 後用 wrangler 跑，http://localhost:8788
```

## 使用方式

### 頁面

| 網址 | 內容 |
| --- | --- |
| `/` | 首頁 Hero |
| `/journal`、`/journal/:slug` | 文章列表和文章頁 |
| `/work`、`/cases/:slug` | 案例列表和案例頁 |
| `/about` | 關於 |
| `/checkin`、`/how-to-checkin` | LIFF 報到 |
| `/dev/component-library` | Component Library（只在開發模式） |

右上角的語言按鈕切換中英文。語言存在 `localStorage` 的 `lang`，網址不變。

### 編輯 Journal

1. 在網站上按 Ctrl+S（Mac 是 ⌘+S）。
2. 輸入 6 位數密碼，也就是 Pages 的 `ADMIN_SECRET`。
3. 編輯面板從右側滑出，頁面變成即時預覽。
4. 修改後再按一次 Ctrl+S，或按面板上的「儲存」。

只有 Journal 可以在前台編輯。About、Work、案例頁的內容改在 `src/data/`。

### 測試與檢查

```sh
npm run lint     # ESLint
npm run build    # 正式 build，輸出到 dist/
npm test         # node --test（電話格式、程式碼上色、Rich Text、SEO）
```

## 部署

部署 Functions 前，必須先建好 R2。沒有 bucket 時，部署會失敗並顯示 `R2 bucket 'tekuei-cms' not found`。

### 首次部署

1. **建立 R2 bucket。** Dashboard → R2 Object Storage → 建立 `tekuei-cms`。名稱要和 `wrangler.toml` 的 `bucket_name` 一致。不需要開 r2.dev 公開網址。
2. **綁定 R2。** Workers & Pages → tekuei-official → Settings → Bindings → Add → R2 bucket。Variable name 填 `BUCKET`（大寫），Bucket 選 `tekuei-cms`。
3. **設定管理密碼。** 執行下面的指令，輸入 6 位數字。

   ```sh
   npx wrangler pages secret put ADMIN_SECRET --project-name=tekuei-official
   ```

4. **上傳 data.json。** 先執行 `npx wrangler login`，再執行 `npm run seed`。它上傳到雲端 R2，不是本機模擬。
5. **重新部署。** Deployments → Retry deployment。Functions 要重新部署才讀得到新的 Secret。

### Pages 建置設定

| 欄位 | 值 |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Deploy command | 留空，或 `npm run deploy` |

不要用 `npx wrangler deploy`。那是獨立 Worker 的指令，會部署失敗。

### 登入疑難排解

| 狀況 | 處理 |
| --- | --- |
| 正式站密碼錯誤 | 確認 `ADMIN_SECRET` 設在 Pages 專案，並且已重新部署 |
| 本機 `npm run dev` 登入失敗 | `npm run dev` 沒有 `/api`。改用 `npm run dev:pages`，或設定 `VITE_DEV_PROXY_TARGET` |
| 確認 API | `curl -X POST https://你的網域/api/admin/verify -H "Authorization: Bearer 你的密碼"` 應回 `200` |

## 架構

```text
瀏覽器 → Cloudflare Pages（dist/ 靜態檔）
       → Pages Functions（functions/）→ R2 bucket tekuei-cms
                                         ├── data.json        全站內容（含 journal）
                                         └── about/images/    圖片
```

圖片經同網域的 `/api/file/*` 讀取，不需要 r2.dev。R2 沒有資料時，網站用 `src/data/data.json` 當 fallback。

| Method | Path | 說明 |
| --- | --- | --- |
| GET | `/api/data` | 讀取 `data.json` |
| PUT | `/api/data` | 管理員合併寫入（Bearer `ADMIN_SECRET`） |
| POST | `/api/upload` | 上傳圖片 |
| GET | `/api/file/*` | 讀取 bucket 裡的檔案 |
| POST | `/api/admin/verify` | 驗證管理密碼 |

SEO：`functions/journal/` 把文章內文、meta 和 JSON-LD 寫進 HTML。`sitemap.xml.js` 和 `llms.txt.js` 產生 sitemap 和 llms.txt。邏輯在 `src/lib/seo.js`。

## 專案結構

```text
index.html                 Vite 入口，載入 Google Fonts
src/
  App.jsx                  路由
  components/              頁面（XxxPage.jsx）和共用元件
  components/<頁面>/       只有那一頁用的元件，例如 journal/、case/、admin/
  components/dev/          Component Library（只在開發模式）
  data/                    所有文案與內容，雙語形狀是 { zh, en }
  data/cases/              案例內容，一個案例一檔
  data/data.json           R2 的 fallback 內容，不要刪除或覆寫
  lib/                     不依賴 React 的邏輯和 Canvas 效果
  hooks/                   React hook
  styles/                  CSS，一頁一檔；tokens.css 是全站 token
  assets/                  圖片，依頁面分資料夾
functions/                 Pages Functions：API、Journal SEO、sitemap、llms.txt
scripts/                   seed-data.mjs 和 node --test 測試
public/                    原樣複製到 dist/，不要放測試檔
```

## 貢獻

開始前先讀 [AGENTS.md](AGENTS.md)。它是 AI 與協作者的工作規範。

提交變更前：

1. 執行 `npm run lint` 和 `npm run build`，兩者都必須通過。改到 `scripts/` 或 `src/lib/phoneE164.js` 時，也要跑 `npm test`。
2. 畫面有變時，在瀏覽器看手機 375px、桌面 1440px、寬螢幕 2560px 三種寬度。
3. 有動畫時，確認「減少動態效果」開啟時畫面正常。
4. 不要 commit `.env.local`、`.dev.vars` 或任何金鑰。不要直接 push 到 `main`。

### 備份內容

後台下載 JSON，覆蓋 `src/data/data.json`，再 commit。

## 授權

本專案沒有 LICENSE 檔案。

`src/assets/journal/footer-sea.webp` 是參考網站的截圖，上線前要換成有授權的圖。
