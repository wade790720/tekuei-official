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
  loadFailed: '文章沒有從伺服器載入，現在儲存會蓋掉正式的文章，所以不能儲存。請重新整理頁面',
  logoutConfirm: '還有修改沒有儲存，確定要登出嗎？修改會被丟掉。',
  logout: '登出',
  preview: '預覽',
  backToEdit: '回到編輯',
  collapse: '收合面板',
  expand: '打開編輯面板',
  dock: '編輯面板',
}
