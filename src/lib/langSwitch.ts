import { useEffect } from 'react'
import { useLocation } from 'react-router'
import type { ShouldRevalidateFunctionArgs } from 'react-router'
import { samePage } from './localePath.ts'

// The language button navigates to the same page in the other language, at the peak of the water ripple
// (waterRipple.ts, 300 ms). Every loader returns both languages and none reads the query string, so neither
// that navigation nor a new ?tag= needs a request.

/** For every route module. A call from revalidate() (the same URL) still reloads. */
export function shouldRevalidate({ currentUrl, nextUrl, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs): boolean {
  if (currentUrl.href === nextUrl.href) return defaultShouldRevalidate
  return samePage(currentUrl.pathname, nextUrl.pathname) ? false : defaultShouldRevalidate
}

/**
 * The Chinese and English pages are two routes (different ids), and React Router always runs the loader of a
 * route it was not showing, whatever shouldRevalidate says. So each page remembers the data it shows, and its
 * clientLoader hands that data to the other language's route instead of asking the server again.
 */
export function langSwitchCache<T>() {
  let last: { pathname: string; data: T } | null = null
  return {
    /** The page calls this with the data it shows. */
    useRemember(data: T) {
      const { pathname } = useLocation()
      useEffect(() => {
        last = { pathname, data }
      }, [pathname, data])
    },
    clientLoader({ request, serverLoader }: { request: Request; serverLoader: () => Promise<T> }): T | Promise<T> {
      const next = new URL(request.url).pathname
      return last && last.pathname !== next && samePage(last.pathname, next) ? last.data : serverLoader()
    },
  }
}
