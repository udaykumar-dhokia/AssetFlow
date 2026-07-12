# AssetFlow Frontend AI Context

## Project

Project Name: AssetFlow

This repository contains ONLY the frontend application.

Backend APIs, authentication, database and business logic are handled by another team.

Build this application as a modern production-grade Enterprise ERP frontend.

The final application should feel comparable to products like Odoo, Zoho, ERPNext, Atlassian, Notion and Linear.

This is NOT a demo application.

Everything should be modular, scalable and reusable.

---

# Technology Stack

Framework

- React 19
- Vite
- JavaScript (NOT TypeScript)

Styling

- Tailwind CSS
- shadcn/ui

Routing

- React Router DOM

State Management

- Redux Toolkit
- React Redux

Server State

- TanStack Query

HTTP Client

- Axios

Forms

- React Hook Form
- Zod
- @hookform/resolvers

Tables

- @tanstack/react-table

Charts

- Recharts

Icons

- Lucide React

Calendar

- FullCalendar

Realtime

- Socket.IO Client

Utilities

- DayJS
- clsx
- tailwind-merge
- qrcode.react

---

# Business Modules

Authentication

Dashboard

Organization Setup

Departments

Asset Categories

Employee Directory

Assets

Asset Allocation

Asset Transfers

Resource Booking

Maintenance

Audit

Reports

Notifications

Activity Logs

Profile

Settings

---

# User Roles

Admin

Asset Manager

Department Head

Employee

Support role-based routing and navigation.

---

# Architecture

Pages

↓

Reusable Components

↓

Hooks

↓

Services

↓

Axios

↓

Backend APIs

Never call axios directly inside pages.

---

# Folder Structure

src/

assets/

components/

    common/

    ui/

    forms/

    tables/

    charts/

    cards/

    dialogs/

    loaders/

    filters/

    status/

    empty/

layouts/

pages/

hooks/

redux/

services/

socket/

routes/

config/

constants/

utils/

styles/

lib/

---

# Reusable Component Rules

Always check whether a reusable component already exists before creating a new one.

Never duplicate UI.

Examples

PageHeader

SectionHeader

StatsCard

InfoCard

StatusBadge

SearchBar

Toolbar

FilterBar

Breadcrumbs

ConfirmDialog

DeleteDialog

Avatar

Pagination

EmptyState

ErrorState

NoData

FileUploader

QRGenerator

ActionDropdown

---

# Form Standards

Never use raw input components directly inside pages.

Always use reusable form components.

Examples

FormTextField

FormSelect

FormAutocomplete

FormTextarea

FormCheckbox

FormRadio

FormSwitch

FormDatePicker

FormFileUpload

FormRichTextEditor

All forms must use

React Hook Form

+

Zod

Maintain consistent validation, spacing, labels and error messages.

---

# Data Table Standards

Use TanStack React Table.

Create ONE reusable enterprise DataTable component.

Every module should reuse this component.

Support

- Pagination

- Sorting

- Global Search

- Column Filters

- Column Visibility

- Row Selection

- Sticky Header

- Loading Skeleton

- Empty State

- Responsive Layout

- Server-side Pagination

- Server-side Sorting

- Toolbar

- Status Badge Rendering

- Export Ready

Do not create multiple table implementations.

---

# Loading Standards

Every async action must display proper loading UI.

Create reusable loaders.

GlobalLoader

- App initialization

- Authentication checking

- Global blocking operations

PageLoader

- Suspense fallback

ButtonLoader

- Button API requests

TableLoader

CardLoader

FormLoader

SkeletonLoader

Loading should feel smooth and professional.

---

# React Standards

Use React.lazy() for every page.

Wrap lazy pages with Suspense.

Use PageLoader as Suspense fallback.

Use ErrorBoundary.

Avoid unnecessary re-renders.

Memoize expensive components when beneficial.

---

# API Standards

Create one reusable Axios instance.

Support

- Request Interceptors

- Response Interceptors

- Authorization Header

- Global Error Handling

- Refresh Token Support (if backend supports it)

Services should contain every API.

Pages must never call axios directly.

---

# Redux Standards

Redux stores only

Authentication

Logged User

Sidebar

Theme

Notifications

Socket Status

Global App State

Never store server API data inside Redux.

---

# TanStack Query Standards

Use TanStack Query for

Fetching

Caching

Pagination

Mutation

CRUD

Invalidation

Server State

---

# Socket Standards

socket/

index.js

events.js

socketService.js

Reusable socket implementation.

Use for

Notifications

Dashboard Updates

Live Events

---

# UI / UX Standards

Modern enterprise SaaS UI.

Professional.

Minimal.

Premium.

Responsive.

White-based interface.

Consistent spacing.

Professional typography.

Soft shadows.

Rounded corners.

Excellent table experience.

Professional forms.

Professional dialogs.

Professional empty states.

Professional error states.

Professional loading states.

Desktop-first.

Dark mode ready.

Avoid unnecessary animations.

---

# UI Reference Rules

The provided Excalidraw file is ONLY a reference for:

- Screen flow

- Navigation

- Business workflow

- Required pages

- Dialog flow

- Forms

- Tables

- Information hierarchy

Do NOT copy

- Colors

- Typography

- Icons

- Borders

- Card styles

- Button styles

- Visual styling

Instead create a modern premium enterprise UI while preserving the same functionality.

---

# AI Behaviour

Before generating code

Understand the complete project.

Think before creating files.

Always ask

Can this component be reusable?

Can this become a custom hook?

Can this become a utility?

Can this become a common component?

Can this logic be shared?

Never duplicate code.

Never duplicate UI.

Generate production-quality code.

Maintain consistency across the entire project.

Think like a senior frontend architect.

If the PDF or Excalidraw defines a workflow, preserve it.

Improve only

- UI quality

- User experience

- Component reusability

- Code quality

- Performance

Do not change business functionality without explicit instruction.