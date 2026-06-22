export const WORK_IMAGE_SLOTS = {
  thumb: (item) => ({
    label: `${item.client} 列表縮圖`,
    width: 1280,
    height: 800,
    aspectRatio: '16:10',
    maxSizeMB: 1,
    hint: 'JPG / PNG / WEBP，單檔 ≤1MB。未上傳時顯示漸層與圖示。',
  }),
}

export const CASE_IMAGE_SLOTS = {
  hero: () => ({
    label: 'Hero 背景圖',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    maxSizeMB: 1,
    hint: '全螢幕背景，建議橫式。未上傳時顯示漸層背景。',
  }),
  mediaFull: () => ({
    label: '全幅案例圖',
    width: 2100,
    height: 900,
    aspectRatio: '21:9',
    maxSizeMB: 1,
    hint: '橫跨視窗寬度。未上傳時顯示漸層區塊。',
  }),
  mediaInline: () => ({
    label: '內嵌案例圖',
    width: 1600,
    height: 900,
    aspectRatio: '16:9',
    maxSizeMB: 1,
    hint: '內文區塊內展示。未上傳時顯示漸層區塊。',
  }),
}
