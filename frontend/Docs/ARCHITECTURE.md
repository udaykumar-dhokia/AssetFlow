# AssetFlow Frontend — Architecture Reference

> **AI INSTRUCTION**: Read this document before generating any component, hook, or service.
> Check this doc to understand established patterns before writing new code.

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19 + Vite |
| Language | JavaScript (NO TypeScript) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Routing | React Router DOM v7 |
| Global State | Redux Toolkit + React Redux |
| Server State | TanStack Query v5 |
| HTTP Client | Axios |
| Forms | React Hook Form + Zod + @hookform/resolvers |
| Tables | @tanstack/react-table |
| Charts | Recharts |
| Icons | Lucide React |
| Calendar | FullCalendar |
| Realtime | Socket.IO Client |
| Toasts | Sonner |
| Utilities | DayJS, clsx, tailwind-merge, qrcode.react |

---

## Architecture Layers

```
Pages
  ↓
Reusable Components
  ↓
Custom Hooks
  ↓
Services (Axios calls)
  ↓
api.js (Axios instance)
  ↓
Backend APIs
```

**Rules:**
- Pages NEVER call axios directly
- Pages NEVER import from services directly — use custom hooks
- Server API data NEVER goes into Redux — use TanStack Query
- Redux stores only: auth, sidebar, theme, notifications, socket

---

## Folder Structure

```
src/
├── assets/              # Static images, SVGs, fonts
├── components/
│   ├── common/          # ErrorBoundary, AppInitializer, etc.
│   ├── ui/              # shadcn/ui components
│   ├── forms/           # Form* reusable components
│   ├── tables/          # DataTable + related components
│   ├── charts/          # Chart wrapper components
│   ├── cards/           # StatsCard, InfoCard, etc.
│   ├── dialogs/         # ConfirmDialog, DeleteDialog, etc.
│   ├── loaders/         # GlobalLoader, PageLoader, ButtonLoader, etc.
│   ├── filters/         # FilterBar, SearchBar, etc.
│   ├── status/          # StatusBadge, etc.
│   └── empty/           # EmptyState, NoData, etc.
├── config/
│   ├── env.js           # Environment variables
│   └── queryClient.js   # TanStack Query client config
├── constants/
│   ├── roles.js         # ROLES enum + helpers
│   ├── routes.js        # ROUTES constants
│   └── queryKeys.js     # TanStack Query key factory
├── hooks/               # useAuth, useSocket, useTheme, usePermissions, etc.
├── layouts/             # AppLayout, AuthLayout, Sidebar, Header, PageWrapper
├── lib/
│   └── utils.js         # cn() helper
├── pages/               # Feature pages (all lazy-loaded)
├── redux/
│   ├── store.js
│   └── slices/          # authSlice, sidebarSlice, themeSlice, etc.
├── routes/              # ProtectedRoute, PublicRoute, RoleGuard, index.jsx
├── services/            # api.js + per-module services
├── socket/              # index.js, events.js, socketService.js
├── styles/              # index.css (design tokens + Tailwind)
└── utils/               # formatters.js, validators.js
```

---

## Redux — What Goes Where

### In Redux (global UI state)
- `auth.token` — JWT token
- `auth.user` — Logged-in user object
- `auth.isInitializing` — App startup auth check
- `sidebar.isCollapsed` — Sidebar state
- `theme.theme` — light/dark
- `notifications.liveNotifications` — Socket-pushed notifications
- `notifications.unreadCount` — Badge count
- `socket.isConnected` — Socket connection status

### In TanStack Query (server state)
- All API data: assets, departments, categories, employees, bookings, etc.

---

## TanStack Query Patterns

```js
// Service call
const { data, isLoading, error } = useQuery({
  queryKey: QUERY_KEYS.ASSETS,
  queryFn: assetService.getAll,
})

// Mutation
const { mutate } = useMutation({
  mutationFn: assetService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS })
    toast.success('Asset registered!')
  },
})
```

---

## Component Rules

1. **Always check for existing components before creating new ones**
2. Every async action = proper loading UI
3. Every empty list = `<EmptyState />` component
4. Every error = `<ErrorState />` component
5. Every page uses `<PageWrapper>` for consistent padding
6. Never duplicate UI — extract to components

---

## Form Rules

- Always use `React Hook Form` + `Zod`
- Never use raw `<input>` directly in pages — use form components from `components/forms/`
- Validation schemas go in `utils/validators.js` (shared) or colocated in the feature folder
- Always provide accessible labels, error messages, and aria attributes

---

## Routing Rules

- All pages must be `React.lazy()` wrapped
- All lazy pages need `<Suspense fallback={<PageLoader />}>`
- Route strings come from `constants/routes.js`
- Role-restricted routes use `<RoleGuard allowedRoles={[...]}>`

---

## API / Service Rules

```js
// services/assetService.js pattern:
import api from './api'

const assetService = {
  getAll:  (params) => api.get('/assets', { params }).then(r => r.data),
  getById: (id)     => api.get(`/assets/${id}`).then(r => r.data),
  create:  (data)   => api.post('/assets', data).then(r => r.data),
  update:  (id, data) => api.put(`/assets/${id}`, data).then(r => r.data),
  remove:  (id)     => api.delete(`/assets/${id}`).then(r => r.data),
}

export default assetService
```

---

## Socket Rules

```js
// Initialize once in AppLayout:
useSocketInit(token)

// Subscribe in components:
useSocketEvent(SOCKET_EVENTS.ASSET_STATUS_CHANGED, (data) => {
  // handle event
})
```

---

## Styling Rules

- Use `cn()` from `lib/utils.js` for conditional classes
- Design tokens are in `styles/index.css` as CSS custom properties
- Semantic variables: `--bg-card`, `--text-primary`, `--border-default`, etc.
- Dark mode: add `dark:` Tailwind variants
- No inline styles — use Tailwind + CSS custom properties

---

## Reusable Components Checklist (to be built)

| Component | Location | Status |
|---|---|---|
| PageHeader | components/common | 🔲 TODO |
| SectionHeader | components/common | 🔲 TODO |
| StatsCard | components/cards | 🔲 TODO |
| InfoCard | components/cards | 🔲 TODO |
| StatusBadge | components/status | 🔲 TODO |
| SearchBar | components/filters | 🔲 TODO |
| FilterBar | components/filters | 🔲 TODO |
| DataTable | components/tables | 🔲 TODO |
| ConfirmDialog | components/dialogs | 🔲 TODO |
| DeleteDialog | components/dialogs | 🔲 TODO |
| EmptyState | components/empty | 🔲 TODO |
| ErrorState | components/empty | 🔲 TODO |
| PageLoader | components/loaders | ✅ Done |
| GlobalLoader | components/loaders | ✅ Done |
| ButtonLoader | components/loaders | 🔲 TODO |
| TableLoader | components/loaders | 🔲 TODO |
| ErrorBoundary | components/common | ✅ Done |
| Pagination | components/tables | 🔲 TODO |
| Avatar | components/common | 🔲 TODO |
| FileUploader | components/forms | 🔲 TODO |
| QRGenerator | components/common | 🔲 TODO |
| ActionDropdown | components/common | 🔲 TODO |
