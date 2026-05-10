# Rendering Strategy

Choose the smallest rendering scope that satisfies the route.

## Default Shape

- Keep `page.tsx` and `layout.tsx` as Server Components unless they directly need hooks, event handlers, or browser APIs.
- Move interactivity into small Client Component islands with `'use client'`.
- Prefer static rendering for public, shared, mostly stable UI.
- Use dynamic server rendering only when the route needs request-time data such as `cookies()`, `headers()`, auth, personalized data, uncached `fetch`, or `searchParams`.
- Use client rendering for browser-only behavior such as geolocation, localStorage, file upload previews, maps, clipboard, share APIs, and interactive filters.

## Common Fixes

```tsx
// Bad: whole route becomes client-side code
'use client'

export default function Page() {
  return <MarketingContent />
}

// Good: static/server page with a focused client island
import { LocaleSwitcher } from './locale-switcher'

export default async function Page() {
  const content = await getContent()
  return (
    <>
      <MarketingContent content={content} />
      <LocaleSwitcher />
    </>
  )
}
```

## Repository Heuristic

In this app:

- Public copy, navigation structure, cards, headings, and metadata should generally stay server-rendered or static.
- `/report` needs client islands for form state, uploads, geolocation, and the map.
- `/issues` can split into a server shell plus a client filter/map/list island.
- `/issues/[id]` can resolve `params` and fetch the issue on the server, then use a client island for device ID, upvote, and share actions.
- Admin/auth pages are dynamic because they depend on cookies and authorization.
