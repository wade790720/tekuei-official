export const CHECKIN_META = {
  title: 'TEKUEI 報到手續',
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
