# tekuei-official

React + Vite 官網；About 頁 CMS 與 [nectar-official](https://github.com/) 相同：**Cloudflare Pages + 單一 R2 桶**，無獨立 Worker、無 r2.dev 公開網址。

## 本機開發

```bash
npm install
npm run dev
```

開發模式預設讀 bundled `src/data/data.json`；要連遠端 R2 API 可設 `VITE_USE_REMOTE=true` 與 `VITE_DEV_PROXY_TARGET`。

本機跑 Pages Functions + R2：

```bash
cp .dev.vars.example .dev.vars   # 填入 ADMIN_SECRET
npm run dev:pages                # http://localhost:8788
```

## CMS 架構（R2 一桶）

```
tekuei-site-data（R2）
├── data.json              ← 全站文案（目前含 about）
└── about/images/
    └── founder.jpg        ← 創辦人照片（固定檔名覆寫）
```

圖片經同網域 `/api/file/...` 讀取，不需 r2.dev。

## Cloudflare 設定

1. 建立 R2 bucket `tekuei-site-data`（或改 `wrangler.toml` 的 `bucket_name`）
2. Pages 專案綁 R2：binding 名稱 **`BUCKET`**
3. 設定 secret：`npx wrangler pages secret put ADMIN_SECRET --project-name=<專案名>`
4. 首次種子：`npm run seed`

### Pages 建置設定（重要）

| 欄位 | 值 |
|------|-----|
| Build command | `npm run build` |
| Build output directory | `dist` |
| **Deploy command** | **留空**（刪除 `npx wrangler deploy`） |

本專案是 **Pages + Functions**，不是獨立 Worker。`wrangler deploy` 會失敗；Git push 後 Pages 會自動發佈 `dist` 與 `functions/`。

若曾設過 Deploy command，到 Dashboard → Pages → 專案 → **Settings → Builds** → 清空 **Deploy command** 後重新部署。

## API（同網域）

| Method | Path | 說明 |
|--------|------|------|
| GET | `/api/data` | 讀取 `data.json` |
| PUT | `/api/data` | 管理員合併寫入（Bearer `ADMIN_SECRET`） |
| POST | `/api/upload` | 上傳圖片 |
| GET | `/api/file/*` | 讀取桶內檔案 |
| POST | `/api/admin/verify` | 驗證管理密碼 |

## 版控備份

後台「下載 JSON」→ 覆蓋 `src/data/data.json` → commit。
