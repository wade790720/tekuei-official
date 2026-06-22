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
tekuei-cms（R2）
├── data.json              ← 全站文案（目前含 about）
└── about/images/
    └── founder.jpg        ← 創辦人照片（固定檔名覆寫）
```

圖片經同網域 `/api/file/...` 讀取，不需 r2.dev。

## 首次部署檢查清單（依序）

部署 **Functions 前** 必須先建好 R2，否則會出現：

`R2 bucket 'tekuei-cms' not found`

### 1. 確認 R2 bucket 存在

Dashboard → **R2 Object Storage** → bucket **`tekuei-cms`**

（名稱須與 `wrangler.toml` 的 `bucket_name` 一致）

**不需要**開啟 r2.dev 公開網址。

### 2. Pages 綁定 R2

Dashboard → **Workers & Pages** → **tekuei-official** → **Settings** → **Bindings**

- **Add** → R2 bucket
- Variable name：`BUCKET`（必須大寫，與程式一致）
- Bucket：`tekuei-cms`

### 3. 設定管理密碼

```bash
npx wrangler pages secret put ADMIN_SECRET --project-name=tekuei-official
```

（執行後輸入你要的管理密碼，用於 Ctrl+Space 登入）

### 4. 種子 data.json

```bash
npm run seed
```

（需已登入 `npx wrangler login`）

### 5. 重新部署

Deployments → **Retry deployment**

---

## Cloudflare 設定（摘要）

### Pages 建置設定（重要）

到 **Cloudflare Dashboard → Workers & Pages → 你的專案 → Settings → Builds**：

| 欄位 | 值 |
|------|-----|
| Build command | `npm run build` |
| Build output directory | `dist` |
| **Deploy command** | **`npm run deploy`**（或完全留空） |

**請勿使用** `npx wrangler deploy`——那是獨立 Worker 指令，會導致你看到的錯誤。

- **留空**：Git 建置完自動發佈 `dist` + `functions/`（nectar 做法）
- **`npm run deploy`**：若 Dashboard 強制要填 Deploy command，改填這個（內部是 `wrangler pages deploy dist`）

改完後到 **Deployments → Retry deployment**。

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
