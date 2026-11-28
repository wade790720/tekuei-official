import { Outlet } from 'react-router'
import { PageError } from '../components/PageError.tsx'

// Every page sits under this route, so a page that fails (a 503 from R2) is replaced here, below the root's
// providers: edit mode and an unsaved draft survive it, and the nav stays so the reader can leave.
export default function Page() {
  return <Outlet />
}

export function ErrorBoundary() {
  return <PageError />
}
