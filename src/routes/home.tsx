import SiteHero from '../components/SiteHero.tsx'
import { CACHED } from '../lib/cf.server.ts'
export { shouldRevalidate } from '../lib/langSwitch.ts'

export const headers = () => CACHED

export default function Home() {
  return <SiteHero />
}
