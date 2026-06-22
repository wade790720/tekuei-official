# tekuei-admin · 全站 CMS Worker

KV 存文案、R2 存固定槽位圖片（覆寫不累積）。

## 1. Cloudflare 資源建立

### KV Namespace（已設定）
- **Workers KV** ID：`5e5370a21bf8471396cc0080cfaee340`
- 已寫入 `wrangler.toml` → binding `CMS_KV`

### R2 Bucket
- Bucket 名稱：`tekuei-cms`（已寫入 `wrangler.toml`）
- **S3 API**（給 AWS CLI / 備份工具用，**不是**官網圖片網址）：
  `https://eefb9a85c22dac5fe006d916b34ed3b7.r2.cloudflarestorage.com/tekuei-cms`
- **官網要用的**是 **Public access** 網址，請在 R2 → `tekuei-cms` → Settings 啟用：
  - 自訂網域（建議）如 `https://media.tekuei.com`，或
  - `https://pub-xxxx.r2.dev`
- 將該公開網址填入 `wrangler.toml` 的 `MEDIA_PUBLIC_BASE_URL`（結尾勿加 `/`）

## 2. 部署

```bash
cd workers/tekuei-admin
npm install
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put JWT_SECRET
npm run deploy
```

## 3. 種子 About 內容

```bash
npx wrangler kv key put --binding=CMS_KV "content:about" --path=../../src/data/about.json
```

## 4. 前端環境變數

在官網專案根目錄 `.env`：

```
VITE_ADMIN_API_URL=https://tekuei-admin.<your-subdomain>.workers.dev
```

## API

| Method | Path | 說明 |
|--------|------|------|
| GET | `/api/content/about` | 公開讀取 |
| POST | `/api/admin/login` | `{ password }` |
| PUT | `/api/admin/content/about` | Bearer token |
| PUT | `/api/admin/media/about/:slot` | multipart `file`，slot=`founder` |

## 版控備份 SOP

1. 後台儲存後，點「下載 about.json」
2. 覆蓋 `src/data/about.json` 並 commit
