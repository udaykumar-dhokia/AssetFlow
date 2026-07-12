# AssetFlow

AssetFlow is a comprehensive, full-stack Enterprise Asset Management (EAM) system designed to track, manage, and audit organizational hardware and resources. It provides a centralized platform for IT and administration teams to manage the entire lifecycle of assets from procurement and allocation to maintenance, auditing, and retirement.

<div align="center">
  <img src="./frontend/public/1.png" width="45%" alt="Screenshot 1" style="margin: 10px;" />
  <img src="./frontend/public/2.png" width="45%" alt="Screenshot 2" style="margin: 10px;" />
  <br/>
  <img src="./frontend/public/3.png" width="45%" alt="Screenshot 3" style="margin: 10px;" />
  <img src="./frontend/public/4.png" width="45%" alt="Screenshot 4" style="margin: 10px;" />
  <br/>
  <img src="./frontend/public/5.png" width="45%" alt="Screenshot 5" style="margin: 10px;" />
  <img src="./frontend/public/6.png" width="45%" alt="Screenshot 6" style="margin: 10px;" />
  <br/>
  <img src="./frontend/public/7.png" width="45%" alt="Screenshot 7" style="margin: 10px;" />
  <img src="./frontend/public/8.png" width="45%" alt="Screenshot 8" style="margin: 10px;" />
  <br/>
  <img src="./frontend/public/9.png" width="45%" alt="Screenshot 9" style="margin: 10px;" />
  <img src="./frontend/public/10.png" width="45%" alt="Screenshot 10" style="margin: 10px;" />
</div>

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Gallery](#gallery)

## Architecture Overview

AssetFlow is built as a modern Single Page Application (SPA) communicating with a robust REST API.

- **Frontend**: A React application built with Vite. State is managed via Redux Toolkit (for global authentication state and live notifications) and TanStack React Query (for server state, data fetching, and caching). The UI is built using Tailwind CSS and shadcn/ui for consistent, accessible components.
- **Backend**: A NestJS application providing a strictly typed REST API. It uses Prisma as the ORM to interact with a PostgreSQL database.
- **Authentication**: JWT-based authentication. Users are assigned roles (ADMIN, ASSET_MANAGER, DEPT_HEAD, EMPLOYEE) which are enforced through route guards on the frontend and role-based guards on the backend.

## Key Features

1. **Asset Lifecycle Management**: Track assets through statuses such as AVAILABLE, ALLOCATED, RESERVED, UNDER_MAINTENANCE, LOST, and RETIRED.
2. **Organization Setup**: Manage departments, asset categories, and employee roles.
3. **Allocations & Transfers**: Assign assets to users or departments, request transfers between users, and track return history.
4. **Maintenance Module**: Raise, approve, assign, and resolve maintenance requests for damaged or malfunctioning assets.
5. **Resource Bookings**: Temporarily reserve shared resources (like projectors or meeting rooms) with strict time-conflict validation.
6. **Auditing**: Create audit cycles with defined scopes (by department or location), assign auditors, physically mark assets as verified, and generate discrepancy reports for implicitly missing items.
7. **Activity Logs & Notifications**: System-wide immutable activity logs (audit trails) for administrators, and real-time user-specific notifications for important events.

## Technology Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- shadcn/ui (Radix UI primitives)
- React Router DOM
- TanStack React Query v5
- Redux Toolkit
- React Hook Form + Zod (Validation)
- Lucide React (Icons)
- Day.js (Date formatting)

### Backend

- Node.js
- NestJS (Express under the hood)
- Prisma ORM
- PostgreSQL
- JSON Web Tokens (JWT) for Auth

## Project Structure

```text
AssetFlow/
├── frontend/
│   ├── public/              # Static assets and demo photos
│   ├── src/
│   │   ├── components/      # Shared UI components (shadcn, form wrappers)
│   │   ├── constants/       # Global constants (Roles, Statuses)
│   │   ├── hooks/           # Custom React Query hooks
│   │   ├── layouts/         # Layout components (Dashboard Layout, Page Wrapper)
│   │   ├── pages/           # Route-level components grouped by feature
│   │   ├── redux/           # Redux slices and store
│   │   ├── services/        # Axios API service calls
│   │   └── lib/             # Utility functions
│   └── vite.config.js
│
└── backend/
    ├── prisma/              # Prisma schema and migrations
    ├── src/
    │   ├── activity-log/    # Global audit trail module
    │   ├── allocation/      # Asset assignments and transfers
    │   ├── asset/           # Core asset CRUD
    │   ├── audit/           # Audit cycle management
    │   ├── auth/            # JWT Authentication and roles
    │   ├── booking/         # Resource reservations
    │   ├── dashboard/       # Aggregated stats and metrics
    │   ├── maintenance/     # Asset repair and maintenance
    │   ├── notification/    # User alerts
    │   ├── org/             # Departments, categories, employees
    │   ├── shared/          # Prisma service and utilities
    │   └── main.ts          # Application entry point
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL database running locally or remotely

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables (see Environment Variables section).
4. Run Prisma migrations to generate the database schema:
   ```bash
   npx prisma migrate dev
   ```
5. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```
6. Start the development server:
   ```bash
   npm run start:dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables.
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (`backend/.env`)

```env
# Database connection string
DATABASE_URL="postgresql://user:password@localhost:5432/assetflow?schema=public"

# JWT Secret for authentication
JWT_SECRET="your_super_secret_key_here"
```

### Frontend (`frontend/.env`)

```env
# Base URL for the backend API
VITE_API_BASE_URL="http://localhost:3000/api"
```

## Database Schema

The core models in the Prisma schema include:

- **User**: System users categorized by Role (ADMIN, ASSET_MANAGER, DEPT_HEAD, EMPLOYEE).
- **Department**: Organizational units.
- **AssetCategory**: Classifications for assets (e.g., Laptops, Furniture).
- **Asset**: The core entity representing physical hardware.
- **AssetAllocation**: Tracking assignments of assets to users or departments.
- **MaintenanceRequest**: Tracking repair workflows.
- **Booking**: Temporary reservations of shared assets.
- **AuditCycle & AuditItem**: Models for performing physical inventory checks.
- **ActivityLog**: Immutable records of system changes.
- **Notification**: Alerts intended for specific users.
