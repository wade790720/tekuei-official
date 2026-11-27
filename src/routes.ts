import { type RouteConfig, route } from '@react-router/dev/routes'

export default [
  // Every URL, "/" included, renders the old <Routes> in App until each page gets its own route module.
  route('*?', 'routes/catchall.tsx'),
] satisfies RouteConfig
