// The inside of each social icon, for a 24 x 24 viewBox drawn in 1.5 lines. The footer and a post's share buttons draw them.
export const SOCIAL_ICONS = {
  X: (
    <path
      d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.18h1.7L7.4 4.73H5.58l11.09 14.45Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  GitHub: (
    <>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </>
  ),
  Email: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  LinkedIn: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  Instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.25" cy="6.75" r="0.75" fill="currentColor" stroke="none" />
    </>
  ),
  YouTube: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="4" />
      <path d="M10 9.25v5.5L14.75 12 10 9.25z" fill="currentColor" stroke="none" />
    </>
  ),
  Facebook: <path d="M14.5 21v-7.5h2.5l.5-3h-3V8.75c0-.9.3-1.5 1.6-1.5h1.5V4.6A20 20 0 0 0 15.4 4.5c-2.3 0-3.9 1.4-3.9 4v2h-2.5v3h2.5V21" />,
}
