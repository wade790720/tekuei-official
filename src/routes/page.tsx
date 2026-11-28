import { Outlet } from 'react-router'
import { PageError } from '../components/PageError.tsx'

export default function Page() {
  return <Outlet />
}

export function ErrorBoundary() {
  return <PageError />
}
