export const CHECKIN_META = {
  zh: { title: 'TEKUEI 報到手續' },
  en: { title: 'TEKUEI Check-In' },
}

/** LINE LIFF ID */
export const CHECKIN_LIFF_ID = '2010388258-lu3PdhFT'

/**
 * Cloudflare Worker 端點（部署後替換為實際網址）
 * 可透過 .env 設定：VITE_CHECKIN_WORKER_URL
 */
export const CHECKIN_WORKER_URL =
  import.meta.env.VITE_CHECKIN_WORKER_URL ||
  'https://tekuei-checkin.tekuei-xx.workers.dev/checkin'

/**
 * 本機開發略過 LIFF（僅 DEV；正式站永遠走 LIFF）
 * DEV 預設開啟。要強制走 LIFF：?liff=1
 * 或 .env.local：VITE_CHECKIN_DEV_BYPASS=false
 */
export function isCheckinDevBypass() {
  if (!import.meta.env.DEV) return false
  if (import.meta.env.VITE_CHECKIN_DEV_BYPASS === 'false') return false
  if (typeof window !== 'undefined') {
    const q = new URLSearchParams(window.location.search)
    if (q.has('liff')) return false
    if (q.has('dev')) return true
  }
  return import.meta.env.VITE_CHECKIN_DEV_BYPASS !== 'false'
}

/**
 * 本機是否真的打 Worker（預設 dry-run，只 log）
 * .env.local：VITE_CHECKIN_LIVE=true
 * 或 URL：?live=1
 */
export function isCheckinLiveSubmit() {
  if (import.meta.env.VITE_CHECKIN_LIVE === 'true') return true
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).has('live')
}

export const CHECKIN_DEV_PROFILE = {
  userId: 'dev-local-user',
  displayName: 'Local Dev',
}

/** react-phone-input-2 預設國家（ISO 小寫） */
export const DEFAULT_PHONE_COUNTRY = 'tw'

/** 清單置頂國家 */
export const PREFERRED_PHONE_COUNTRIES = ['tw', 'jp', 'hk', 'mo', 'sg', 'my', 'kr', 'cn', 'us', 'gb']
