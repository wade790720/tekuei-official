# React Router framework 模式遷移計畫

這份計畫要讓網站從 React Router library 模式（`src/App.tsx` 的 `BrowserRouter`）改成 framework 模式，由伺服器直接畫出每一頁，語言放進網址，英文版也能被搜尋引擎收錄。PRODUCT.md 已經決定這個方向，這份文件只回答怎麼做、分幾步、每一步怎麼驗證，以及哪些事要 Wade 決定。這次沒有改任何程式碼，也沒有安裝套件。

## 結論

建議用 React Router 8.5.3 的 framework 模式，部署到 Cloudflare Workers（靜態檔加 Worker），本機開發和建置用 `@cloudflare/vite-plugin`。每一頁由自己的 loader 從 R2 讀資料，只回傳這一頁要的已發布內容，伺服器用現有的 `RichText` 畫出內文，`src/lib/seo.ts` 的 HTML 注入和 `functions/` 裡的頁面 Function 全部刪掉。編輯模式維持在瀏覽器裡執行，儲存仍走 `PUT /api/data`，ETag、`If-Match`、409 和每日備份的行為不變。

工作分成七個 PR，第一個直接合進 `main`，正式站看不出差別，第二到第六個合進一條整合分支，部署到另一個 Worker 和另一個 R2 bucket 測試，正式站在第七個 PR 切換網域之前都留在現在的 Cloudflare Pages，隨時可以退回。

和任務描述不同的地方有兩個，一是 React Router 目前的穩定版是 8，不是 7，二是 Cloudflare 官方對 React Router framework 模式的支援只剩 Workers，Pages 沒有對應的 Vite 外掛，這兩點都列在最後的「需要 Wade 決定的事」。

## 一、目標架構

### 1.1 版本

npm registry 上 `react-router` 和 `@react-router/dev` 的最新版是 8.5.3（2026-06-17 發布 8.0），`react-router-dom` 停在 7.18.7，v8 已經不再提供這個套件，所有匯入改成 `react-router`，瀏覽器端的元件改從 `react-router/dom` 匯入。v8 和這個專案有關的變化如下：

- `@react-router/dev` 要求 Vite 7 或 8，現在是 6.4.3，要升級。
- `react-router` 要求 React 19.2.7 以上，現在鎖在 19.2.5。
- Node 要 22.22 以上，本機是 22.23.3，可以。
- middleware 一律開啟，loader 和 action 收到的 `context` 一定是 `RouterContextProvider`，舊版的 `AppLoadContext` 和網路上常見的 `context.cloudflare.env` 寫法在 v8 不能用。
- `meta` 函式的 `data` 參數改名為 `loaderData`。
- `cloudflareDevProxy` 被移除，改用 Cloudflare 自己的 Vite 外掛。

Cloudflare 的官方 starter（`cloudflare/templates` 的 `react-router-starter-template`）還停在 7.18.5，照範本做會先裝到 v7，之後升 v8 時綁定的寫法和 Vite 版本都要再改一次，所以直接從 v8 開始。

### 1.2 部署目標：Workers，不是 Pages

React Router 的部署文件只連到 Cloudflare Workers 的指南，Cloudflare 舊的 Pages 版 React Router 指南已經下架，Pages 遷移指南也寫明 Vite 外掛只支援 Workers。Pages 仍然可以用 `@react-router/cloudflare` 的 `createPagesFunctionHandler` 跑，但本機開發沒有整合，也沒有 v8 的官方範例，所以不建議留在 Pages。

改用 Workers 之後：

- `vite dev` 和 `vite preview` 都在本機的 workerd 裡執行，loader 用的 R2 是本機模擬的 bucket，不是正式資料。
- 部署指令從 `wrangler pages deploy dist` 改成 `wrangler deploy`，Git 連動改用 Workers Builds。
- `wrangler.toml` 改成 `wrangler.jsonc`，`BUCKET`、`AI` 兩個綁定照搬，`ADMIN_SECRET` 要在 Worker 重新設定一次，Pages 的密鑰不會自動帶過去。
- 自訂網域 `tekuei.com` 從 Pages 專案移到 Worker，在第七個 PR 做。

### 1.3 檔案配置

`react-router.config.ts` 設 `appDirectory: "src"`，原本的資料夾結構不動。

| 檔案 | 狀態 | 用途 |
|---|---|---|
| `react-router.config.ts` | 新增 | `appDirectory: "src"`、`ssr: true`，不設 `prerender` |
| `src/routes.ts` | 新增 | 路由表，取代 `App.tsx` 的 `<Routes>` |
| `src/root.tsx` | 新增 | `Layout`（原本的 `index.html`：字型、favicon、全站 meta、`<div id="root">`）、`App`（Provider、`SiteNav`、`ScrollClasses`）、`ErrorBoundary`（原本的 `PageBoundary` 和 `PageError`） |
| `src/entry.server.tsx` | 新增 | 用 `renderToReadableStream`，每個請求都等 `allReady` 再送出，讀者和爬蟲拿到一樣的完整 HTML |
| `src/routes/*.tsx` | 新增 | 每一頁一個很薄的 route module：`loader` 加上 default export，畫面仍是 `src/components/` 裡原本的頁面元件 |
| `src/lib/cf.server.ts` | 新增 | 綁定的 context（見 1.6）和讀 R2 的 `readSite` |
| `workers/app.ts` | 新增 | Worker 入口：先把 `/api/*` 交給原本的 handler，其他交給 React Router，外面包原本的 CORS middleware |
| `wrangler.jsonc` | 取代 `wrangler.toml` | `main`、`assets`、綁定、`compatibility_date`、`observability` |
| `index.html`、`src/main.tsx` | 刪除 | 內容搬進 `src/root.tsx`，`createRoot` 換成 framework 預設的 hydrate |
| `functions/journal/`、`projects/`、`labs/`、`cases/`、`about.ts`、`sitemap.xml.ts`、`llms.txt.ts` | 刪除 | 由 route module 和 resource route 取代 |
| `functions/api/*`、`functions/_middleware.ts`、`functions/env.d.ts` | 保留 | handler 的程式碼不動，改由 `workers/app.ts` 呼叫 |
| `public/_redirects` | 刪除 | 兩條規則改寫成 loader（見第七節） |

route module 只負責資料和 head，畫面仍在 `src/components/`，所以 AGENTS.md 的「頁面放 `src/components/XxxPage.tsx`」不用改，資料夾表多加 `src/routes/` 和 `workers/` 兩列。

### 1.4 路由表

```ts
// src/routes.ts
import { type RouteConfig, index, route, prefix } from '@react-router/dev/routes'

// 同一組頁面掛兩次，一次在根目錄（中文），一次在 /en（英文），id 要不同
const pages = (p: '' | 'en-') => [
  index('routes/home.tsx', { id: `${p}home` }),
  route('about', 'routes/about.tsx', { id: `${p}about` }),
  route('journal', 'routes/journal.tsx', { id: `${p}journal` }),
  route('journal/:slug', 'routes/journal-post.tsx', { id: `${p}journal-post` }),
  route('projects', 'routes/projects.tsx', { id: `${p}projects` }),
  route('projects/:slug', 'routes/project.tsx', { id: `${p}project` }),
  route('labs/:slug', 'routes/lab.tsx', { id: `${p}lab` }),
  route('how-to-checkin', 'routes/how-to-checkin.tsx', { id: `${p}how-to-checkin` }),
  route('work', 'routes/moved-work.ts', { id: `${p}moved-work` }),
  route('cases/:slug', 'routes/moved-case.ts', { id: `${p}moved-case` }),
]

export default [
  ...pages(''),
  ...prefix('en', pages('en-')),
  route('labs/:slug/live', 'routes/lab-live.tsx'),
  route('checkin', 'routes/checkin.tsx'),
  route('sitemap.xml', 'routes/sitemap.ts'),
  route('llms.txt', 'routes/llms.ts'),
  ...(process.env.NODE_ENV === 'development'
    ? [route('dev/component-library/:page?', 'routes/dev-library.tsx')]
    : []),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
```

不用 `:lang?` 可選片段，因為它會吃掉任何第一段路徑，每個 loader 都要自己檢查值，`prefix('en', …)` 比較清楚。`/labs/:slug/live` 和 `/checkin` 只有一個網址（見第二節）。

### 1.5 哪些頁面 SSR、哪些 prerender、哪些只在瀏覽器

全部頁面都 SSR，不 prerender。prerender 在建置時讀 R2，Journal 和 Projects 的內容在 Wade 儲存之後不會跟著更新，而首頁、Lab 這些不讀 R2 的頁面本來就很快，prerender 省下的時間不值得多一條建置時要連到正式 R2 的路徑。

| 頁面 | 伺服器畫出的內容 | 只在瀏覽器執行的部分 |
|---|---|---|
| 首頁 `/` | 四角的文字、「WADE CHU」 | 錦鯉池、顆粒光、水波 |
| Journal 列表、文章頁 | 標題、標籤、完整內文、分享按鈕 | 字元雨、編輯器、面板 |
| Projects 列表、專案內頁、三個案例頁 | 卡片、開場、資訊列、內文、影片標籤 | 量測標註線、編輯器、面板 |
| About | 內文、合作單位 | 顆粒光、編輯器、工具列 |
| Lab 頁 | 標題、介紹、參考來源、更多 Labs | iframe 裡的效果 |
| `/labs/:slug/live` | 空的外殼 | 整個效果 |
| `/checkin` | 頁面外殼 | LIFF SDK、電話輸入 |
| `/how-to-checkin` | 全部步驟和圖片 | 無 |

### 1.6 綁定怎麼進到 loader

v8 沒有 `AppLoadContext`，綁定用 `createContext` 放進 `RouterContextProvider`。這個寫法是從 v8 的型別推出來的，Cloudflare 還沒有 v8 的官方範例，第二個 PR 要先實際建置確認。

```ts
// src/lib/cf.server.ts
import { createContext } from 'react-router'
import type { Env } from '../../functions/env.d.ts'

export const cf = createContext<{ env: Env; ctx: ExecutionContext }>()

// workers/app.ts
const handler = createRequestHandler(() => import('virtual:react-router/server-build'), import.meta.env.MODE)

export default {
  fetch(request, env, ctx) {
    const context = new RouterContextProvider()
    context.set(cf, { env, ctx })
    return handler(request, context)
  },
} satisfies ExportedHandler<Env>

// loader 裡
const { env } = context.get(cf)
```

不用 `import { env } from 'cloudflare:workers'`。它比較短，但 loader 會綁死在 workerd 上，`node --test` 沒辦法像現在的 `scripts/dataApi.test.ts` 一樣傳 `scripts/fakeR2.ts` 進去測。

`ADMIN_SECRET` 和 `AI` 只有 `/api/*` 的 handler 用到，loader 不碰它們。`Env` 型別繼續用手寫的 `functions/env.d.ts`，測試的假 bucket 才放得進去，`wrangler types` 產生的 `worker-configuration.d.ts` 只給 `workers/app.ts` 用來檢查兩者相容。

### 1.7 API 和 CORS

`workers/app.ts` 用一張表把 `/api/data`、`/api/upload`、`/api/file/*`、`/api/translate`、`/api/admin/verify` 對到原本的 `onRequestGet`、`onRequestPut`、`onRequestPost`。這些 handler 都只收 `{ request, env }`，程式碼不用改，`scripts/*.test.ts` 也照樣能測。API 不改成 React Router 的 action，原因寫在第五節。

`functions/_middleware.ts` 現在對所有路徑生效，只處理 localhost 來的 CORS。`workers/app.ts` 把它包在最外層，行為不變。它的參數型別是 Pages 的 `EventContext`，Worker 裡沒有這個物件，要把型別改成只要 `request` 和 `next` 的寫法，邏輯一行不動。AGENTS.md 規定不改這個檔案，所以這一點列為待決定的事。

## 二、語言放進網址

### 2.1 網址

中文在根目錄，英文在 `/en` 底下：`/journal/abc` 和 `/en/journal/abc` 是同一篇文章。canonical 一律不帶結尾斜線，`/en/` 由 loader 301 到 `/en`。`/checkin`（LINE 後台登記過的 LIFF 網址）和 `/labs/:slug/live`（Lab 頁 iframe 的內容）只有一個網址，不加 `/en`。

### 2.2 `useLang` 怎麼改

`useLang()` 有 35 個呼叫點，都是 `XXX[lang]` 查表，介面維持 `{ lang, toggle }`，呼叫點一個都不用改。改的只有 `src/i18n/LangProvider.tsx`：

- `lang` 從網址算出來（路徑是 `/en` 或以 `/en/` 開頭就是英文），不再讀 `localStorage`，伺服器和瀏覽器算出同一個值，不會有 hydration 不一致。
- `toggle` 改成 `navigate()` 到另一個語言的同一頁，帶 `preventScrollReset`，捲動位置不變。
- `<html lang>` 改由 `src/root.tsx` 的 `Layout` 直接輸出，不在 effect 裡設。

舊的 `localStorage` `lang` 不再讀取，第一次載入時刪掉。之前選了英文的讀者會先看到中文，再按一次語言按鈕，這一點列為待決定的事。

### 2.3 水波按鈕

`SiteNav` 的 `playWaterRipple(x, y, toggle)` 不用改，`onSwap` 還是在 300 ms 時呼叫 `toggle`。差別在 `toggle` 變成換頁，換頁要等 loader，為了讓字仍在水波最強的時候換掉，要做三件事：

1. 每一頁的 loader 回傳這一頁的中英兩份內容（形狀照 `src/data/` 的 `{ zh, en }`），兩種語言的網址拿到的資料相同。
2. 每個 route module 匯出 `shouldRevalidate`，只差語言前綴的換頁回傳 `false`，換語言時不重新打 loader，畫面直接換字。
3. `src/App.tsx` 的 `ScrollClasses`（搬進 `src/root.tsx`）把只差語言前綴的換頁當成同一頁，不捲回頂端，也不把焦點移到 `h1`。

### 2.4 站內連結

寫死的站內路徑大約 31 處：`to=` 和 `href="/..."` 21 處、`navigate()` 2 處、`src/data`、`src/lib`、`src/labs` 裡約 10 處（包括 `HOME_FOOTER`）。資料裡的路徑維持不帶語言，畫出來時才加前綴：新增一個 `useLocalePath()`，回傳 `(path) => lang === 'en' ? '/en' + path : path`，這幾處改成經過它。`SiteFooter` 判斷目前頁和 `AppNav` 判斷頁首樣式的地方，改成先去掉語言前綴再比對。

### 2.5 hreflang 和 sitemap

每一頁的 head 輸出三條 `<link rel="alternate">`：`hreflang="zh-Hant"`、`hreflang="en"`、`hreflang="x-default"`（指向中文）。英文內文還是空的文章（PAGES.md 說英文版先顯示中文），英文網址的 canonical 指向中文網址，也不輸出 `hreflang="en"`，sitemap 只列中文網址，避免兩個網址被當成重複內容。

`/sitemap.xml` 改成 resource route，每個網址列一次，用 `<xhtml:link rel="alternate">` 標出另一個語言，`lastmod` 照舊讀 `updated`。`/llms.txt` 同樣改成 resource route，內容不變，只多列英文版的網址。

## 三、資料：每一頁自己的 loader

### 3.1 現況

`JournalProvider`、`WorkProvider` 掛在所有路由外面，任何一頁載入都會打 `GET /api/data`，下載整份 `data.json`，包括全部文章和草稿（`.audit/risks.md` 第 3、4 項），連首頁、`/checkin` 和 Lab 的 iframe 也一樣。

### 3.2 改成 loader 之後

- `src/lib/cf.server.ts` 的 `readSite(context)` 從 `env.BUCKET` 讀 `data.json`，經過 `parseSiteData` 解析後回傳。它取代 `src/lib/seo.ts` 的 `readSiteData`。
- 每個 loader 從結果裡挑這一頁要的東西，先過 `publishedJournal`、`publishedWork` 再回傳。文章頁只回傳這一篇和上一篇、下一篇的標題，列表只回傳卡片欄位，首頁、Lab、`/checkin` 的 loader 完全不讀 R2。
- 草稿在讀者的頁面上從此不存在，不是藏起來，而是伺服器根本沒有送出。
- `parseSiteData` 留在 `src/lib/siteData.ts`，在 R2 的邊界（`readSite`）和編輯器的邊界（`adminApi.ts`）各呼叫一次，位置和現在的兩個邊界一樣，型別照舊從那裡匯入。

R2 回 404（bucket 還沒有資料）和讀取失敗要分開處理，這是現在 `loadFailed` 的規則：

| R2 的結果 | 讀者看到的 | 狀態碼 |
|---|---|---|
| 有資料 | 正常頁面 | 200，`Cache-Control: public, max-age=300` |
| `data.json` 不存在 | 用 `siteDefaults` 畫頁面，Journal 是空的 | 200 |
| 讀取失敗、JSON 壞掉、該區段 `invalid` | 錯誤畫面 | 503，`no-store` |
| slug 找不到或是草稿 | 找不到畫面 | 404，`no-store` |

現在 R2 失敗時回 404，改成 503 之後，搜尋引擎不會因為一次讀取失敗就把文章當成刪除。

`src/lib/adminApi.ts` 模組層的 `siteDataRequest` 單例在 Worker 上會跨請求共用，不能被 loader 匯入。loader 只匯入 `*.server.ts`，`adminApi.ts` 只在瀏覽器執行，第二個 PR 加一條 ESLint `no-restricted-imports` 規則守住這條線。

`data.json` 的格式在整個遷移過程中不變，舊版和新版可以讀寫同一個 bucket，切換和退回都不用轉換資料。把每個區段拆成獨立的 R2 物件（可以解決第 7 項的假 409）不在這次範圍內。

## 四、刪掉重複的 SEO 程式

伺服器直接用 `RichText` 畫內文之後，`src/lib/seo.ts` 一半的程式是重複的。`RichText` 本身是純函式，各卡片元件只在 effect 和事件裡碰瀏覽器 API，可以直接在伺服器上畫，而且畫出來的比 `docHtml` 完整：底線、刪除線、外部連結的 `target` 和 `rel`、YouTube 的 iframe、`<video>`、程式碼上色，`docHtml` 都沒有（第 18 項）。

| `seo.ts` 的部分 | 處理 |
|---|---|
| `docHtml`、`inlineHtml`、`figure` | 刪除，由 `RichText` 取代 |
| 各頁 builder 的 `html:` 字串 | 刪除，由頁面元件取代 |
| `injectPage`、`servePage`、`rendered`、`serveProject`、`serveCase` 的外殼流程 | 刪除，由 loader 和 `ErrorBoundary` 取代 |
| `casePage`（三個案例頁只寫卡片文字） | 刪除。案例資料匯入的 mp4 在 Vite 建置裡會變成帶 hash 的網址，限制消失，`CaseStudyPage` 可以畫出完整內文和影片 |
| `PERSON`、`SITE_URL`、`jsonLd`（防 `</script>`）、`isoDate` | 保留 |
| BlogPosting、Blog、CreativeWork、CollectionPage、ProfilePage 的 JSON-LD 物件 | 保留成純函式，多收一個 `lang`，`inLanguage` 跟著語言 |
| `imageUrl`、`firstImage`（og:image 的選法） | 保留 |
| `siteJournal`、`siteCases` | 保留，loader 共用 |
| `sitemapXml`、`llmsTxt` | 保留，由 resource route 呼叫 |
| `MOVED` | 保留，由 `routes/moved-case.ts` 使用 |

head 的寫法用 React 19 原生的 `<title>`、`<meta>`、`<link>`、`<script type="application/ld+json">`，直接寫在頁面元件裡。React Router 的文件寫明 React 19 之後建議用內建的 `<meta>` 元素，而且這樣剛好取代現在 12 個頁面在 effect 裡設 `document.title` 的寫法，載入時分頁標題先顯示「Not Found」的問題（第 21 項）也一起消失。全站共用的部分（`og:site_name`、`og:locale`、`twitter:card`、預設 `og.jpg`、`WebSite` 加 `Person` 的 `@graph`）寫在 `src/root.tsx`，`og:locale` 跟著語言輸出 `zh_TW` 或 `en_US`，另一個語言寫成 `og:locale:alternate`。

`scripts/blockTypes.test.ts` 守的是 `docHtml` 和 `RichText` 處理同樣的區塊，兩份變一份之後刪除。`scripts/seo.test.ts` 改成測 JSON-LD builder、og:image 選法、sitemap 和 llms.txt 這些純函式，整頁的輸出改由第九節的 `scripts/checkPages.ts` 驗證。

## 五、編輯模式

編輯模式全部留在瀏覽器裡。`AdminProvider` 的 Ctrl+S 狀態機、`OtpGate`、`SidePanel`、Tiptap `Editor`、3 秒自動儲存、`differsOnlyIn` 都不動，`Editor` 繼續用 `lazy()` 載入，不進伺服器的 bundle。

改變的是資料從哪裡來：

1. 讀者的畫面用 loader 的資料。
2. 進入編輯模式時（`startEditing`），`useCmsSection` 才打 `GET /api/data`，拿到完整的區段（含草稿）和 ETag，之後的 draft、dirty 比對、409 處理都和現在一樣。
3. 儲存成功後呼叫 `useRevalidator().revalidate()`，讀者畫面的 loader 資料跟著更新，取代現在的 `onSiteVersion` 通知。

`JournalProvider`、`WorkProvider` 留在 `src/root.tsx` 的 `App` 裡，換頁時元件不會重掛，未儲存的草稿在換頁後仍然在，這是它們當初放在最外層的原因。loader 在換頁時重新執行，只會更新讀者看到的那一份，不會蓋掉 draft。

儲存維持 `PUT /api/data`，不改成 React Router 的 action，原因有四個：

- 自動儲存靠 `adminApi.ts` 的 `inTurn` 一次只送一個請求，同時送會在 `admin/attempts.json` 被判成鎖定，action 的 `fetcher` 不保證這個順序。
- `If-Match` 和 409 的語意、每日備份到 `backup/data-<日期>.json`、`onlyIf` 條件寫入都已經在 `functions/api/data.ts` 裡，有 `scripts/dataApi.test.ts` 守住。
- `scripts/fakeAdminApi.ts` 攔的是 `fetch`，改成 action 之後它就攔不到了。
- 上傳回傳的 `/api/file/...` 絕對網址已經寫進 R2 的文件裡，這些網址必須維持原樣。

剩下的問題是 `GET /api/data` 仍然公開（第 4 項）。讀者的頁面改成 loader 之後就沒有人需要公開的完整檔案，可以讓它和 `PUT` 一樣先過 `adminGate`。這會讓每次進入編輯模式多一次 `attempts.json` 的讀寫，也表示全站鎖定（第 2 項）時連編輯器都載入不了，碰到 admin 驗證，所以列為待決定的事。

## 六、Canvas、WebGL 和只能在瀏覽器跑的程式

所有 Canvas 和 WebGL 效果（`koiPond`、`grainHaze`、`glyphField`、`measureLines`、`heroFx`、`fallScene`、`shatterImage`）都寫成 `mountXxx(canvas)`，只在 `useEffect` 裡呼叫，模組頂層沒有碰瀏覽器 API，伺服器上不會執行。`prefers-reduced-motion` 的檢查在 `mountXxx` 裡面，也只在瀏覽器執行，行為不變。`waterRipple` 只在事件裡呼叫，`mountReveal` 和 `mountClickSounds` 在 effect 裡掛載，都沒有問題。

只要開了 SSR 就會出錯、必須先改的有五處，第一個 PR 就在現在的 SPA 裡改掉：

| 位置 | 問題 | 改法 |
|---|---|---|
| `src/components/WorkListPage.tsx:62` | 模組頂層呼叫 `window.matchMedia`，伺服器一匯入就當掉 | 改成 `useSyncExternalStore`，伺服器的值是 `true`（減少動態效果），先畫海報圖，hydrate 後才換影片 |
| `src/components/SiteNav.tsx:48` | `useSyncExternalStore` 沒有 `getServerSnapshot`，每一頁都會當掉 | 補上回傳 `false` 的第三個參數 |
| `src/components/journal/ShareLinks.tsx:32` | render 裡讀 `window.location` | 改用 `SITE_URL` 加 `useLocation().pathname` |
| `src/i18n/LangProvider.tsx:12` | `useState` 初始值讀 `localStorage`，hydration 會不一致 | 第二節的改法 |
| `src/main.tsx` | `createRoot` | 刪除，由 framework 的 hydrate 取代 |

另外幾處不會當掉，但會讓伺服器畫出的第一個畫面和 hydrate 之後不同：

- `has-scroll-document`、`lab-live-doc`、`about-fall-doc` 這些 `<html>` 上的 class 現在在 effect 裡才加上，`work.css` 讓 `<html>` 當捲動容器的規則在第一次繪製時不生效，會跳版。改成每個 route module 匯出 `handle: { htmlClass }`，`Layout` 用 `useMatches()` 讀出來直接寫在 `<html>` 上。`is-cms-editing` 只在登入後出現，維持在 effect 裡。
- `SiteNav` 用 `document.getElementById('root')` 加 `inert`，`Layout` 保留一個 `<div id="root">` 包住 `App`，這段不用改。
- `SiteFooter` 的 `new Date().getFullYear()` 只在跨年那一刻不一致，不處理。
- `fade-in` 的元素在 HTML 裡是 `opacity: 0`，沒有執行 JS 的讀者看到空白。文字在 HTML 裡，SEO 讀得到，`Layout` 加一段 `<noscript><style>` 讓 `fade-in` 直接顯示。

為了不再加回同樣的問題，第二個 PR 的 `scripts/checkPages.ts` 對每一條路由的中英兩種網址各發一次請求，任何一條回 500 就失敗。這比在 ESLint 裡列禁止的全域變數準確，effect 裡用 `window` 是合法的，規則分不出來。

## 七、舊網址、404、LIFF

Workers 的靜態檔支援 `_redirects`，但文件寫明由 Worker 處理的請求不套用。這兩條規則改寫成 loader，和其他路由放在同一個地方：

- `routes/moved-work.ts`：`/work` 和 `/en/work` 301 到對應語言的 `/projects`。
- `routes/moved-case.ts`：`/cases/<slug>` 照 `MOVED` 301 到 `/labs/<id>` 或 `/projects/<slug>`，`/en/cases/<slug>` 也一樣。

`public/_redirects` 的 `/* /index.html 200` 刪掉，沒有對到任何路由的網址由 `routes/not-found.tsx` 回 404。現在任何打錯的網址都回 200 的 SPA 外殼，改完之後會是真的 404。`/projects/<slug>`、`/labs/<id>`、`/journal/<slug>` 找不到時，loader 丟出 `data(null, { status: 404 })`，由 `ErrorBoundary` 畫找不到的畫面。

`/checkin` 的網址、行為都不變：伺服器畫出頁面外殼，LIFF SDK 仍在 effect 裡用 script 標籤載入，`react-phone-input-2` 和 `libphonenumber-js` 仍是這一頁才載入。`/checkin` 不加 `/en`，也不做任何轉址。`/how-to-checkin` 的步驟圖片放在 `public/how-to-checkin/`，靜態檔照常提供。LIFF 只能在 LINE 裡測，第七個 PR 切換網域之後要請 Wade 用手機實際報到一次。

## 八、新增和升級的套件

AGENTS.md 規定新增相依套件前要先經過同意，下面是全部的變動，第二個 PR 才會安裝。

| 套件 | 變動 | 版本 | 原因 |
|---|---|---|---|
| `react-router` | 新增為直接相依 | `^8.5.3` | v8 的路由和 framework 執行時。現在它只是 `react-router-dom` 的間接相依 |
| `react-router-dom` | 移除 | 現在 `^7.14.2` | v8 不再提供，19 個檔案的匯入改成 `react-router` |
| `@react-router/dev` | 新增（dev） | `^8.5.3` | Vite 外掛、`routes.ts` 的輔助函式、`react-router typegen` |
| `@cloudflare/vite-plugin` | 新增（dev） | `^1.70.2` | 在 workerd 裡跑 dev 和 preview，建置 Worker |
| `vite` | 升級 | `^6.4.3` 到 `^7.3.8` | `@react-router/dev` 要求 Vite 7 以上。不直接升到 8，8 換了打包器，變動太大 |
| `@vitejs/plugin-react` | 移除 | 現在 `^4.7.0` | `reactRouter()` 已經包含 React 的轉換和熱更新 |
| `react`、`react-dom` | 升級 | `^19.2.5` 到 `^19.3.1` | `react-router` 8 要求 19.2.7 以上 |
| `wrangler` | 升級 | `^4.14.0`（已安裝 4.86.0）到 `^4.169.0` | `@cloudflare/vite-plugin` 要求 4.168 以上 |

不需要的套件：`@react-router/cloudflare`（只有 Pages 的 handler 用到）、`@react-router/node`（不在 Node 上跑）、`isbot`（官方範本用它決定要不要等串流完成，這裡一律等 `allReady`，不用分辨）。

## 九、分階段的 PR

### 9.1 共通的安全規則

`.env.local` 現在把 `/api` 代理到正式站，任何一步都不可以寫到正式資料，所以：

- 第二到第六個 PR 合進整合分支 `migrate/rr8`，不合進 `main`。`main` 的每次 push 都會觸發 Pages 自動部署，整合分支的建置產物和 Pages 不相容，合進去會讓正式站壞掉。
- 整合分支部署到另一個 Worker `tekuei-next`（workers.dev 網址），綁定另一個 R2 bucket `tekuei-cms-next`，用另一組 `ADMIN_SECRET`。這個 bucket 的資料用 `wrangler r2 object get --remote tekuei-cms/data.json` 讀出正式資料，再放進去，只讀取正式 bucket，不寫入。
- 第二個 PR 刪掉 `vite.config.ts` 的 `/api` 代理。改用 Cloudflare 外掛之後，`/api` 由本機的 Worker 處理，寫入本機模擬的 R2（`.wrangler/state`），`.env.local` 不會再把儲存送到正式站。
- `wrangler.jsonc` 的 R2 綁定不設 `"remote": true`，第二個 PR 加一個 `node --test` 的檢查守住這一點。
- 不執行 `npm run seed`，因為 `scripts/seed-data.ts` 帶 `--remote`，會用不含文章的 `src/data/data.json` 覆蓋正式的 `data.json`，第二個 PR 把它改成只寫本機 bucket。

### 9.2 每個 PR 都要做的檢查

- `npm run lint`（ESLint、noSlop、三個 tsconfig 的型別檢查）、`npm run build`、`npm test`。
- `scripts/checkPages.ts`（第二個 PR 新增）：對 `vite preview` 跑起來的 Worker，逐一請求網址清單（每條路由的中英網址、舊網址、打錯的網址），檢查狀態碼、`Location`、`<title>`、canonical、hreflang、JSON-LD 能不能解析、`<h1>` 和內文的第一段有沒有出現在 HTML 裡。清單和預期值寫在同一個檔案，之後新增頁面時一起補。
- DOM 快照比對：第一個 PR 之前，在現在的版本用內建瀏覽器打開每一頁，各用 375、1440、2560 三種寬度，執行一段快照程式（放在 `scripts/domSnapshot.ts`，和 `fakeAdminApi.ts` 一樣用 `await import()` 在頁面上執行），記下 `header`、`main`、`footer` 裡每個元素的標籤、class、文字和四捨五入後的位置、大小，略過 `canvas`。之後每個 PR 在同樣的頁面和寬度重跑，比對兩份 JSON，有差異的元素逐一放大截圖確認。Canvas 每次畫的都不同，所以不比像素。
- 編輯器測試：在本機頁面先執行 `await import('/scripts/fakeAdminApi.ts')`，再按 Ctrl+S 登入，改一篇草稿等自動儲存、發布一篇、在另一個分頁先存一次再回來存（要看到 409 的提示），確認 `window.__api` 記錄的請求帶著 `If-Match`。改用本機 R2 之後就算忘了執行 `fakeAdminApi.ts` 也只會寫進本機，但規則照舊。
- 有畫面變動的 PR，依 AGENTS.md 打開實際頁面看三種寬度，並在「減少動態效果」開啟時再看一次。

### 9.3 七個 PR

#### 第一個 PR：在現在的 SPA 裡先清掉 SSR 的障礙

不裝新套件，還是 library 模式。修第六節表格裡的前三處，12 個頁面的 `document.title` effect 改成 React 19 的 `<title>`、`<meta>`（library 模式也有效），新增 `scripts/domSnapshot.ts` 並記下基準快照。這個 PR 可以直接合進 `main`，正式站上看不出差別。

- 檢查：共通檢查、DOM 快照和基準相同、分頁標題正確。
- 工作量：半天到一天。
- 回復方式：revert 這個 PR。

#### 第二個 PR：換成 framework 模式，先讓整個舊 App 在一條萬用路由裡跑

照 React Router 的「從 component routes 遷移」指南：安裝第八節的套件，19 個檔案的 `react-router-dom` 匯入改成 `react-router`，新增 `react-router.config.ts`、`src/root.tsx`、`src/entry.server.tsx`、`workers/app.ts`、`wrangler.jsonc`，`src/routes.ts` 先只有 `route('*?', 'routes/catchall.tsx')`，裡面畫原本的 `<Routes>`。Cloudflare 外掛不支援 SPA 模式，所以直接 `ssr: true`，伺服器這時只畫得出外殼和頁首，資料仍在瀏覽器取得。`/api/*` 和 CORS middleware 接到 `workers/app.ts`，部署 `tekuei-next`，並加上 `scripts/checkPages.ts`、R2 綁定的檢查、`seed-data.ts` 改成本機。

- 檢查：共通檢查、`checkPages.ts` 沒有 500、`/api/data` 的 GET、PUT、409 在 `tekuei-next` 上正常、用 `wrangler tail` 量每個請求的 CPU 時間。
- 工作量：一到兩天。
- 回復方式：整合分支 revert，正式站沒有受影響。

#### 第三個 PR：每一頁拆成自己的 route module 和 loader，加上英文網址

`src/routes.ts` 換成 1.4 的路由表，每一頁的 loader 經 `readSite` 只回傳已發布的中英內容，`LangProvider` 改成從網址算語言，`toggle` 換頁加上 `shouldRevalidate`，`ScrollClasses` 搬進 `src/root.tsx` 並排除只換語言的換頁，新增 `useLocalePath()` 並改掉約 31 處站內路徑，`<html>` 的 class 改由 `handle` 輸出，舊網址和 404 改成 loader。`JournalProvider`、`WorkProvider` 不再在載入時打 `/api/data`。

- 檢查：共通檢查、`checkPages.ts` 涵蓋中英網址、舊網址、404、503（停掉本機 bucket 模擬讀取失敗），在瀏覽器的 Network 確認讀者的頁面沒有任何 `/api/data` 請求、HTML 裡找不到草稿的標題，水波按鈕換語言時捲動位置不變、字在水波最強時換掉。
- 工作量：兩到三天，是最大的一個 PR。
- 回復方式：整合分支 revert。

#### 第四個 PR：head 和 SEO 改由伺服器畫出，刪掉注入的程式

JSON-LD、canonical、hreflang、og 寫進各頁元件和 `src/root.tsx`，`/sitemap.xml`、`/llms.txt` 改成 resource route，刪掉第四節表格裡標為刪除的程式、`functions/` 的頁面 Function、`index.html` 殘留的 meta、`scripts/blockTypes.test.ts`，改寫 `scripts/seo.test.ts`。

- 檢查：共通檢查、`checkPages.ts` 檢查每一頁的 head、Google 的 Rich Results Test 和 Schema Markup Validator 對 `tekuei-next` 的文章頁、專案頁、About 各跑一次、sitemap 用 XML 驗證、把舊版和新版的 HTML 內文抽成純文字比對，新版只能多、不能少。
- 工作量：一到兩天。
- 回復方式：整合分支 revert。

#### 第五個 PR：編輯模式改用 loader 的資料，關閉公開的草稿

`useCmsSection` 改成進入編輯模式時才取完整區段，儲存後 `revalidate()`，拿掉 `onSiteVersion`。如果 Wade 同意第十一節第 4 題，`GET /api/data` 加上 `adminGate`，`adminApi.ts` 取資料時帶 `Authorization`。

- 檢查：共通檢查、9.2 的完整編輯器測試（Journal、Projects、About 各一次）、換頁後未儲存的草稿還在、儲存後讀者畫面更新、`dataApi.test.ts` 新增「沒有密碼讀不到 `/api/data`」的測試。
- 工作量：一天。
- 回復方式：整合分支 revert。

#### 第六個 PR：更新規範文件，收尾

AGENTS.md（專案表、指令、資料夾表、坑的第 1 條改成本機 R2）、README.md（部署、指令、網址表）、PAGES.md（語言網址、404、hreflang、SEO 的描述）、DESIGN.md（`waterRipple` 那一段補上換頁）、`.audit/risks.md`（第 3、4、18、21 項標為已修），`src/lib/adminApi.ts` 的 `isRemoteSync` 和 `VITE_USE_REMOTE`、`VITE_DEV_PROXY_TARGET` 這些不再需要的設定一併刪掉。

- 檢查：共通檢查、AGENTS.md 維持 120 行以內、文件提到的檔名都存在（noSlop 會擋不存在的路徑）。
- 工作量：半天。
- 回復方式：revert。

#### 第七個 PR：切換正式站

整合分支合進 `main`，Wade 在 Cloudflare 後台做這幾件事：在 Worker `tekuei` 設定 `ADMIN_SECRET`，綁定正式的 `tekuei-cms`，打開 Workers Builds 的 Git 連動，把 `tekuei.com` 從 Pages 專案移除，再加到 Worker。移網域的那幾分鐘可能連不上，選在沒有人在看的時段。切換後在正式站跑一次 `checkPages.ts`，在 Google Search Console 重新提交 sitemap，用手機在 LINE 裡報到一次。工作量半天，加上 Wade 在後台操作的時間。回復：Pages 專案和它最後一次的部署保留至少 30 天，出問題時把網域移回 Pages，`main` revert 合併。`data.json` 的格式沒有變，新舊版本讀寫同一個 bucket 沒有問題。

## 十、風險

- Workers Free 方案每個請求的 CPU 時間上限是 10 ms，React SSR 加上解析整份 `data.json` 可能超過，第二個 PR 會先量。超過的話有兩種做法：升級到 Paid 方案（每月 5 美元，上限 30 秒），或把整頁 HTML 用 Cache API 依網址和 ETag 快取。Wade 現在用哪個方案要先確認。
- v8 的 Cloudflare 綁定寫法（1.6）沒有官方範例，是從型別推出來的，第二個 PR 實際建置前都只是推測。
- 網域從 Pages 移到 Worker 的步驟，Cloudflare 文件沒有逐步說明，這是推論，可能有短暫中斷。
- 換語言變成換頁之後，如果 `shouldRevalidate` 沒有攔住，字會在水波結束之後才換。第三個 PR 要實際看。
- `parseSiteData` 很嚴格（第 20 項），R2 裡任何一篇文章有一個欄位型別不符，現在讀者看到空的 Journal，改完之後會看到 503 的錯誤畫面。這比較誠實，但看起來也比較嚴重。
- 第二到第四個 PR 之間，`tekuei-next` 的 SEO 比正式站差（注入的程式刪了，新的還沒做完），所以不能提早切換網域。
- LIFF 報到只能在 LINE 裡測，切換之前沒辦法完整驗證。

## 十一、需要 Wade 決定的事

1. 用 React Router 8，不是 7。任務寫的是 7，但 7 已經不是最新的穩定版，`react-router-dom` 也只到 7。建議直接用 8.5.3，否則之後還要再遷移一次。
2. 從 Cloudflare Pages 搬到 Workers。部署方式和 Git 連動會改，網域要移一次。建議搬，留在 Pages 沒有 Vite 外掛，本機開發會變差。
3. Workers 的方案。Free 的 10 ms CPU 可能不夠，需要知道現在的方案，以及能不能接受每月 5 美元，也可以等第二個 PR 量完再決定。
4. `GET /api/data` 要不要加密碼。加了之後草稿不再公開（第 4 項），代價是每次進入編輯模式多算一次嘗試次數，全站鎖定時編輯器也載入不了，因為這碰到 admin 驗證，所以要你同意。建議加，之後有 session token 再改掉這個代價。
5. CORS middleware 的型別要改一行。`functions/_middleware.ts` 的參數型別從 Pages 的 `EventContext` 改成只要 `request` 和 `next`，邏輯不動，否則 Worker 呼叫不了它。AGENTS.md 規定不改這個檔案，所以要問。
6. 之前選了英文的讀者。建議不處理，他們第一次會看到中文，按一次語言按鈕就好。另一個做法是第一次載入時讀到 `localStorage` 的 `lang=en` 就轉到英文網址，代價是這些讀者會多載入一次。
7. 哪些頁面有英文網址。建議 `/checkin` 和 `/labs/:slug/live` 只有一個網址，其他頁面都有 `/en`。
8. 英文網址的結尾斜線。PRODUCT.md 寫的是 `/en/`，建議 canonical 一律不帶斜線（`/en`、`/en/journal`），`/en/` 301 到 `/en`，和中文網址的寫法一致。

## 附錄：查證來源

- npm registry：`react-router`、`@react-router/dev`、`@react-router/cloudflare` 8.5.3，`@cloudflare/vite-plugin` 1.70.2，`react-router-dom` 7.18.7，`vite` 7.3.8，`wrangler` 4.169.0，以及各自的 peer 和 engines（2026-11-28 用 `npm view` 查詢）
- React Router 8 的 CHANGELOG（`react-router` 8.5.3 套件內）
- https://reactrouter.com/upgrading/v7
- https://reactrouter.com/upgrading/component-routes
- https://reactrouter.com/start/framework/routing
- https://reactrouter.com/start/framework/route-module#meta
- https://reactrouter.com/start/framework/deploying
- https://reactrouter.com/how-to/pre-rendering
- https://reactrouter.com/how-to/resource-routes
- https://reactrouter.com/how-to/status
- https://reactrouter.com/how-to/headers
- https://reactrouter.com/api/framework-conventions/client-modules
- https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/
- https://developers.cloudflare.com/workers/vite-plugin/
- https://developers.cloudflare.com/workers/runtime-apis/bindings/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/workers/wrangler/configuration/
- https://developers.cloudflare.com/workers/static-assets/redirects/
- https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/
