# Audit Module API Documentation

This document covers the workflow and frontend API endpoints for the **Audit** module. This module allows organizations to perform regular physical inventory checks (e.g., Q3 IT Equipment Audit) and reconcile them with the system's database.

---

## Concept & Flow

1. **Create Audit Cycle**: An administrator creates a new audit cycle with a specific scope (e.g., all assets in the "London Office", or all assets in the "Engineering" department). They also assign specific auditors (users) to this cycle.
2. **List Audits**: Users can view ongoing or past audit cycles.
3. **Mark Audit Item (Scanning)**: During the active audit period, an auditor physically locates an asset (e.g., by scanning a QR code) and marks its status (e.g., `VERIFIED`, `MISSING`, `DAMAGED`) in the system via the `/items` endpoint.
4. **Discrepancy Report**: At any point, admins can pull a report comparing the system's expected inventory in the audit scope vs. what was actually found.
5. **Close Audit Cycle**: Once the audit is complete, the admin closes it. This automatically updates the system state (e.g., marking assets that were not found as `LOST`).

---

## Endpoints

### 1. Create a New Audit Cycle
Initializes a new audit, defining its timeline, scope, and assigned auditors.
- **URL**: `POST /audits`
- **Auth Required**: Yes (`ADMIN`, `ASSET_MANAGER` only)
- **Request Body**:
  ```json
  {
    "name": "Q3 IT Equipment Audit",
    "scopeDepartmentId": "dept-uuid", // Optional
    "scopeLocation": "London Office", // Optional
    "startDate": "2024-10-01T00:00:00Z",
    "endDate": "2024-10-15T00:00:00Z",
    "auditorIds": ["auditor-uuid-1", "auditor-uuid-2"]
  }
  ```

### 2. List All Audit Cycles
Fetches a list of audits. Useful for the "Audit Management" dashboard.
- **URL**: `GET /audits`
- **Auth Required**: Yes (Any Role)
- **Response**: Array of Audit Cycle objects.

### 3. Mark an Asset (Perform Audit)
Called when an auditor scans or verifies an asset.
- **URL**: `POST /audits/:id/items`
- **Auth Required**: Yes (Any Role, but technically restricted to assigned auditors usually)
- **URL Parameters**: 
  - `id`: The UUID of the *Audit Cycle*
- **Request Body**:
  ```json
  {
    "assetId": "asset-uuid",
    "status": "VERIFIED", // Options: VERIFIED, MISSING, DAMAGED
    "notes": "Screen has a minor scratch." // Optional
  }
  ```

### 4. Get Discrepancy Report
Retrieves a report highlighting missing, damaged, or unexpected assets found during this cycle.
- **URL**: `GET /audits/:id/discrepancies`
- **Auth Required**: Yes (`ADMIN`, `ASSET_MANAGER`, `DEPT_HEAD` only)
- **URL Parameters**: 
  - `id`: The UUID of the *Audit Cycle*
- **Response**: Details of expected assets vs. scanned assets.

### 5. Close Audit Cycle
Finalizes the audit and reconciles the main asset database (e.g., missing assets are marked as LOST).
- **URL**: `POST /audits/:id/close`
- **Auth Required**: Yes (`ADMIN`, `ASSET_MANAGER` only)
- **URL Parameters**: 
  - `id`: The UUID of the *Audit Cycle*
- **Response**: Confirmation of closure and reconciliation.
