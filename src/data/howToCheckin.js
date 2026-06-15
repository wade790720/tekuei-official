export const HOW_TO_CHECKIN_META = {
  title: 'TEKUEI · 報到教學',
  description: '活動報名成功後，請依步驟完成 LINE 報到手續，約 1 分鐘即可完成。',
}

export const HOW_TO_CHECKIN_LINE_URL = 'https://tekuei.com/line'

export const HOW_TO_CHECKIN_HERO = {
  title: ['恭喜', '您已成功報名活動'],
  subtitle: '上課前請先完成以下報到手續（只須 1 分鐘）',
}

export const HOW_TO_CHECKIN_STEPS = [
  {
    step: '01',
    title: '加入老師的 LINE 官方帳號',
    body: '加入後，請參考下方教學步驟執行',
    cta: {
      label: '加入 LINE 官方帳號',
      href: HOW_TO_CHECKIN_LINE_URL,
      external: true,
    },
  },
  {
    step: '02',
    title: ['加入好友後，', '請按「點我報到」，再按「許可」'],
    images: [
      {
        src: '/how-to-checkin/step-01.png',
        alt: 'LINE 官方帳號歡迎訊息與點我報到按鈕',
      },
      {
        src: '/how-to-checkin/step-02.png',
        alt: 'LINE 認證畫面，點選許可按鈕',
      },
    ],
  },
  {
    step: '03',
    title: '輸入手機號碼，按下「提交資料」',
    image: '/how-to-checkin/step-03.png',
    imageAlt: 'TEKUEI 報到表單，輸入手機號碼並提交',
  },
  {
    step: '04',
    title: '確認號碼是否正確',
    body: [
      '確認號碼是否正確，再點擊「確認無誤」',
      ['若未於 LINE 報到，將', { em: '無法收到' }, '正式連結與通知；有任何操作問題，都可以在', { em: 'LINE 詢問助教' }, '唷！'],
    ],
    image: '/how-to-checkin/step-04.png',
    imageAlt: 'LINE 確認手機號碼與報到完成畫面',
  },
]

export const HOW_TO_CHECKIN_PERKS = [
  {
    num: '1',
    title: '專屬小禮',
    body: '全程參與說明會時，即可領取',
  },
  {
    num: '2',
    title: '手機簡訊',
    body: '活動前將以簡訊提醒，請留意手機通知',
  },
  {
    num: '3',
    title: '回放影片',
    body: '說明會結束後，將提供活動回放，並保留 7 天供您觀看',
  },
]

export const HOW_TO_CHECKIN_FINAL = {
  lead: '小禮物會由 LINE 發送',
  body: '建議先加好友，才不會手忙腳亂喔！',
  closing: '期待當天與你見面！',
}
