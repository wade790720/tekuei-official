# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- 想做網站的受眾，會來看 Wade 的能力和品味。
- 同業（工程師、設計師），來讀技術分享和實作紀錄。
- 讀者多數從 Threads、IG、LINE 的中文圈點連結進來，手機體驗更為優先。

## Product Purpose

Wade 的個人網站，品牌名 TEKUEI 德溎。
網站本身是能力的展示，文章用觀點和價值觀吸引讀者，案例直接呈現價值。
成功的樣子：訪客在第一屏停下來，然後點進文章或案例，Wade 能無阻力的持續發文。

## Positioning

Wade 寫了十年程式，也做了兩年策展，辦過十場以上的展覽。
他同時懂工程和展覽美學，文章題材是他當下遇到的事：行銷、AI、技術、實作過程。

## Operating Context

- 內容優先順序：文章（最重要）、案例（次要）、聯絡方式。
- Wade 在網站前台直接寫文章，內文直接在文章頁上編輯，標題、標籤、日期這些資訊在右側滑出的面板裡改。
- 他只寫中文，發布時 AI 翻成英文，英文可以手動修改。

## Capabilities and Constraints

- 現有技術：Vite、React 19、Cloudflare Pages、R2。已決定換成 React Router 的 framework 模式。
- 保留 LIFF 報到功能和 R2 後端。
- 語言放進網址：中文在 `/`，英文在 `/en/`。
- SEO、AEO、GEO 都要做，每頁完整內容要在 HTML 裡。
- 文章編輯器用 Tiptap，所見即所得，存成 Markdown，有草稿和發布狀態。
- 案例用圖片為主的短格式：封面、一句話、年份和角色、一組大圖、最多三條重點、選填外部連結。
- 聯絡：Email、IG、LINE 連結。第二版加三欄位表單。
- Hero 底線：手機流暢、支援「減少動態效果」、標題和按鈕是真的 HTML 文字。
- 第一版上線範圍：Journal 優先。完整的生成式 Hero 可以放第二版。沒有期限。
- 未決定：全站視覺方向、Hero 的母題。

## Brand Commitments

- 名稱：TEKUEI 德溎。創辦人顯示名：WADE
- 文章區叫 Journal，網址 `/journal`
- Wade 不喜歡：鮮豔的大色塊、超大的字、復古風、3D 遊戲、插畫角色、襯線字文藝風、太空的極簡。
- Wade 喜歡：乾淨整齊沒有噪音的版面、細節的手感、量測和標註線、暗淡的字元背景、真實影像轉成字元的質感。

## Evidence on Hand

- 三個真實案例：Matsu Biennial（馬祖國際藝術島）、MONOLAB（墨雨互動設計）、Lustre Yellow（花蜜水晶花工藝）。資料在 `src/data/work.js` 和 `src/data/cases/`。
- 舊文章三篇在 `src/data/journal.js`，題材是舊定位，不一定保留。
- 沒有：案例的新格式圖片、新定位的文章、Wade 的照片、Email 和 IG 帳號。這些不可以捏造成真實資料。

## Product Principles

1. 文章是主角，任何設計不可以讓寫作或閱讀變難。
2. 網站本身就是作品，它要讓人看得出這個人會寫程式，也有美感。
3. 維護成本要低，新增一篇文章或一個案例只需要幾分鐘。
4. 安靜的版面，配一個精準的記憶點。

## Accessibility & Inclusion

- 內文對比至少 4.5:1。內文字級 16px 以上。
- 動畫要遵守系統的「減少動態效果」設定。
