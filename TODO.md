# TODO

TEKUEI 網站的待辦清單
做完一項，就把 `[ ]` 改成 `[x]`，或直接刪掉那一行。
「誰做」：**Wade** 表示要你決定或操作，**Claude** 表示可以交給 AI 做。

## 一、現在就可以做

### 文案

- [ ] **Journal 列表頁的說明**（Wade）
  目前是「Wade 當下遇到的事：行銷、AI、技術、實作過程。」位置在 `src/data/journal.js` 的 `JOURNAL_META`。
- [ ] **每篇文章的摘要**（Wade）
  每篇手寫一句。SEO 和 llms.txt 會直接用這一句。在編輯面板裡改。
- [ ] **檢查英文翻譯**（Wade）
  首頁的 title 和 description、About 的 description，英文是 AI 翻的。

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

- [ ] **Google Search Console**（Wade）
  驗證網域，提交 `https://tekuei.com/sitemap.xml`。
- [ ] **Bing Webmaster Tools**（Wade，選填）
  可以從 Search Console 直接匯入。
- [ ] **檢查分享預覽**（Wade）
  把首頁和一篇文章的連結貼到 Threads、LINE、IG，看標題、說明、圖片是否正確。

