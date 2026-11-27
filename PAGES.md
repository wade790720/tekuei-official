# PAGES.md

各頁和各功能的規格。全站共用的視覺規則在 [DESIGN.md](DESIGN.md)。這份檔案只寫「某一頁長什麼樣、怎麼動」。
## 全站

- 點連結換頁時從最上面開始。瀏覽器的上一頁、下一頁回到離開時的捲動位置（`App.tsx` 的 `ScrollClasses`）。
- 頁首 logo：「TEKUEI CHU」後面接一個 8 × 2px、約 1 秒亮 1 秒暗的底線游標。只有頁首用到，所以直接寫在 SiteNav 和 NavOverlay 裡，不抽成元件（class `site-logo`）。
- Projects、Journal 列表、Journal 文章頁、專案內頁、案例頁、About、Lab 頁的最下面都是同一個 `SiteFooter`（規格見 About）。首頁和 `/labs/<id>/live` 沒有頁尾。
- 頁尾的品牌字維持字距拉開的「T E K U E I」。
- 網站圖示是一條錦鯉，呼應首頁 Hero 的錦鯉池。`public/favicon.svg` 給瀏覽器分頁，背景透明，身體跟著系統的深淺色切換（淺色用深色身體、深色用象牙白），斑紋都是金色（`--ember`）。`public/apple-touch-icon.png`（180px）給手機主畫面，主畫面不能透明，所以用深色方塊（`--surface-0`）當底。`index.html` 的 `theme-color` 是同一個深色，手機瀏覽器的網址列跟著變深。
- 分享到 Threads、LINE、Facebook 時的預覽圖：預設是 `public/og.jpg`（1200 × 630，正式站首頁 Hero 的截圖），文章、專案和 About 有圖片時改用內文的第一張圖（專案先用縮圖）。
- 每頁的內容都寫進 HTML（`src/lib/seo.ts`），不跑 JS 也讀得到：Journal、Projects 列表、About、每個專案和 Lab。程式碼寫的舊案例頁只寫卡片上的文字，因為它們的資料檔會匯入影片，Pages Function 打包不了。
- 文章每次儲存時，內容有變的文章會記下 `updated`（`stampUpdated`），JSON-LD 的 `dateModified` 和 sitemap 的 `lastmod` 讀它。

## 首頁

- 首頁 Hero 是一池錦鯉（`KoiHero`，寫在 `HomeHero.tsx`），高度一個螢幕。Canvas 在文字後面，寬度不超過 `--page-max`，寬螢幕的兩側淡出。
- 版面照 motionsites 的 Koi Pond：左上角是幾行小字的自我介紹（出生地、信念、使命，照 p5aholic.me 的寫法），每一行斷在哪裡寫在資料裡。右上角靠右對齊：一行 18px 的金色短句，下面是一行小字，幾個關鍵字用象牙白標出，沒有底線。Hero 的文字不能選取，因為連點水面會選到字。首頁不放聯絡連結。Hero 的小字都用 `--font-serif`，字級是 `--type-nav`，和頁首導覽相同。左下角是錦鯉和飼料的計數，和一句英文的小玩笑（中英文版都是英文）。右下角是大字「WADE CHU」，字級約是寬度的 11%（56 到 200px），這是全站唯一的大字。
- 中間留空給錦鯉。
- 手機（767px 以下）只留錦鯉、「WADE CHU」和它下方那句英文的小玩笑。左上的自我介紹、右上的短句和計數都隱藏，從平板（768px）開始才出現。
- 錦鯉下面有一片顆粒狀的光（`grainHaze.ts`，WebGL）：一塊柔邊的亮區碎成沙粒，明暗很慢地流動。做法和數值照 p5aholic.me 的背景，強度是她的 35 到 40%。
- 底色不是純黑：中間是 `--surface-1`，往邊緣漸變成 `--surface-0`。
- 錦鯉只用品牌色：身體是象牙白，斑紋是 `--ember`，飼料是 `--ember-soft`。錦鯉由等寬字元拼成（`--font-label`），越亮的地方字元越密。手機一格 7px、三隻錦鯉，其他寬度一格 9px、七隻。錦鯉有大有小，最小的是最大的一半，體型偏圓胖（照 motionsites 的 Koi Pond）。
- 錦鯉的游動照真魚的物理：尾巴擺動產生推力，阻力和速度的平方成正比。每隻錦鯉有自己的巡游速度，體型越大越快，會在四種狀態間切換：巡游（擺一兩下尾巴，然後滑行）、漂（擺一下，滑行很久）、衝刺（連續擺尾）、受驚（很少發生，先把頭甩向一側，短暫全力擺尾，再滑行減速）。擺尾的頻率跟著速度變快，小魚比大魚快。滑行時身體伸直，游得快時胸鰭收起。
- 池子的四邊大多可以穿越。錦鯉游出一邊，會從對面游進來，穿越時兩邊都看得到牠。
- 錦鯉會避開四個角落的文字、右下角的大字和頁首。文字貼著的那一段邊緣不能穿越，錦鯉會提早轉彎。這樣牠不會穿越後落在文字上。
- 錦鯉互相讓路，轉彎的速度受游速限制。游動和外形的做法來自 ascii-koi（MIT）。
- 點一下水面丟飼料，同時從點擊處播放語言按鈕的水波（`playWaterRipple`），整頁文字跟著扭曲。
- 減少動態效果開啟時，錦鯉靜止，不能餵魚，操作說明隱藏。
- 首頁只有 Hero，不能往下捲。沒有最新文章、精選案例和頁尾。頁首的 Contact 是 `mailto:` 連結，直接開新郵件。

## Journal 列表

- 欄寬 `--page-column`（見 DESIGN.md「版面」）。
- 最新一篇用大卡片，其他文章是一列一篇（約 68px），按年份分組，年份標在左欄。
- 列表上方有一排標籤篩選（`Tag`），一次選一個，網址帶 `?tag=`。
- 每篇文章可以有多個標籤，英文大寫，中英文共用。標籤取代了舊的分類（category）。

## Journal 文章頁

- 文章還沒有英文翻譯時（英文內文是空的），英文版顯示中文的文章，標題下方加一行「This post is only in Chinese for now.」，文章加 `lang="zh-Hant"`。Journal 列表也顯示中文標題。只有讀者看到的畫面這樣做，編輯模式仍然顯示英文的草稿（`readableJournal`）。
- 最上面是 `Breadcrumbs`：首頁、Journal、文章標題。
- 頁首最後一列靠右是分享按鈕（`ShareLinks`）：複製連結、LINE、Facebook，三顆 32px 的圖示 `Button`，間距 12px，名稱放在提示裡。最後一顆圖示的右緣對齊內文欄的右緣。複製的是不帶參數的文章網址，複製後圖示換成打勾 1.6 秒。LINE 和 Facebook 開新分頁到各自的分享頁。Facebook 的圖示和頁尾共用（`socialIcons.tsx`），LINE 的標誌是實心的。
- 前言和引言照 Medium 的做法。前言：22px、行高 1.5、`--text-secondary`，沒有左邊的線，下方 24px。引言：左邊一條 3px 的線，文字離線 24px，字級和行高跟內文相同，沒有底色和上下內距，上下各 32px，不用斜體（中文沒有斜體字型）。短分隔線上下各 32px。
- 文章不顯示閱讀時間，列表也不顯示。
- 文末（上一篇、下一篇下面）有「── 返回 Journal」。
- 從列表點進來時，Breadcrumbs 的 Journal 和文末的返回連結都等於「上一頁」，回到列表原本的捲動位置和標籤篩選。從別處進來時，連到 `/journal`。
- 內容寬 `--page-reading`（680px，17px 字一行 40 字），比列表窄。文字、圖片、程式碼、引言、輪播全部同寬。
- 外欄是 680px 加左右各 8px（`--space-2`）。分隔線和文末的頁尾從外欄左邊緣到右邊緣。
- 段落和清單的行高、間距是例外，見 DESIGN.md「字級」。
- 淡入用全站共用的進場（見 DESIGN.md「動態」）。頁首的 Breadcrumbs、meta、編號、標題、副標依序出現，間隔 80ms（`--i`）。Projects 的頁首（小標、標題、數量、分隔線）和每張卡片也用同一個。
- 內文不淡入，直接顯示。讀長文時畫面不要一直在動。

## Projects 和案例頁

- 作品列表叫 Projects，網址 `/projects`，案例頁是 `/projects/<slug>`，和 Journal 一樣列表和內頁同一個開頭。舊的 `/work` 301 轉到 `/projects`（`public/_redirects`）。列表的標題寫在 `src/data/work.ts` 的 `PROJECTS_PAGE`，不讀 R2；R2 存的 `/cases/` 連結由 `projectHref` 轉成新網址，正式資料不用改。程式裡的檔名和 R2 的 `work` 區段維持原名。

- 列表只有一種檢視：一覽全部專案的格線，分成三區，依序是「網站」、「展覽」、「個人項目」（英文版是 Websites、Exhibitions、Side Projects）（`PROJECT_SECTIONS`）。每區一個小標題和數量，下面是兩欄的卡片（照 shadcnblocks 的 Case Studies 12），900px 以下一欄。沒有專案的區段不顯示。精選和一次看一張的版型屬於首頁，不放在這裡。
- 專案屬於哪一區寫在程式碼裡：`src/data/work.ts` 的 `PROJECT_TYPES`，用 id 對照，R2 的資料不用改。Labs 一律在「個人項目」，Chrome 擴充功能也歸這一區。一個專案只歸一區，依 Wade 實際做的東西分，例如替展覽做的網站歸「網站」。沒有登記的專案先排在「網站」。
- 卡片（`WorkCard`）是 16:10，手機 4:5：圖片或影片鋪滿，右上角是編號（依顯示順序，跨區連續），文字在下方的漸層上（單位、標題）。列表的卡片不顯示標籤，標籤在專案內頁才出現。圓角 22px、內距 36px（手機 24px）參考 React Bits Pro 的 Scroll Stack 的外觀，不用 `--radius-lg`。
- 頁首有量測標註線（`measureLines.ts`，Projects 的招牌效果）：頁首下緣是一條標出欄寬的尺寸線，取代原本的分隔線；標題左邊是一條標出高度的尺寸線，右上角是角標。數字是即時量的像素值，進場時跟著線一起數上去。下緣的尺寸線像一把尺，每 24px 一個小刻度，上面有一個金色的小三角形跟著游標的水平位置移動。沒有十字線：十字線只在頁首出現會像壞掉，鋪滿整頁又太吵。手機不畫左邊的高度線。
- Projects 的資料都在 R2 `data.json` 的 `work`：`items` 是卡片，`content` 是內頁（`{ zh: { <id>: { doc } }, en: … }`，Tiptap 文件）。`WorkProvider` 讓列表和內頁共用同一份狀態，所以在列表新增的專案，還沒儲存就能到內頁編輯。
- 列表的編輯面板（`WorkListEditPanel`）：新增專案（選區段、填網址代稱）、拖曳排序、刪除。排序是每一區裡面的先後。Labs 寫在程式碼裡，不在面板裡。SRE 原本也寫在程式碼裡（`CODE_PROJECTS`）：R2 還沒有它時，載入後會自動補進清單，連同一段內頁的內文，第一次儲存就寫進 R2，之後和其他專案一樣編輯；刪掉它時 `work.removed` 會記下來，不會再被補回去。
- 專案的編輯面板（`ProjectEditPanel`）在內頁打開：標題和單位每種語言各一份（英文存在卡片的 `en`，留空時顯示中文），區段、標籤、封面圖、外部連結中英文共用。面板的第一個欄位是區段。封面圖同時是列表卡片的圖和內頁的開場圖（資料欄位仍叫 `thumbImage`），三個案例頁也一樣，還沒設定時用案例原本存的圖。面板上傳的圖永遠優先。程式碼裡只留一張頂替用的封面（`workMedia.ts` 的 `CODE_COVERS`）：Matsu Biennial 原本存的圖只有 850px，所以在換掉那一張之前，卡片和開場都顯示官網首頁的黃昏橫幅；在面板上傳新圖之後就用新圖。專案有草稿和已發布兩種狀態，新專案是草稿，讀者看不到，sitemap 和 llms.txt 也不列。專案不自動儲存。儲存按鈕和 Ctrl+S 只儲存內容，不改變公開狀態：草稿的按鈕叫「儲存草稿」，已發布的叫「更新」。「發布」和「取消公開」都在「⋯」選單裡，要另外選才會發生。
- 在面板新增的專案有自己的內頁（`ProjectPage`），網址 `/projects/<代稱>`：Breadcrumbs、區段和單位、標題、標籤、一篇內文，文字樣式照 Journal 文章頁，內文直接在頁面上編輯。版面比文章頁寬，因為專案是用看的，圖片是主角（`src/styles/project.css`）：外框寬到頁面左右留白為止（最寬 `--page-max`），標題、文字和所有圖片都從外框的左緣開始，所以左邊是同一條線。文字最寬 `--page-reading`；圖片、影片、輪播、圖庫佔滿外框；堆疊的卡片會黏在頁首下面，所以寬度不超過螢幕放得下的 16:9。768px 以下，圖片、輪播、堆疊、圖庫和「作品」的大圖都貼齊螢幕左右邊緣、沒有圓角，文字和「作品」的縮圖維持邊距。編輯時內文維持閱讀寬度，按「預覽」才是寬版。專案有縮圖時，內頁用它當開場圖，和最早三個案例頁的開場是同一套：照片高 `--hero-height`（88% 螢幕高，下面的內文會露出來），寬螢幕上也延伸到螢幕左右邊緣（文字仍在 `--page-max` 內），下半部漸暗（`--hero-scrim`，手機的文字疊得比較高，暗的範圍也從比較高的地方開始）。照片上由上到下是編號（`PROJECT 05`，和列表卡片的編號相同）、標題（`--type-display`）、一條 0.5px 的線、一列資訊（Type、Client、Scope、Link，標籤一律英文，和案例頁一樣；沒有資料的格子不顯示），桌面四欄、768px 以下兩欄。文字的左緣和下面的內文是同一條線。有開場圖時不顯示 Breadcrumbs，標籤和外部連結都在資訊列裡。沒有縮圖就沒有開場圖，頁首維持原樣。每個專案的卡片都連到自己的內頁，包括 SRE。「外部連結」是專案的網站，顯示在內頁標籤下方的「造訪網站 ↗」，開新分頁。只有沒有內頁的專案，卡片才直接連到外部連結；這種專案在編輯模式仍然可以打開 `/projects/<代稱>` 改欄位，面板裡有「建立內頁」。英文內文是空的時，英文版顯示中文內文。
- 內頁的內文會寫進 HTML（`functions/projects/[slug].js` 的 `serveProject`），和 Journal 文章一樣。
- 最早的三個案例頁（Matsu Biennial、MONOLAB、Lustre Yellow，`CaseStudyPage`）和專案內頁是同一個版型：開場是 `ProjectHero`（`src/components/work/`，兩種頁面共用），內文用同一套文字樣式和寬度，結尾是「── 返回 Projects」和 `SiteFooter`。和專案內頁的差別只有一點：內文寫在程式碼裡（`src/data/cases/`）。開場的編號、標題、資訊列和封面圖都讀卡片的資料，和專案內頁用同一個函式（`work.ts` 的 `projectFacts`），所以在面板改卡片，兩種頁面都會變。
- 案例的內容在程式碼裡仍然分段存放，顯示前由 `src/lib/caseDoc.ts` 轉成和編輯器相同的文件：每一段的標題是小標題，段落照原樣，引言是引言，交付項目和時間軸是清單（「名稱：說明」），影片和圖片是卡片。沒有檔案的圖片不顯示。
- 案例資料可以有 `videos`（`src`、`poster`、`caption`）：排在「背景」段落後面，循環播放。影片是從案例網站錄的捲動導覽。Matsu Biennial 有三支（首頁、策展主題頁、藝術作品頁，放在 `src/assets/cases/matsu-biennial/`），Lustre Yellow 有一支（放在 `src/assets/work/`）。

## Labs

- 自己做的互動實驗叫 Labs。列在 Projects，排在客戶案例後面，類別寫 `LABS`。全部放在 `src/labs/`，不在 R2。`index.ts` 是清單，只放文字，sitemap 和 llms.txt 也會讀它（`siteCases`）。`media.ts` 放 Work 列表的縮圖和影片。每個 lab 一個資料夾，裡面是它的元件、樣式、效果和素材。Lab 頁和 `/live` 頁都是用到時才載入。
- 網址是 `/labs/<id>`。版面照 Framer Marketplace 的元件頁，由上到下：`Breadcrumbs`（首頁、Projects、標題）、標題、一句說明、標籤，右邊兩顆按鈕「全螢幕預覽」和「複製提示詞」；可以直接玩的預覽框（16:10，手機 3:4，lab 可以用 `previewAspect` 改比例）；「關於」幾段介紹，右欄是年份和參考來源；「更多 Labs」列出其他 lab 的縮圖；最後是 `SiteFooter`。
- 這一頁是推廣用的：介紹文字讓人知道效果怎麼做，「複製提示詞」把一段英文 brief 放進剪貼簿，貼給 AI 就能重做一份。介紹寫在 `index.ts` 的 `intro`（雙語），prompt 寫在 `prompts.ts`（只有英文）。
- 效果本身在 `/labs/<id>/live`，沒有頁首和頁尾。預覽框用 iframe 放它，所以效果自己的捲動和固定的 Canvas 不會影響外面的頁面。「全螢幕預覽」在新分頁打開它。
- 舊網址 `/cases/living-portrait`、`/cases/falling-figure` 301 轉到 `/labs/`，其他 `/cases/<slug>` 301 轉到 `/projects/<slug>`。轉址寫在 `src/lib/seo.ts` 的 `serveCase`，不在 `public/_redirects`，因為 Pages Function 會先接走這些網址。
- 不存在的 `/projects/<slug>` 和 `/labs/<id>` 回 404 狀態碼（`functions/projects/`、`functions/labs/`），畫面仍由前端顯示。
- 每個 lab 都要寫參考來源、介紹和 prompt。
- Projects 列表的卡片只放圖片，不放影片。從客戶網站錄的捲動導覽放在內頁：Matsu Biennial 和 Lustre Yellow 寫在案例資料的 `videos`，SRE 的內文在 R2，編輯器不能上傳影片，所以由 `workMedia.ts` 的 `withProjectVideo` 接在內文最後。Labs 的卡片仍然可以是影片（`src/labs/media.ts`），減少動態效果開啟時只顯示 webp。
- 現有三個：`living-portrait`（`LivingPortrait`，首頁改版前的 Hero）、`falling-figure`（`FallingFigure`，About 改版前的 About 頁）、`shatter-footer`（`ShatterFooter`，Journal 改版前的頁尾）。
- Shatter Footer：四欄（品牌、Explore、Resources、Contact）。Resources 讀 `HOME_FOOTER` 的 `resources`，FAQ 和 Privacy policy 還沒有頁面，先顯示成文字。下面是版畫海浪（`shatterImage.ts`），露出 35% 時由碎片拼起來，文字依序淡入。預覽框是 4:3，比預設高，海浪才能接近全寬。live 頁的頁尾佔滿一個螢幕，海浪縮到剛好放得下，所以在預覽框裡也看得到整個效果。燈塔在圖的 75% 處，海浪變窄時仍讓這一點落在寬度的 75%，對齊第三條虛線；畫面太矮時（手機的預覽框）海浪至少佔 40% 高，其餘往下捲。

## About

- 版面照 manuelmoreale.com/about：只有標題「About」和一篇內文，用 Journal 文章頁的欄寬和樣式（`AboutPage`）。
- 背景和首頁 Hero 相同：中間 `--surface-1` 往邊緣漸變成 `--surface-0`，上面一層 `grainHaze.ts` 的顆粒光。背景固定不動，捲動時只有內容移動。
- 內文是 Tiptap 文件，存在 R2 `data.json` 的 `aboutPage`（`{ zh: { doc }, en: { doc } }`），編輯方式和 Journal 文章的內文相同，照片和排版都在頁面上用「+」插入。`src/data/about.ts` 只是 R2 還沒有資料時的預設值。
- 不用 `about` 這個 key：它存著舊定位的 About 文案，沒有頁面在讀。
- 內文下面是「合作過的單位」：兩排 `Marquee`，方向相反，欄寬 `--page-column`。名單寫在 `src/data/about.ts` 的 `ABOUT_CLIENTS`，不在 R2。有 logo 的單位顯示 logo（`src/assets/about/clients/`，全部是 SVG），沒有的顯示名稱。logo 檔當遮罩，填上 `--text-secondary`，所以全部是同一個顏色，原本的品牌色不會出現。logo 高 32px、最寬 140px。
- 最下面是 `SiteFooter`：一列的頁尾，品牌靠左、連結置中、圖示靠右。圖示在桌面排成交錯的兩排（上 4 下 3，下排往右錯開半個圖示），避免和中間的連結擠在一起。768px 以下分成三行：品牌、圖示（一排）、連結，內容有品牌字、© 年份、About、Work、Journal、Contact 連結，以及社群圖示（X、YouTube、Facebook、Instagram、GitHub、LinkedIn、Email），還沒有網址的帳號只顯示圖示、不是連結。目前頁有金色底線，滑鼠或鍵盤移到其他連結時，底線滑過去（`--duration-base`）。連結和社群帳號讀 `HOME_FOOTER`。
- 這一頁沒有欄位，所以編輯時不開面板，右下角是 `SidePanel` 的工具列（`variant="bar"`），高 40px：把手、狀態燈和文字、預覽、英文翻譯、儲存，按鈕都是 32px 的圖示，名稱放在提示裡。工具列可以從把手或空白處拖到任何位置，也可以聚焦把手用方向鍵移動，不會超出畫面，位置記在 `localStorage`。狀態燈：已儲存綠色、未儲存和儲存中金色、失敗紅色，換狀態時彈一下，平常有一圈擴散的光，越需要注意的狀態越快。登出不是編輯動作，是最右邊分隔線後面的一顆按鈕。
- 英文內文是空的時，英文版顯示中文內文，加 `lang="zh-Hant"`。

## 文章內的卡片

文章存在 R2 `data.json` 的 `journal`，在前台的編輯模式修改。程式碼裡沒有文章：`src/data/journal.ts` 只有文案和工具函式，R2 讀不到時 Journal 是空的。內文是 Tiptap 文件，由 `Editor` 編輯、`RichText` 顯示，格式寫在 `src/lib/richText.ts`。

| 文件節點 | 元件 | 屬性 |
|---|---|---|
| `codeBlock` | `CodeBlock` | 內容是程式碼。屬性：`language`（預設 `ts`）、`filename` |
| `imageCard` | `ImageCard` | `src`、`alt`（必填）、`caption`、`frame`（小圖置中留白） |
| `videoCard` | `VideoPlayer` | `src`、`poster`、`caption`、`loop`。`src` 是影片檔（mp4）或 YouTube 連結，YouTube 用它自己的播放器 |
| `slidesCard` | `Carousel`、`ScrollStack`、`Gallery`、`FeaturedPhotos` | `slides`：`[{ src, alt, caption }]`、`layout`、`collapsed`（圖庫只露出前 5 張）、`title` 和 `text`（作品的名稱和說明）。一組圖，叫「圖組」，有四種排法：`carousel` 輪播（預設）、`stack` 堆疊、`gallery` 圖庫、`work` 作品。在 Journal 文章頁三種都和內文同寬，在專案內頁比內文寬（見「Projects 和案例頁」） |

- 文字的部分（段落、前言、小標題、引言、清單）沿用 `journal.css` 的 `journal-post__*` 樣式。
- 圖組在編輯器裡是一張表單：上方選排法，「上傳多張」一次選一批照片，逐張壓縮後上傳並加進清單。換排法不用重新上傳。清單裡的照片用「⠿」拖曳排序，也可以拖進另一個圖組，兩個圖組在同一步改變，復原一次就回到原位。用鍵盤（↑、↓）只能在同一個圖組裡移動。
- 圖庫參考 React Bits Pro 的 Gallery 8 的外觀自行實作，沒有使用它的程式碼，不做它的分類標籤：間距 16px、圓角 20px（照參考，不用 `--radius-lg`），圖說在 hover 時出現，點一張放大檢視。排法不照參考的瀑布流：兩張一排，由左到右，每五張的第一張佔滿整排，每格固定 16:9，768px 以下一張一排。瀑布流會先排滿左欄再排右欄，順序和編輯時不一致。圖庫可以打開「只露出前 5 張」（照 shadcnblocks 的 Gallery 39）：頁面上是一張大圖加四張小圖，下面一顆「顯示全部 N 張」，其餘在放大檢視裡看。堆疊照 shadcnblocks 的 Gallery 66：照片固定 16:9、圓角 16px（照參考），捲到離頂端 96px 時黏住，下一張緊接著蓋上來，前面的縮小變暗；圖說和編號（`01 / 04`）在照片下方一行，不顯示進度線。
- 「作品」排法參考 React Bits Pro 的 Gallery 3 的外觀自行實作，沒有使用它的程式碼，不做它的分頁標籤：一邊是大圖，另一邊是作品名、創作者和說明、每張照片的縮圖，點縮圖換大圖。一件作品一張卡片，作品名和說明寫在卡片的欄位裡，不另外用小標題，這樣文字和照片是同一個區塊。
- 編輯器裡的圖片卡片就是正式的 `ImageCard`，圖說在圖片下方直接輸入。替代文字、網址、小圖置中收在右上角的「⋯」裡。沒有替代文字時顯示「缺替代文字」。
- 外觀：四種卡片都用 `Card` 當外殼，`--surface-1` 底、圓角 12px、1px 象牙白光環，不用邊框（`src/styles/card.css`）。各卡片自己的樣式在 `src/styles/cards.css`。
- 程式碼字型用 `--font-mono`，顏色用 `--code-*` token。上色由 `src/lib/highlight.ts` 處理，只支援類 C 語法。
- 介面文字（複製、播放等）在 `CARD_LABELS`。
- 各卡片的示範和完整規範在 Component Library。

## 編輯模式

- 按 Ctrl+S（Mac 是 ⌘+S）。沒登入時出現密碼框，登入後進入編輯模式，編輯中則是儲存。
- 密碼是 Cloudflare Pages 的 `ADMIN_SECRET`，必須是 6 位數字。
- 15 分鐘內密碼錯 5 次，全站鎖住到這段時間結束，API 回 429，密碼框顯示「錯太多次」。次數存在 R2 的 `admin/attempts.json`（`src/lib/adminAuth.ts`）。每次儲存都會重新驗證密碼，所以登入或儲存成功不會清掉之前猜錯的次數，也不會算成一次猜錯。
- 文章沒有從 R2 載入時（R2 回 404 除外），可以進編輯模式，但不能儲存，面板顯示原因。這樣預設文章不會蓋掉正式的文章。
- 儲存時帶著載入時的版本（ETag）。別的分頁或裝置在這之後存過時，這次儲存回 409，面板請你先複製修改再重新整理。這樣不會蓋掉另一邊的修改。
- 每天（UTC）第一次儲存時，被取代的 `data.json` 存成 R2 的 `backup/data-<日期>.json`，存錯或被人改掉時可以還原。`/api/file` 只給 `images/`，備份不會公開。
- 密碼框：半透明黑底加模糊（`backdrop-filter`），6 格數字，只顯示圓點。
- 文章的內文直接在頁面上編輯（`JournalPostBody`），樣式和正式頁相同。上方沒有固定的工具列。
- 選取文字時，選取處上方浮出格式工具列：轉換成（段落、前言、標題、引言、清單）、粗體、斜體、底線、連結、行內程式碼。
- 格式工具列是一條圓角長條，按鈕的提示用 `TooltipGroup`：第一次等 400ms，之後在按鈕間移動時立刻出現並滑過去。
- 空段落在網站上顯示成一行空白，和編輯器一樣。
- 滑鼠移到內文的任何一行，左邊出現「+」和「⠿」（和 Notion、Editor.js 一樣）。「+」在這一行下面新增區塊，這一行是空的時直接換掉它。「⠿」拖曳移動整個區塊，點一下打開區塊選單（刪除）。
- 在最外層的段落打「/」，游標下方打開和「+」相同的清單，接著打的字會篩選（比對英文代號和中文名稱，例如「/code」、「/h2」、「/引言」），方向鍵移動，Enter 或 Tab 插入，Esc 關閉（`@tiptap/suggestion`）。清單右邊顯示每一項的斜線指令（`/text`、`/h2`、`/ul`、`/code`……），「+」的清單也一樣。選單打開時頁面不能捲動，滾輪只捲清單；游標下方放不下時往上開。
- 程式碼卡片的語言用選單選（TypeScript、TSX、JavaScript、JSX、CSS、HTML、JSON、Bash、Python、YAML、SQL、純文字）。上色只有一套類 C 規則，語言只影響標籤和 `#` 註解，純文字不上色。
- 「+」和「⠿」都是 24px 的圖示按鈕，上下置中對齊。「+」離文字 12px。游標停在空行時，那一行也出現「+」。手機和 768px 以下只在空行顯示「+」，放在空行裡面。
- 有欄位的頁面用面板，沒有欄位的頁面用工具列（見 About），Ctrl+S、預覽、儲存和狀態都一樣。
- 編輯面板從右側滑出，只放標題、英文副標、標籤、日期、摘要。寬螢幕時頁面往左移，讓出面板的位置。
- 面板頂端和 About 的工具列是同一組按鈕（`SidePanel` 的 `PanelActions`，兩邊共用一份程式）：預覽、英文翻譯、儲存、登出，都是 32px 的圖示，名稱放在提示裡。頁面還有別的動作時（文章和專案的「取消公開」），登出和它們一起收進「⋯」選單；只有登出時它就是一顆按鈕，不開選單。面板另外多一顆收合（>）。儲存只有在有修改時才亮，提示顯示它現在的意思（儲存、發布或更新）。要加或改按鈕時改 `PanelActions`，面板和工具列會一起變。
- 面板標題下方是一列狀態：狀態燈加文字，和工具列的狀態燈相同。
- 「預覽」切換成正式頁的畫面，不用儲存或登出。
- 收合後右下角留一顆「編輯面板」按鈕，有未儲存的修改時帶一個 `--ember-soft` 的圓點。
- 清單排序用拖曳（⠿），不用上下箭頭。
- 面板一列一個欄位：左邊欄位名稱，右邊值。值看起來像一般文字，點進去才能編輯。
- 面板沒有聚焦框：文字欄位和編輯器只顯示游標。按鈕保留鍵盤聚焦框。
- 面板的字小於 18px，所以一律用 `--font-label`：英文是等寬字，中文是思源宋體。日期、編號、狀態加標籤字距 0.1em。
- 面板和密碼框只給 Wade 用，介面文字只寫中文。
- 英文翻譯是頂端的一顆圖示按鈕（`TranslateSection`），中文和英文版都能按，翻的永遠是英文草稿。翻譯時圖示換成轉圈，提示顯示進度；翻完在按鈕下方出現一張小字條（在中文版會提醒切到 EN 檢查），5 秒後消失，錯誤訊息則留著。它把中文內文（文章還有標題、摘要）交給 `/api/translate`，翻好放進英文草稿，不自動儲存，英文已有內容時先問。只翻文字、圖片的替代文字和圖說，程式碼和版面不動（`docTranslate.ts`）。模型是 Cloudflare Workers AI 的 `@cf/qwen/qwen3.8-27b`，用 `wrangler.toml` 的 `AI` 綁定，不需要金鑰，每天有 10,000 Neurons 免費額度，只有登入的編輯模式能呼叫。姓名、公司名的固定英文寫在 `functions/api/translate.ts` 的翻譯規則裡，新增合作單位時要一起補。
- 文章有草稿和已發布兩種狀態（`draft`，中英文共用）。新文章預設是草稿。草稿停止打字 3 秒後自動儲存，面板的主按鈕是「發布」；已發布的文章不自動儲存，以免改到一半就上線，主按鈕是「更新」，「⋯」裡有「取消公開」。登出也收在「⋯」。只有這篇文章有修改時才自動儲存，列表面板的刪除或排序不會被順便存進去。草稿只在編輯模式出現，網站、上一篇和下一篇、SEO 頁、sitemap、llms.txt 都看不到，直接開網址也是找不到文章；其他文章的編號跳過草稿重新排（`publishedJournal`）。草稿的內容仍存在 R2 的 `data.json`，`/api/data` 讀得到，所以只是不公開，不是保密。
- Journal、About、Projects 可以編輯。Projects 的規格見「Projects 和案例頁」。最早的三個案例頁（Matsu Biennial、MONOLAB、Lustre Yellow）內文寫在程式碼裡，只有卡片的欄位能在面板改。

## Component Library

- 開發模式打開 `/dev/component-library`。編排參考 Radix Themes 的文件：一頁一個主題或元件，網址是 `/dev/component-library/<id>`。
- 分類：概覽（開始使用、樣式、版面、資源）、主題（總覽、Color、Typography、Spacing、Radius、Motion、Breakpoints）、元件、效果、工具。
- 每種頁面有自己的編排：指南用步驟和延伸閱讀，token 頁用色階或刻度、token 程式碼和表格，元件頁用示範、API Reference（每個零件一個小標題）、Examples、鍵盤、說明。
- 左側目錄固定不動。右側的「本頁」列出段落，寬度 1280px 以下隱藏。手機上目錄收成一顆按鈕。
- 文字在 `src/components/dev/`：`guides.data.ts`（概覽和主題）、`componentLibrary.data.tsx`（元件）、`foundations.data.ts`（字級、間距、色票）。這一頁只給開發用，只寫中文，不進正式 build。
- 元件不分組，依字母排序。
- 只列可以自由組合的元件，例如 Button、Drawer、OtpInput。現在只用一次也算，只要它不綁定某個用途。
- 綁定某個用途的組合不列，例如 `SiteNav`、`SidePanel`（編輯面板）、`OtpGate`（密碼框）、`JournalEditPanel`、`AdminProvider`。內部的渲染器（`RichText`）也不列。
- 新增或修改元件時，同一個變更裡更新這份資料。標「待修」的項目是已知問題。
