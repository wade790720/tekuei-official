import type { Config } from '@react-router/dev/config'

export default {
  appDirectory: 'src',
  ssr: true,
  // Every route is in the first manifest (about 25 of them), so the language button's first switch to /en
  // waits for no /__manifest request and the text still changes at the peak of the ripple.
  routeDiscovery: { mode: 'initial' },
} satisfies Config
