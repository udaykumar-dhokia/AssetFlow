# AssetFlow Frontend — Component Registry

> **AI INSTRUCTION**: Before creating any new component, check this file.
> If a component already exists, reuse it. Never duplicate UI.
> Update this file every time a new reusable component is created.

---

## Component Categories

### Loaders (`components/loaders/`)

| Component | File | Props | Usage |
|---|---|---|---|
| GlobalLoader | GlobalLoader.jsx | `message?` | App init, auth check |
| PageLoader | PageLoader.jsx | `message?` | Suspense fallback |
| ButtonLoader | _TODO_ | — | Button API calls |
| TableLoader | _TODO_ | — | Table skeleton |
| FormLoader | _TODO_ | — | Form skeleton |
| SkeletonLoader | _TODO_ | `count?, className?` | Generic skeleton |

---

### Common (`components/common/`)

| Component | File | Props | Usage |
|---|---|---|---|
| ErrorBoundary | ErrorBoundary.jsx | `fallback?, children` | Wrap page trees |
| PageHeader | _TODO_ | `title, subtitle?, actions?` | Page top section |
| SectionHeader | _TODO_ | `title, action?` | Card/section headings |
| Avatar | _TODO_ | `name, size?, src?` | User avatars |
| Breadcrumbs | _TODO_ | `items` | Page breadcrumbs |
| ActionDropdown | _TODO_ | `actions` | Row action menus |
| QRGenerator | _TODO_ | `value, size?` | Asset QR codes |

---

### Forms (`components/forms/`)

| Component | File | Props | Usage |
|---|---|---|---|
| FormTextField | _TODO_ | `control, name, label, ...` | Text inputs |
| FormSelect | _TODO_ | `control, name, label, options` | Dropdowns |
| FormAutocomplete | _TODO_ | `control, name, label, options` | Search selects |
| FormTextarea | _TODO_ | `control, name, label` | Multi-line input |
| FormCheckbox | _TODO_ | `control, name, label` | Checkboxes |
| FormRadio | _TODO_ | `control, name, label, options` | Radio groups |
| FormSwitch | _TODO_ | `control, name, label` | Toggle switches |
| FormDatePicker | _TODO_ | `control, name, label` | Date/time pickers |
| FormFileUpload | _TODO_ | `control, name, accept, maxSize` | File uploads |
| FileUploader | _TODO_ | `onUpload, accept, maxSize` | Standalone uploader |

> All form components use `React Hook Form` control — never raw state.

---

### Tables (`components/tables/`)

| Component | File | Props | Usage |
|---|---|---|---|
| DataTable | _TODO_ | `columns, data, ...` | ALL data tables |
| Pagination | _TODO_ | `page, total, onChange` | Table pagination |

> Create ONE DataTable. Every module reuses it.

---

### Cards (`components/cards/`)

| Component | File | Props | Usage |
|---|---|---|---|
| StatsCard | _TODO_ | `title, value, icon?, trend?` | Dashboard stats |
| InfoCard | _TODO_ | `title, children` | Info panels |

---

### Dialogs (`components/dialogs/`)

| Component | File | Props | Usage |
|---|---|---|---|
| ConfirmDialog | _TODO_ | `open, onConfirm, onCancel, title, description` | Confirmation prompts |
| DeleteDialog | _TODO_ | `open, onConfirm, itemName` | Delete confirmation |

---

### Status (`components/status/`)

| Component | File | Props | Usage |
|---|---|---|---|
| StatusBadge | _TODO_ | `status` | Asset/booking status |

---

### Filters (`components/filters/`)

| Component | File | Props | Usage |
|---|---|---|---|
| SearchBar | _TODO_ | `value, onChange, placeholder?` | Table search |
| FilterBar | _TODO_ | `filters, onChange` | Column filters |
| Toolbar | _TODO_ | `children` | Table toolbar wrapper |

---

### Empty States (`components/empty/`)

| Component | File | Props | Usage |
|---|---|---|---|
| EmptyState | _TODO_ | `title, description?, action?` | Empty lists |
| ErrorState | _TODO_ | `message, onRetry?` | Query errors |
| NoData | _TODO_ | `message?` | No search results |

---

## shadcn/ui Components (`components/ui/`)

Install via `npx shadcn@latest add <component>` as needed.
Do not install all at once — add on demand.

| Component | When to Add |
|---|---|
| Button | When implementing forms |
| Input | When implementing forms |
| Select | When implementing forms |
| Dialog | When implementing dialogs |
| Popover | When implementing date picker |
| Calendar | For date picker |
| Badge | For status badges |
| Card | For card layouts |
| Separator | For visual dividers |
| Avatar | For user avatars |
| DropdownMenu | For action menus |
| Tabs | For tabbed layouts |
| Table | As DataTable base |
| Tooltip | For helper tooltips |
| Toast | Already using Sonner |
| Sheet | For slide-over panels |
| Command | For command palette |

---

## Creation Checklist

Before creating a new component, ask:
1. Does it already exist in this registry? → **Reuse it**
2. Is it used in more than one place? → **Make it reusable**
3. Does it have a clear, single responsibility? → **Yes, proceed**
4. Can it accept props to handle variations? → **Yes, avoid duplicates**
5. Should it go in `components/` or be colocated in the feature page? → **Shared: components/, feature-only: colocate**
