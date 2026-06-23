export const HOW_TO_CHECKIN_META = {
  zh: {
    title: 'TEKUEI · 報到教學',
    description: '活動報名成功後，請依步驟完成 LINE 報到手續，約 1 分鐘即可完成。',
  },
  en: {
    title: 'TEKUEI · Check-In Guide',
    description: 'After registering, follow these steps to complete your LINE check-in. Takes about 1 minute.',
  },
}

export const HOW_TO_CHECKIN_LINE_URL = 'https://tekuei.com/line'

export const HOW_TO_CHECKIN_HERO = {
  zh: {
    title: ['恭喜', '您已成功報名活動'],
    subtitle: '上課前請先完成以下報到手續（只須 1 分鐘）',
  },
  en: {
    title: ['Congratulations!', 'Your registration is confirmed.'],
    subtitle: 'Please complete the check-in steps below before class (takes about 1 minute).',
  },
}

export const HOW_TO_CHECKIN_STEPS = {
  zh: [
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
  ],
  en: [
    {
      step: '01',
      title: 'Follow the official LINE account',
      body: 'After following, proceed through the steps below.',
      cta: {
        label: 'Follow on LINE',
        href: HOW_TO_CHECKIN_LINE_URL,
        external: true,
      },
    },
    {
      step: '02',
      title: ['After following,', 'tap "Check-In" then tap "Allow"'],
      images: [
        {
          src: '/how-to-checkin/step-01.png',
          alt: 'LINE official account welcome message with Check-In button',
        },
        {
          src: '/how-to-checkin/step-02.png',
          alt: 'LINE authorization screen, tap Allow',
        },
      ],
    },
    {
      step: '03',
      title: 'Enter your phone number and tap "Submit"',
      image: '/how-to-checkin/step-03.png',
      imageAlt: 'TEKUEI check-in form, enter phone number and submit',
    },
    {
      step: '04',
      title: 'Confirm your number is correct',
      body: [
        'Review your number, then tap "Confirm".',
        ['If you skip the LINE check-in, you will', { em: 'not receive' }, 'the official class link or updates. For any issues, feel free to', { em: 'ask a TA via LINE' }, '!'],
      ],
      image: '/how-to-checkin/step-04.png',
      imageAlt: 'LINE phone number confirmation and check-in complete screen',
    },
  ],
}

export const HOW_TO_CHECKIN_PERKS = {
  zh: [
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
  ],
  en: [
    {
      num: '1',
      title: 'Exclusive Gift',
      body: 'Received when you attend the full session',
    },
    {
      num: '2',
      title: 'SMS Reminder',
      body: 'A text reminder will be sent before the event — keep an eye on your phone',
    },
    {
      num: '3',
      title: 'Session Recording',
      body: 'A replay will be available for 7 days after the session ends',
    },
  ],
}

export const HOW_TO_CHECKIN_PERKS_LABEL = {
  zh: { eyebrow: '說明會當日', heading: '完成報到後，您將收到' },
  en: { eyebrow: 'On the day', heading: 'After checking in, you will receive' },
}

export const HOW_TO_CHECKIN_FINAL = {
  zh: {
    lead: '小禮物會由 LINE 發送',
    body: '建議先加好友，才不會手忙腳亂喔！',
    closing: '期待當天與你見面！',
  },
  en: {
    lead: 'Your gift will be sent via LINE.',
    body: 'We recommend following the account first so everything goes smoothly on the day.',
    closing: 'Looking forward to seeing you!',
  },
}
