# AssetFlow — Maintenance API Documentation

**Base URL:** `http://localhost:3000`  
**Interactive Docs (Swagger):** `http://localhost:3000/docs`  
**Content-Type:** `application/json`  
**Auth:** Bearer token in `Authorization` header required for **all** routes below.

---

## 🛠️ Complete Maintenance Lifecycle & Rules

The Maintenance module manages the repair process of an asset. It enforces strict business rules and automatically manages the Asset's overarching status based on the maintenance progress.

### Automatic Asset Status Transitions
- **When Approved**: The Asset's status is automatically changed to `UNDER_MAINTENANCE`.
- **When Resolved**: The Asset's status is automatically changed back to `AVAILABLE`.

### The State Machine (Maintenance Request Status)
1. **`PENDING`** (Initial state upon creation)
2. **`APPROVED`** or **`REJECTED`**
3. **`TECH_ASSIGNED`**
4. **`IN_PROGRESS`**
5. **`RESOLVED`**

> [!IMPORTANT]  
> Every state transition automatically creates a record in the `MaintenanceHistory` table, tracking who did what, when, and how it affected the asset.

---

## Endpoints

### 1. Raise a Maintenance Request
**`POST /maintenance`**
**Roles:** `ADMIN`, `ASSET_MANAGER`, `DEPT_HEAD`, `EMPLOYEE`

**Rule:** Unless you are an Admin/Asset Manager, you can **only** raise requests for assets currently allocated to you.

#### Request Body
```json
{
  "assetId": "uuid-of-asset",
  "issueDescription": "Screen flickering continuously.",
  "priority": "HIGH", // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  "photoUrl": "https://example.com/screen.jpg" // Optional
}
```

#### Response `201 CREATED`
Returns the created request object with status `PENDING`.

---

### 2. List Maintenance Requests
**`GET /maintenance`**
**Roles:** `ADMIN`, `ASSET_MANAGER`, `DEPT_HEAD`, `EMPLOYEE`

**Data Scoping:** Admins/Managers see all requests. Standard employees only see the requests they created.

#### Response `200 SUCCESS`
Returns an array of requests, including nested `asset` and `requestedBy` details.

---

### 3. View Specific Request & History
**`GET /maintenance/:id`**
**Roles:** `ADMIN`, `ASSET_MANAGER`, `DEPT_HEAD`, `EMPLOYEE`

#### Response `200 SUCCESS`
Returns the request details, the asset details, and the full chronologically-ordered `history` (Audit Trail) of state changes.

---

### 4. Approve Request
**`PATCH /maintenance/:id/approve`**
**Roles:** `ADMIN`, `ASSET_MANAGER`

Approves a `PENDING` request. This immediately sets the underlying Asset's status to `UNDER_MAINTENANCE`.

#### Request Body
```json
{
  "technicianName": "John Doe (IT Dept)" // Optional. If provided, skips APPROVED and goes straight to TECH_ASSIGNED
}
```

---

### 5. Reject Request
**`PATCH /maintenance/:id/reject`**
**Roles:** `ADMIN`, `ASSET_MANAGER`

Rejects a `PENDING` request.

#### Request Body
```json
{
  "reason": "Just a dirty keyboard, please clean it yourself."
}
```

---

### 6. Assign Technician
**`PATCH /maintenance/:id/assign-technician`**
**Roles:** `ADMIN`, `ASSET_MANAGER`

Assigns a technician to a request that has already been approved but not yet started.

#### Request Body
```json
{
  "technicianName": "Dell External Service Center"
}
```

---

### 7. Start Work (In Progress)
**`PATCH /maintenance/:id/start`**
**Roles:** `ADMIN`, `ASSET_MANAGER`

Marks the request as `IN_PROGRESS` indicating active repair work. 
*(No request body needed).*

---

### 8. Resolve Request
**`PATCH /maintenance/:id/resolve`**
**Roles:** `ADMIN`, `ASSET_MANAGER`

Marks the repair as completed (`RESOLVED`). This automatically changes the underlying Asset's status back to `AVAILABLE`.

#### Request Body
```json
{
  "resolutionNotes": "Replaced the LCD panel under warranty."
}
```
