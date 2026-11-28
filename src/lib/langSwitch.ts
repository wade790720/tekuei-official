import { useEffect } from 'react'
import { useLocation } from 'react-router'
import type { ShouldRevalidateFunctionArgs } from 'react-router'
import { samePage } from './localePath.ts'

/** For every route module. A call from revalidate() (the same URL) still reloads. */
export function shouldRevalidate({ currentUrl, nextUrl, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs): boolean {
  if (currentUrl.href === nextUrl.href) return defaultShouldRevalidate
  return samePage(currentUrl.pathname, nextUrl.pathname) ? false : defaultShouldRevalidate
}

let generation = 0
export const forgetLangSwitch = () => {
  generation++
}

/**
 * The Chinese and English pages are two routes (different ids), and React Router always runs the loader of a
 * route it was not showing, whatever shouldRevalidate says. So each page remembers the data it shows, and its
 * clientLoader hands that data to the other language's route instead of asking the server again. Only while the
 * page it remembers is still on screen (during a navigation the URL is still the old one): data remembered on an
 * earlier visit may be out of date.
 */
export function langSwitchCache<T>() {
  let last: { pathname: string; data: T; generation: number } | null = null
  return {
    useRemember(data: T) {
      const { pathname } = useLocation()
      useEffect(() => {
        last = { pathname, data, generation }
      }, [pathname, data])
    },
    clientLoader({ request, serverLoader }: { request: Request; serverLoader: () => Promise<T> }): T | Promise<T> {
      const next = new URL(request.url).pathname
      const fresh = last && last.generation === generation && last.pathname === window.location.pathname
      return last && fresh && last.pathname !== next && samePage(last.pathname, next) ? last.data : serverLoader()
    },
  }
}
