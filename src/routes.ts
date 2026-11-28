import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes'

// The same pages twice: Chinese at the root, English under /en. Route ids must differ.
const pages = (p: '' | 'en-') => [
  index('routes/home.tsx', { id: `${p}home` }),
  route('about', 'routes/about.tsx', { id: `${p}about` }),
  route('journal', 'routes/journal.tsx', { id: `${p}journal` }),
  route('journal/:slug', 'routes/journal-post.tsx', { id: `${p}journal-post` }),
  route('projects', 'routes/projects.tsx', { id: `${p}projects` }),
  route('projects/:slug', 'routes/project.tsx', { id: `${p}project` }),
  route('labs/:slug', 'routes/lab.tsx', { id: `${p}lab` }),
  route('how-to-checkin', 'routes/how-to-checkin.tsx', { id: `${p}how-to-checkin` }),
  route('work', 'routes/moved-work.ts', { id: `${p}moved-work` }),
  route('cases/:slug', 'routes/moved-case.ts', { id: `${p}moved-case` }),
]

export default [
  layout('routes/page.tsx', [
    ...pages(''),
    ...prefix('en', pages('en-')),
    // One URL each: the lab page's iframe, and the LIFF URL registered with LINE.
    route('labs/:slug/live', 'routes/lab-live.tsx'),
    route('checkin', 'routes/checkin.tsx'),
    ...(process.env.NODE_ENV === 'development' ? [route('dev/component-library/:page?', 'routes/dev-library.tsx')] : []),
    route('*', 'routes/not-found.tsx'),
  ]),
  route('sitemap.xml', 'routes/sitemap.ts'),
  route('llms.txt', 'routes/llms.ts'),
] satisfies RouteConfig
