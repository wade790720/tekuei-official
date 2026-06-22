export const ABOUT_IMAGE_SLOTS = {
  founder: {
    label: '創辦人肖像',
    width: 900,
    height: 1200,
    aspectRatio: '3:4',
    maxSizeMB: 1,
    hint: '建議 900×1200px（3:4），JPG / WEBP / PNG，單檔不超過 1MB',
    r2Slot: 'founder',
  },
  founderSignature: {
    label: '簽名圖',
    maxSizeMB: 1,
    hint: '透明底 PNG，疊於照片右下角；可略微超出外框',
    accept: 'image/png',
    r2Slot: 'founder-signature',
  },
}

export const ABOUT_IMAGE_MAX_BYTES = 1024 * 1024
