import { redirect } from 'react-router'
import { langOf, localePath } from '../lib/localePath.ts'
import { projectHref } from '../lib/projectHref.ts'
import { MOVED } from '../lib/seo.ts'
import type { Route } from './+types/moved-case'

export const loader = ({ request, params }: Route.LoaderArgs) => {
  const path = `/cases/${params.slug}`
  throw redirect(localePath(MOVED[path] ?? projectHref(path), langOf(new URL(request.url).pathname)), 301)
}
