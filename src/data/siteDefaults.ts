import type { SiteData, WorkData } from '../lib/siteData.ts'
import json from './data.json'

/** The bundled copy of data.json: what the site shows until R2 answers, or when it has nothing. */
export const siteDefaults: SiteData & { work: WorkData } = json
