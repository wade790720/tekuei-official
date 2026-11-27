import { createContext, data } from 'react-router'
import type { HeadersArgs, RouterContextProvider } from 'react-router'
import type { Env } from '../../functions/env.d.ts'
import { siteDefaults } from '../data/siteDefaults.ts'
import { parseSiteData } from './siteData.ts'
import type { SectionName, SiteData } from './siteData.ts'

/** The Worker's bindings and execution context, set per request by the Worker entry. */
export const cf = createContext<{ env: Env; ctx: { waitUntil(promise: Promise<unknown>): void } }>()

const NO_STORE = { 'Cache-Control': 'no-store' }
export const CACHED = { 'Cache-Control': 'public, max-age=300' }

/** A page that does not exist, or a draft: the page draws its own "not found". Not cached, a slug can appear any time. */
export const notFound = <T>(value: T) => data(value, { status: 404, headers: NO_STORE })

/** A page with its data, cached for five minutes like the old Pages Functions. */
export const found = <T>(value: T) => data(value, { headers: CACHED })

/**
 * data.json from R2, parsed at the boundary. A bucket with no data.json yet gives the bundled defaults.
 * A failed read, broken JSON, or one of `sections` in a shape the site cannot read throws a 503, so a
 * crawler does not take a moment of R2 trouble for a deleted page.
 */
export async function readSite(context: Readonly<RouterContextProvider>, sections: SectionName[]): Promise<SiteData> {
  const { env } = context.get(cf)
  let site: SiteData
  try {
    const obj = await env.BUCKET.get('data.json')
    if (!obj) return siteDefaults
    const parsed = parseSiteData(await obj.json())
    if (sections.some((s) => parsed.invalid.includes(s))) throw new Error(`invalid section in data.json: ${parsed.invalid.join(', ')}`)
    site = parsed.data
  } catch (err) {
    console.error(err)
    throw data(null, { status: 503, headers: NO_STORE })
  }
  return site
}

/** For every route module with a loader: the loader's Cache-Control, or the error's when it threw. */
export const pageHeaders = ({ loaderHeaders, errorHeaders }: HeadersArgs): Headers => errorHeaders ?? loaderHeaders
