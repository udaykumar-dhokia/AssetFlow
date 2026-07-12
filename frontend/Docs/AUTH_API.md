
## Auth Flow Overview

```
Signup ──► Verify Email (OTP) ──► Login (password)
                                └──► Login (OTP)
                                
Forgot Password ──► Reset Password (OTP + new password)
```

---

## Endpoints

### 1. Signup

**`POST /auth/signup`**

Register a new user. Sends a 6-digit OTP to their email for verification.

#### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPass@123",
  "role": "EMPLOYEE"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ | Full name |
| `email` | string | ✅ | Must be a valid email, unique |
| `password` | string | ✅ | Minimum 8 characters |
| `role` | enum | ✅ | `ADMIN` \| `ASSET_MANAGER` \| `DEPT_HEAD` \| `EMPLOYEE` |

#### Response `201`
```json
{
  "status": true,
  "code": "CREATED",
  "message": "Account created. Check your email for the verification OTP.",
  "data": {
    "email": "john@example.com"
  }
}
```

#### Errors
| HTTP | code | When |
|---|---|---|
| 409 | `CONFLICT` | Email already registered |

---

### 2. Verify Email

**`POST /auth/verify-email`**

Submit the 6-digit OTP sent after signup. Returns a JWT on success — user is now logged in.

> OTP expires in **10 minutes**.

#### Request Body
```json
{
  "email": "john@example.com",
  "otp": "482910"
}
```

| Field | Type | Required |
|---|---|---|
| `email` | string | ✅ |
| `otp` | string (6 digits) | ✅ |

#### Response `200`
```json
{
  "status": true,
  "code": "SUCCESS",
  "message": "Email verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR...",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "EMPLOYEE"
    }
  }
}
```

#### Errors
| HTTP | When |
|---|---|
| 400 | Invalid OTP |
| 400 | OTP has expired |
| 400 | Email already verified |
| 404 | User not found |

---

### 3. Login (Password)

**`POST /auth/login`**

Login with email and password. User must have verified their email.

#### Request Body
```json
{
  "email": "john@example.com",
  "password": "StrongPass@123"
}
```

#### Response `200`
```json
{
  "status": true,
  "code": "SUCCESS",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR...",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "EMPLOYEE"
    }
  }
}
```

#### Errors
| HTTP | When |
|---|---|
| 401 | Invalid email or password |
| 401 | Email not verified yet |

---

### 4. Request Login OTP

**`POST /auth/login-otp/request`**

Send a 6-digit OTP to the user's email for passwordless login. User must be verified.

> OTP expires in **5 minutes**.

#### Request Body
```json
{
  "email": "john@example.com"
}
```

#### Response `200`
```json
{
  "status": true,
  "code": "SUCCESS",
  "message": "OTP sent to your email",
  "data": {
    "email": "john@example.com"
  }
}
```

#### Errors
| HTTP | When |
|---|---|
| 401 | Email not verified |
| 404 | User not found |

---

### 5. Verify Login OTP

**`POST /auth/login-otp/verify`**

Submit the OTP received from `/auth/login-otp/request`. Returns a JWT on success.

#### Request Body
```json
{
  "email": "john@example.com",
  "otp": "738291"
}
```

#### Response `200`
```json
{
  "status": true,
  "code": "SUCCESS",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR...",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "EMPLOYEE"
    }
  }
}
```

#### Errors
| HTTP | When |
|---|---|
| 400 | Invalid OTP |
| 400 | OTP has expired |
| 404 | User not found |

---

### 6. Forgot Password

**`POST /auth/forgot-password`**

Send a 6-digit OTP to the user's email for password reset.

> OTP expires in **15 minutes**.

#### Request Body
```json
{
  "email": "john@example.com"
}
```

#### Response `200`
```json
{
  "status": true,
  "code": "SUCCESS",
  "message": "Password reset OTP sent to your email",
  "data": {
    "email": "john@example.com"
  }
}
```

#### Errors
| HTTP | When |
|---|---|
| 404 | User not found |

---

### 7. Reset Password

**`POST /auth/reset-password`**

Submit the OTP from `/auth/forgot-password` along with the new password.

#### Request Body
```json
{
  "email": "john@example.com",
  "otp": "192847",
  "newPassword": "NewStrongPass@456"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `email` | string | ✅ | |
| `otp` | string (6 digits) | ✅ | From forgot-password email |
| `newPassword` | string | ✅ | Minimum 8 characters |

#### Response `200`
```json
{
  "status": true,
  "code": "SUCCESS",
  "message": "Password reset successfully",
  "data": null
}
```

#### Errors
| HTTP | When |
|---|---|
| 400 | Invalid OTP |
| 400 | OTP has expired |
| 404 | User not found |

---

## Using the JWT Token

Store the `token` from login/verify responses and send it as a Bearer token on protected routes:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR...
```

**Token payload:**
```json
{
  "sub": "user-uuid",
  "role": "EMPLOYEE",
  "iat": 1720000000,
  "exp": 1720604800
}
```

Token expires in **7 days** by default (`JWT_EXPIRES_IN` in `.env`).

---

## Role Values

| Role | Description |
|---|---|
| `ADMIN` | Full system access |
| `ASSET_MANAGER` | Manage assets and allocations |
| `DEPT_HEAD` | Department-level access |
| `EMPLOYEE` | Standard user |

---

## OTP Expiry Summary

| Flow | Expiry |
|---|---|
| Email Verification | 10 minutes |
| Login OTP | 5 minutes |
| Password Reset | 15 minutes |

> Each new OTP request invalidates the previous unused OTP for that flow.

---