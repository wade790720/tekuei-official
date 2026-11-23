export const ADMIN_SESSION_KEY = 'tekuei_admin_session'

// The edit-mode code is ADMIN_SECRET (Cloudflare Pages env). It must be this many digits.
export const ADMIN_CODE_LENGTH = 6

// Edit mode is for Wade only, so these labels are Chinese only.
export const CMS_LABELS = {
  gatePre: 'EDIT MODE',
  gateTitle: '輸入密碼',
  gateInput: '編輯模式密碼',
  gateHint: 'Esc 關閉',
  verifying: '驗證中',
  verified: '已解鎖',
  wrong: '密碼錯誤，請再試一次',
  locked: '錯太多次，請 15 分鐘後再試',
  save: '儲存',
  saving: '儲存中',
  saved: '已儲存',
  unsaved: '尚未儲存',
  saveFailed: '儲存失敗',
  stale: '文章在別的分頁或裝置存過，這次沒有存，以免蓋掉那邊的修改。請先複製你的修改，再重新整理頁面',
  loadFailed: '文章沒有從伺服器載入，現在儲存會蓋掉正式的文章，所以不能儲存。請重新整理頁面',
  logoutConfirm: '還有修改沒有儲存，確定要登出嗎？修改會被丟掉。',
  logout: '登出',
  preview: '預覽',
  backToEdit: '回到編輯',
  collapse: '收合面板',
  expand: '打開編輯面板',
  dock: '編輯面板',
}

export const TRANSLATE_LABELS = {
  title: '英文翻譯',
  action: '翻譯成英文',
  running: '翻譯中',
  note: '從中文內文翻譯，圖片和程式碼不動，翻完不會自動儲存',
  done: '翻好了，看過後按儲存',
  confirm: '英文版已經有內容，翻譯會蓋掉它。還沒儲存前，重新整理頁面可以放棄這次翻譯。要繼續嗎？',
  switchToEn: '切換到 EN 後可以從中文翻譯',
  empty: '中文內文沒有需要翻譯的文字',
  noBinding: 'Cloudflare 還沒綁定 Workers AI',
  quota: '今天的免費額度用完了，明天再試',
  busy: '翻譯服務忙碌中，請稍後再試',
  badInput: '內容太長或格式不對，無法翻譯',
  failed: '翻譯失敗，請再試一次',
}
