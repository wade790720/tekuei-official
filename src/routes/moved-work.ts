import { redirect } from 'react-router'
import { langOf, localePath } from '../lib/localePath.ts'
import type { Route } from './+types/moved-work'

export const loader = ({ request }: Route.LoaderArgs) => {
  throw redirect(localePath('/projects', langOf(new URL(request.url).pathname)), 301)
}
