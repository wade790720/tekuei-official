# TODO

TEKUEI 網站的待辦清單。2026-11-19 建立。
做完一項，就把 `[ ]` 改成 `[x]`，或直接刪掉那一行。
「誰做」：**Wade** 表示要你決定或操作，**Claude** 表示可以交給 AI 做。

## 一、現在就可以做

### 內容與版權

- [ ] **換掉 Journal 頁尾的圖**（Wade）
  `src/assets/journal/footer-sea.webp` 是參考網站的截圖，有版權風險。上線前要換成有授權的圖。
- [ ] **移除首頁的舊文案**（Claude，Wade 確認）
  PHILOSOPHY 段落（「品牌，不只是曝光流量……」）和 `tagline`（「讓有價值的人……」）是舊的「人格品牌」定位。位置在 `src/data/homepage.js`。
- [ ] **確認 MONOLAB 的身分**（Wade）
  About 的 CV 寫「創立」，新的自我介紹寫「共同創辦人」。選一個，兩邊改成一樣。

### 文案

- [ ] **Journal 列表頁的說明**（Wade）
  目前是「Wade 當下遇到的事：行銷、AI、技術、實作過程。」位置在 `src/data/journal.js` 的 `JOURNAL_META`。
- [ ] **每篇文章的摘要**（Wade）
  每篇手寫一句。SEO 和 llms.txt 會直接用這一句。在編輯面板裡改。
- [ ] **首頁大標**（Wade）
  目前是「我寫程式，也把過程寫下來。」決定要不要配合新的口號修改。
- [ ] **用詞統一**（Wade 決定，Claude 修改）
  - 已決定用「人工智慧」，2026-11-19 改完。
  - 「工程」或「軟體工程」，選一個。
- [ ] **檢查英文翻譯**（Wade）
  首頁的 title 和 description、About 的 description，英文是 AI 翻的。

### 程式

- [ ] **修好 `SiteNav.jsx` 的 2 個 lint 錯誤**（Claude）
  錯誤是在 effect 裡同步呼叫 setState。不影響畫面，但「完成的定義」要求 lint 通過。

## 二、有資料之後才能做

- [ ] **聯絡方式**（Wade 提供，Claude 放上去）
  需要 Email、IG、LINE 的帳號。沒有之前，不放假資料。
- [ ] **分享圖 og:image**（Wade 提供圖，或請 Claude 先做佔位圖）
  1200 × 630。沒有這張圖時，在 Threads、LINE 分享連結不會出現圖片。
- [ ] **案例的新格式圖片**（Wade）
  案例改成以圖片為主的短格式時需要：封面、一組大圖。
- [ ] **Wade 的照片**（Wade，選填）

## 三、網站完成、上線之後

### SEO

- [ ] **確認正式網域**（Wade）
  程式裡的網址是 `https://tekuei.com`（`src/lib/seo.js` 的 `SITE_URL`、`index.html`、`public/robots.txt`）。網域不同的話，三處都要改。
- [ ] **Google Search Console**（Wade）
  驗證網域，提交 `https://tekuei.com/sitemap.xml`。
- [ ] **Bing Webmaster Tools**（Wade，選填）
  可以從 Search Console 直接匯入。
- [ ] **在正式站檢查 Functions**（Claude）
  打開下面的網址，看原始碼裡有沒有內文、meta 和 JSON-LD：
  - `/journal`
  - `/journal/<任一篇的 slug>`
  - `/sitemap.xml`
  - `/llms.txt`
- [ ] **檢查分享預覽**（Wade）
  把首頁和一篇文章的連結貼到 Threads、LINE、IG，看標題、說明、圖片是否正確。

### 測試

- [ ] **真的手機**（Wade）
  用 iPhone 和 Android 各打開一次。檢查水波效果、Journal 頁首的字元雨、About 的粒子是否流暢。
- [ ] **Safari**（Wade 或 Claude）
  水波效果用 SVG 濾鏡，只在 Chrome 測過。
- [ ] **減少動態效果**（Claude）
  打開系統的「減少動態效果」，每一頁看一次。
- [ ] **三種寬度**（Claude）
  375px、1440px、2560px。2560px 時，內容不可以超出中間的 1920px。

## 四、長期目標（沒有期限）

這些寫在 PRODUCT.md。沒有要求時，不要順便做。

- [ ] 語言放進網址：中文在 `/`，英文在 `/en/`。
- [ ] 換成 React Router 的 framework 模式。
- [ ] 文章編輯器存成 Markdown，加上草稿和發布狀態。
- [ ] 聯絡表單，三個欄位（第二版）。
- [ ] 決定全站視覺方向和 Hero 的母題。
- [ ] 完整的生成式 Hero（第二版）。
