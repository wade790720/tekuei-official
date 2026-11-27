// Screen-reader labels for the site navigation (SiteNav, NavOverlay).
// The language button label starts with its visible text, so voice control users can say what they see.
export const NAV_LABELS = {
  zh: {
    open: '開啟選單',
    close: '關閉選單',
    dialog: '網站導覽',
    lang: 'EN，切換為英文',
  },
  en: {
    open: 'Open menu',
    close: 'Close menu',
    dialog: 'Site navigation',
    lang: 'TW, switch to Chinese',
  },
}

// Shown in place of a page that failed to draw (PageBoundary in App.tsx).
export const PAGE_ERROR = {
  zh: { title: '這一頁出了點問題', hint: '請重新整理，或從上方的選單到其他頁面' },
  en: { title: 'Something went wrong on this page', hint: 'Please reload, or use the menu above to go to another page.' },
}

// Header logo. Same in both languages.
export const SITE_LOGO = 'TEKUEI CHU'
