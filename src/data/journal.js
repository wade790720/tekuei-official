export const JOURNAL_META = {
  zh: {
    title: 'Journal · TEKUEI',
    description: '關於留白、水墨、新東方主義與品牌美學的思考。',
  },
  en: {
    title: 'Journal · TEKUEI',
    description: 'Reflections on negative space, ink wash, neo-orientalism, and brand aesthetics.',
  },
}

export const JOURNAL_HEADER = {
  zh: {
    pre: 'J O U R N A L · 隨 筆',
    desc: ['關於留白、水墨、新東方主義與品牌美學的思考。', '在黑白之間，尋找呼吸的節奏。'],
  },
  en: {
    pre: 'J O U R N A L',
    desc: ['Reflections on negative space, ink wash, neo-orientalism, and brand aesthetics.', 'Finding rhythm between black and white.'],
  },
}

export const JOURNAL_POSTS = {
  zh: [
    {
      slug: 'ma-negative-space',
      num: '01',
      category: 'PHILOSOPHY',
      categoryZh: '哲學',
      date: '2026.03.12',
      readMin: 6,
      title: '留白的建築',
      titleEn: 'The Architecture of Ma',
      excerpt: '當畫面什麼都沒有，才是品牌最有力的時刻。日本美學中的「間」，不是空，是意圖。',
      heroInk: 'ma',
    },
    {
      slug: 'ink-monochrome',
      num: '02',
      category: 'VISUAL',
      categoryZh: '視覺',
      date: '2026.02.28',
      readMin: 8,
      title: '水墨與黑白',
      titleEn: 'Ink & Monochrome',
      excerpt: '墨色在五調子之間流動，黑不是終點，白也不是起點。數位介面上的水墨，是一種克制的美學選擇。',
      heroInk: 'ink',
    },
    {
      slug: 'neo-orientalism',
      num: '03',
      category: 'CULTURE',
      categoryZh: '文化',
      date: '2026.02.08',
      readMin: 7,
      title: '新東方主義',
      titleEn: 'Neo-Orientalism',
      excerpt: '傳統不是復古，是把千年的審美語言，翻譯成當代人能感受的形式。東方靈韻，不必穿和服出場。',
      heroInk: 'orient',
    },
    {
      slug: 'bleach-aesthetic',
      num: '04',
      category: 'AESTHETIC',
      categoryZh: '美學',
      date: '2026.01.20',
      readMin: 9,
      title: '死神美學的啟示',
      titleEn: 'Notes from Bleach',
      excerpt: '久保帶人用極致的黑白對比與留白，讓每一格漫畫都像書法作品。品牌設計，也能有這樣的氣場。',
      heroInk: 'blade',
    },
  ],
  en: [
    {
      slug: 'ma-negative-space',
      num: '01',
      category: 'PHILOSOPHY',
      date: '2026.03.12',
      readMin: 6,
      title: 'The Architecture of Ma',
      titleEn: 'The Architecture of Ma',
      excerpt: 'When a composition holds nothing, the brand speaks loudest. The Japanese concept of "Ma" is not emptiness — it is intention.',
      heroInk: 'ma',
    },
    {
      slug: 'ink-monochrome',
      num: '02',
      category: 'VISUAL',
      date: '2026.02.28',
      readMin: 8,
      title: 'Ink & Monochrome',
      titleEn: 'Ink & Monochrome',
      excerpt: 'Ink moves through five tonal registers — black is not the end, white is not the beginning. Ink wash on a digital interface is a choice of restrained beauty.',
      heroInk: 'ink',
    },
    {
      slug: 'neo-orientalism',
      num: '03',
      category: 'CULTURE',
      date: '2026.02.08',
      readMin: 7,
      title: 'Neo-Orientalism',
      titleEn: 'Neo-Orientalism',
      excerpt: 'Tradition is not nostalgia. It is the act of translating a millennium of aesthetic language into a form the contemporary eye can feel.',
      heroInk: 'orient',
    },
    {
      slug: 'bleach-aesthetic',
      num: '04',
      category: 'AESTHETIC',
      date: '2026.01.20',
      readMin: 9,
      title: 'Notes from Bleach',
      titleEn: 'Notes from Bleach',
      excerpt: 'Tite Kubo uses extreme black-and-white contrast and negative space to make every panel feel like calligraphy. Brand design can carry that same gravity.',
      heroInk: 'blade',
    },
  ],
}

/** @param {string} slug */
export function getJournalPost(slug, lang = 'zh') {
  return (JOURNAL_POSTS[lang] ?? JOURNAL_POSTS.zh).find((p) => p.slug === slug) ?? null
}

/** @param {string} slug */
export function getAdjacentPosts(slug, lang = 'zh') {
  const posts = JOURNAL_POSTS[lang] ?? JOURNAL_POSTS.zh
  const i = posts.findIndex((p) => p.slug === slug)
  if (i < 0) return { prev: null, next: null }
  return {
    prev: i > 0 ? posts[i - 1] : null,
    next: i < posts.length - 1 ? posts[i + 1] : null,
  }
}

export const JOURNAL_CONTENT = {
  zh: {
    'ma-negative-space': {
      documentTitle: '留白的建築 · Journal · TEKUEI',
      blocks: [
        { type: 'lead', text: '留白不是懶惰，是對觀者的尊重。你願意給他們空間，他們才願意走進來。' },
        { type: 'p', text: '在 TEKUEI 的設計哲學裡，「間（ま）」從不是裝飾性的空白。它是充滿意圖的沉默——讓文字呼吸、讓視線停留、讓情緒在未被填滿的空間裡自行成形。' },
        { type: 'h2', text: '為什麼高級品牌都敢留白' },
        { type: 'p', text: '廉價的設計害怕空白，於是用顏色、圖示、動效把每一寸空間塞滿。高級的設計恰恰相反：它相信內容本身有重量，不需要喧嘩的框架來證明存在。' },
        { type: 'quote', text: '至少 40% 的空間應該是空的，且是有意圖的空。', attr: 'TEKUEI Brand Manual · Design Philosophy' },
        { type: 'p', text: '當你打開一個品牌官網，第一眼看到的不是資訊量，而是節奏。節奏來自留白的比例、來自行與行之間的距離、來自標題與內文之間那道無形的氣場。' },
        { type: 'h2', text: '數位時代的「間」' },
        { type: 'p', text: '螢幕沒有紙張的物理邊界，人們反而更容易迷失在無盡的捲動裡。此時留白是一種導引：它告訴觀者「這裡夠了，你可以停一下」。' },
        { type: 'p', text: '我們在每一個 TEKUEI 專案中追求的，不是把畫面填滿，而是找到那個「多一分則溢、少一分則虛」的臨界點。那個點，就是品牌氣質的所在。' },
      ],
    },
    'ink-monochrome': {
      documentTitle: '水墨與黑白 · Journal · TEKUEI',
      blocks: [
        { type: 'lead', text: '水墨的靈魂在於不可控的流動——墨水碰到宣紙，自然暈開，無法複製，無法強求。' },
        { type: 'p', text: '在數位介面上重現水墨，不是把一張水墨 PNG 貼上去。而是讓整個介面的色調、對比、筆觸邏輯，都服從同一套墨的物理法則。' },
        { type: 'h2', text: '五調子的層次' },
        { type: 'p', text: '傳統水墨講究焦、濃、重、淡、清五種墨色層次。對應到 UI，就是最深背景、主文字、次要文字、分隔線、與近乎透明的裝飾元素——每一層都有存在的理由，沒有一層是多餘的。' },
        { type: 'quote', text: '石墨深藍本身帶著沉靜的質地。游標互動的暈染，用中性暖灰，而非刺眼的白或金。', attr: 'TEKUEI · Ink Wash Aesthetic' },
        { type: 'h2', text: '黑白對比的力量' },
        { type: 'p', text: '純黑與純白都太絕對，會破壞水墨的有機感。我們用的是帶藍的石墨灰、帶暖的宣紙白——在極致的對比中，仍保留一絲人性的溫度。' },
        { type: 'p', text: '當一個品牌敢於用黑白說話，它傳達的是自信：我不需要用顏色譁眾取寵，我的內容本身就有力量。' },
      ],
    },
    'neo-orientalism': {
      documentTitle: '新東方主義 · Journal · TEKUEI',
      blocks: [
        { type: 'lead', text: '新東方主義不是把書法、山水、祥雲貼滿畫面。它是把東方美學的「精神結構」，轉譯成當代語言。' },
        { type: 'p', text: '很多人一聽到「東方風格」，腦中浮現的是刻板符號：紅色、金色、龍鳳、圓形門洞。但真正能打動人的，是東方美學背後的思維方式——留白、克制、意境、與自然共處的節奏感。' },
        { type: 'h2', text: '傳統的當代轉譯' },
        { type: 'p', text: 'TEKUEI 的視覺系統裡，斜紋暗格來自高端和裝的壓印質感，Instrument Serif 的優雅襯線呼應書法的筆鋒流動，水墨游標則是數位時代對「筆意」的重新詮釋。' },
        { type: 'quote', text: '「間」是哲學概念，不是視覺裝飾物。不是把漢字「間」放在畫面上。', attr: 'TEKUEI · Anti-Patterns' },
        { type: 'h2', text: '與世界對話的東方' },
        { type: 'p', text: '新東方主義的目標，是讓一個台灣創作者、一個亞洲品牌，在全球語境下仍保有獨特的氣質，而不顯得格格不入。這需要對傳統的深度理解，也需要對當代設計趨勢的敏銳感知。' },
        { type: 'p', text: '我們在做的，是用東方的骨架，撐起一個現代品牌該有的完整度——官網、社群、影像、敘事，全部從同一個美學源頭長出來。' },
      ],
    },
    'bleach-aesthetic': {
      documentTitle: '死神美學的啟示 · Journal · TEKUEI',
      blocks: [
        { type: 'lead', text: '久保帶人的《BLEACH》有一種罕見的視覺紀律：即使在最激烈的戰鬥場面，構圖仍保持書法般的平衡與留白。' },
        { type: 'p', text: '這不是偶然。久保帶人曾在訪談中提到，他深受書法與日本傳統美術影響。死神世界觀裡的死霸裝、斬魄刀、屍魂界的建築——每一個元素都在極簡的黑白框架中，透過線條的粗細與空間的配置來傳達力量。' },
        { type: 'h2', text: '黑白漫畫教會品牌的事' },
        { type: 'p', text: '漫畫分鏡的本質，是在有限的格子裡控制視線的流動。品牌設計的本質，是在有限的注意力裡控制情感的流動。兩者的底層邏輯是相通的。' },
        { type: 'quote', text: '外在：冷靜、高級、精準、克制。內核：「我希望更多人真正活出自己。」', attr: 'TEKUEI · Emotional Signature' },
        { type: 'h2', text: '線條即氣場' },
        { type: 'p', text: '死神美學裡，一條 0.5px 的線可以比一整塊色面更有壓迫感。在品牌設計中，分隔線的粗細、標題字距的寬度、區塊之間的距離——這些「線」構成了品牌的氣場。' },
        { type: 'h2', text: '從漫畫到官網' },
        { type: 'p', text: 'TEKUEI 官網的 Journal 頁面，正是向這種美學致敬的實驗：極致的黑白、大量的留白、水墨質感的底層紋理，以及如刀鋒般精準的排版節奏。' },
        { type: 'p', text: '我們不是在複製死神，而是在學習一種讓人屏息的視覺紀律——然後把它變成幫助創作者被世界看見的工具。' },
      ],
    },
  },
  en: {
    'ma-negative-space': {
      documentTitle: 'The Architecture of Ma · Journal · TEKUEI',
      blocks: [
        { type: 'lead', text: 'White space is not laziness. It is respect for the viewer — giving them room to enter.' },
        { type: 'p', text: 'In TEKUEI\'s design philosophy, "Ma (間)" is never decorative emptiness. It is intentional silence — space that lets words breathe, eyes rest, and emotions form on their own in the unfilled gaps.' },
        { type: 'h2', text: 'Why premium brands dare to leave space' },
        { type: 'p', text: 'Cheap design fears emptiness, filling every inch with color, icons, and motion. Premium design is the opposite: it trusts that content has weight, and needs no noisy frame to prove it exists.' },
        { type: 'quote', text: 'At least 40% of the composition should be empty — and intentionally so.', attr: 'TEKUEI Brand Manual · Design Philosophy' },
        { type: 'p', text: 'When you open a brand\'s website, you don\'t perceive information first — you perceive rhythm. Rhythm comes from the proportion of white space, the distance between lines, the invisible force between headline and body text.' },
        { type: 'h2', text: 'Ma in the digital age' },
        { type: 'p', text: 'A screen has no physical edge; people lose themselves in endless scrolling. White space becomes a guide: it tells the viewer, "This is enough — you can stop here."' },
        { type: 'p', text: 'In every TEKUEI project, we don\'t seek to fill the frame. We seek the threshold — where one more element would be too much, and one less would leave it hollow. That threshold is where brand presence lives.' },
      ],
    },
    'ink-monochrome': {
      documentTitle: 'Ink & Monochrome · Journal · TEKUEI',
      blocks: [
        { type: 'lead', text: 'The soul of ink wash is uncontrollable flow — ink meets xuan paper and blooms naturally, impossible to reproduce, impossible to force.' },
        { type: 'p', text: 'Recreating ink on a digital interface is not pasting an ink wash PNG. It means making the entire interface — its palette, contrast, and stroke logic — obey the same physical laws as ink.' },
        { type: 'h2', text: 'The five tonal registers' },
        { type: 'p', text: 'Traditional ink painting works with five tones: scorched, concentrated, heavy, light, and clear. In UI, these become the deepest background, primary text, secondary text, divider lines, and near-transparent decorative elements — each layer with purpose, none superfluous.' },
        { type: 'quote', text: 'Graphite blue carries quiet weight. Cursor-hover ink spreads in neutral warm grey — never harsh white, never loud gold.', attr: 'TEKUEI · Ink Wash Aesthetic' },
        { type: 'h2', text: 'The power of black and white contrast' },
        { type: 'p', text: 'Pure black and pure white are both too absolute — they destroy the organic quality of ink wash. We use a blue-tinged graphite grey and a warm xuan-paper white: in extreme contrast, we still retain a thread of human warmth.' },
        { type: 'p', text: 'When a brand dares to speak in black and white, it communicates confidence: I don\'t need color to grab attention. My content has its own gravity.' },
      ],
    },
    'neo-orientalism': {
      documentTitle: 'Neo-Orientalism · Journal · TEKUEI',
      blocks: [
        { type: 'lead', text: 'Neo-Orientalism is not filling the canvas with calligraphy, landscapes, and cloud patterns. It is translating the "spiritual structure" of Eastern aesthetics into contemporary language.' },
        { type: 'p', text: 'When most people hear "Eastern style," they picture clichés: red, gold, dragons, circular doorways. But what actually moves people is the thinking behind Eastern aesthetics — negative space, restraint, atmosphere, a rhythm that coexists with nature.' },
        { type: 'h2', text: 'Translating tradition into the contemporary' },
        { type: 'p', text: 'In TEKUEI\'s visual system, the diagonal textured grid draws from the impressed quality of premium Japanese washi; the elegant serifs of Instrument Serif echo the flowing strokes of calligraphy; the ink-wash cursor is a reinterpretation of brushstroke intent for the digital age.' },
        { type: 'quote', text: '"Ma" is a philosophical concept, not a visual ornament. It is not placing the character 間 on screen.', attr: 'TEKUEI · Anti-Patterns' },
        { type: 'h2', text: 'The East in conversation with the world' },
        { type: 'p', text: 'Neo-Orientalism aims to let a Taiwanese creator, an Asian brand, maintain a distinctive character in a global context — without looking out of place. This requires deep understanding of tradition and sharp sensitivity to contemporary design.' },
        { type: 'p', text: 'What we do is use an Eastern skeleton to support the full integrity a modern brand needs — website, social, imagery, narrative — all grown from the same aesthetic root.' },
      ],
    },
    'bleach-aesthetic': {
      documentTitle: 'Notes from Bleach · Journal · TEKUEI',
      blocks: [
        { type: 'lead', text: 'Tite Kubo\'s Bleach carries a rare visual discipline: even in the most violent battle sequences, the composition retains calligraphic balance and negative space.' },
        { type: 'p', text: 'This is not coincidence. Kubo has spoken in interviews about his deep influence from calligraphy and traditional Japanese art. The shinigami robes, zanpakutō, the architecture of the Soul Society — every element channels force through line weight and spatial arrangement within a radical black-and-white frame.' },
        { type: 'h2', text: 'What black-and-white manga teaches branding' },
        { type: 'p', text: 'The essence of manga paneling is controlling the flow of the eye within a bounded frame. The essence of brand design is controlling the flow of emotion within a bounded attention span. The underlying logic is the same.' },
        { type: 'quote', text: 'Outward: calm, refined, precise, restrained. Core: "I want more people to truly live as themselves."', attr: 'TEKUEI · Emotional Signature' },
        { type: 'h2', text: 'Lines as presence' },
        { type: 'p', text: 'In Bleach\'s aesthetic, a single 0.5px line can hold more presence than an entire block of color. In brand design, the thickness of a divider, the letter-spacing of a headline, the distance between sections — these "lines" constitute the brand\'s aura.' },
        { type: 'h2', text: 'From manga to website' },
        { type: 'p', text: 'TEKUEI\'s Journal section is an experiment in homage to this aesthetic: extreme black and white, abundant negative space, an ink-wash undertone, and typographic rhythm as precise as a sword edge.' },
        { type: 'p', text: 'We are not copying Bleach. We are studying a kind of visual discipline that makes people hold their breath — then turning it into a tool that helps creators be seen by the world.' },
      ],
    },
  },
}
