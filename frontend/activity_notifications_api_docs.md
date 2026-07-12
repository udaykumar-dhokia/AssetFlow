# Notifications & Activity Logs API Documentation

This document covers the workflow and API endpoints for the newly added Notifications and Activity Logs (Audit Trail) modules. These endpoints allow the frontend to fetch user-specific notifications and allow administrators to view the system-wide audit trail.

---

## Part 1: Notifications Module (For Users)

### Concept & Flow
- **Purpose**: Immediately alerts users when something happens that requires their attention (e.g., an asset is assigned, a maintenance request is approved, a booking is cancelled).
- **Behavior**: Notifications are personal (bound to `userId`). They can be marked as read.
- **Frontend Usage**: 
  - Poll or fetch `GET /notifications` on page load to show an unread badge (e.g., a bell icon with a red dot).
  - When the user clicks the bell, fetch `GET /notifications?unreadOnly=false` to show recent history.
  - Call `PATCH /notifications/:id/read` when a user clicks a specific notification.

### Endpoints

#### 1. Fetch User Notifications
Retrieves all notifications for the currently logged-in user.
- **URL**: `GET /notifications`
- **Auth Required**: Yes (Any Role)
- **Query Parameters**:
  - `unreadOnly` (boolean, optional): If `true`, returns only unread notifications.
- **Response**:
  ```json
  {
    "success": true,
    "message": "Notifications fetched successfully",
    "data": [
      {
        "id": "notif-uuid",
        "title": "Asset Assigned",
        "message": "A new asset has been assigned to you.",
        "type": "ASSET_ALLOCATED",
        "isRead": false,
        "relatedEntityType": "AssetAllocation",
        "relatedEntityId": "alloc-uuid",
        "createdAt": "2026-07-12T10:15:00.000Z"
      }
    ]
  }
  ```

#### 2. Mark Single Notification as Read
Marks a specific notification as read.
- **URL**: `PATCH /notifications/:id/read`
- **Auth Required**: Yes (Any Role)
- **URL Parameters**:
  - `id`: The UUID of the notification.
- **Response**:
  ```json
  {
    "success": true,
    "message": "Notification marked as read",
    "data": null
  }
  ```

#### 3. Mark All Notifications as Read
Utility endpoint to clear the user's unread badge.
- **URL**: `PATCH /notifications/read-all`
- **Auth Required**: Yes (Any Role)
- **Response**:
  ```json
  {
    "success": true,
    "message": "All notifications marked as read",
    "data": null
  }
  ```

---

## Part 2: Activity Logs Module (Audit Trail for Admins)

### Concept & Flow
- **Purpose**: Records a permanent, unmodifiable history of everything that happens in the system (e.g., who approved a laptop repair, who deleted a category, who reassigned an employee).
- **Behavior**: System-wide. Captures precise `old_data` and `new_data` in JSON format so administrators can see exactly what changed.
- **Frontend Usage**: 
  - Build an "Audit Logs" or "System History" screen in the Admin Dashboard.
  - Provide filters for admins to search by User ID, Action type, or Entity Type.

### Endpoints

#### 1. Fetch System Activity Logs
Retrieves the global audit trail.
- **URL**: `GET /activity-logs`
- **Auth Required**: Yes (`ADMIN`, `ASSET_MANAGER` only)
- **Query Parameters** (all optional for filtering):
  - `userId` (string): Filter logs by the user who performed the action.
  - `action` (string): Filter by action (e.g., `ASSET_CREATED`, `MAINTENANCE_APPROVED`).
  - `entityType` (string): Filter by the affected table (e.g., `User`, `Asset`, `MaintenanceRequest`).
- **Response**:
  ```json
  {
    "success": true,
    "message": "Activity logs fetched successfully",
    "data": [
      {
        "id": "log-uuid",
        "action": "MAINTENANCE_APPROVED",
        "entityType": "MaintenanceRequest",
        "entityId": "req-uuid",
        "details": {
          "old_data": {
            "status": "PENDING"
          },
          "new_data": {
            "status": "APPROVED"
          }
        },
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2026-07-12T10:20:00.000Z",
        "user": {
          "id": "admin-uuid",
          "name": "Admin John",
          "email": "admin@example.com"
        }
      }
    ]
  }
  ```

### Common Logged Actions
The following actions are automatically tracked by the backend and can be used in the `action` filter:
- **Organization**: `DEPARTMENT_CREATED`, `DEPARTMENT_UPDATED`, `DEPARTMENT_DEACTIVATED`, `CATEGORY_CREATED`, `CATEGORY_UPDATED`, `CATEGORY_DELETED`, `EMPLOYEE_UPDATED`
- **Assets & Allocation**: `ASSET_CREATED`, `ASSET_ALLOCATED`, `TRANSFER_REQUESTED`, `TRANSFER_APPROVED`, `ASSET_RETURNED`
- **Maintenance**: `MAINTENANCE_CREATED`, `MAINTENANCE_APPROVED`, `MAINTENANCE_REJECTED`, `MAINTENANCE_UPDATED`, `MAINTENANCE_RESOLVED`
- **Bookings**: `BOOKING_CREATED`, `BOOKING_CANCELLED`, `BOOKING_UPDATED`
