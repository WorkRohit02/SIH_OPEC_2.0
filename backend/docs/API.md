# COLOR-SAFE — REST API Documentation

**COLOR-SAFE**: Smartphone-Assisted Colorimetric Field Drug Testing Backend API  
**Base URL**: `http://localhost:5000/api`  
**Authentication**: Bearer Token (`Authorization: Bearer <JWT_TOKEN>`)

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register User
- **POST** `/auth/register`
- **Auth**: None
- **Request Body**:
  ```json
  {
    "name": "Inspector John Doe",
    "email": "john.doe@forensics.gov.in",
    "password": "SecurePassword123",
    "organization": "Narcotics Control Bureau",
    "phone": "+91 9876543210",
    "role": "OFFICER"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "66f7f...",
        "operatorId": "OFF-2026-0001",
        "name": "Inspector John Doe",
        "email": "john.doe@forensics.gov.in",
        "organization": "Narcotics Control Bureau",
        "role": "OFFICER"
      },
      "accessToken": "eyJhbG...",
      "refreshToken": "eyJhbG..."
    }
  }
  ```

### 1.2 Login User
- **POST** `/auth/login`
- **Auth**: None
- **Request Body**:
  ```json
  {
    "email": "john.doe@forensics.gov.in",
    "password": "SecurePassword123"
  }
  ```
- **Response (200 OK)**: Standard login token response.

### 1.3 Get Current User Identity
- **GET** `/auth/me`
- **Auth**: Bearer Token
- **Response (200 OK)**: Returns authenticated operator details.

---

## 2. Test Profiles (`/api/test-profiles`)

### 2.1 List Active Test Profiles
- **GET** `/test-profiles`
- **Auth**: Bearer Token
- **Response (200 OK)**: List of active test profile configurations (including `CP-01`).

### 2.2 Get Specific Profile
- **GET** `/test-profiles/:profileCode`
- **Auth**: Bearer Token

---

## 3. Field Tests (`/api/tests`)

### 3.1 Initiate Field Test
- **POST** `/tests`
- **Auth**: Bearer Token
- **Request Body**:
  ```json
  {
    "testProfileCode": "CP-01",
    "deviceId": "DEVICE-MOB-9942",
    "location": {
      "latitude": 28.6139,
      "longitude": 77.2090,
      "accuracy": 4.5
    }
  }
  ```
- **Response (201 Created)**: Returns test object with human-readable ID (`FT-2026-000001`).

### 3.2 List Field Tests
- **GET** `/tests?page=1&limit=10&status=COMPLETED&search=FT-2026`
- **Auth**: Bearer Token

### 3.3 Get Single Test Details
- **GET** `/tests/:id`
- **Auth**: Bearer Token (Verifies ownership or ADMIN role)

---

## 4. Captures & Media Upload (`/api/captures` or `/api/tests/:testId/captures`)

### 4.1 Upload Evidence Capture
- **POST** `/tests/:testId/captures`
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `image`: Media file (JPEG/PNG/WEBP)
  - `qualityChecks`: JSON String `{"blurPassed": true, "exposurePassed": true, "referenceCardDetected": true}`
- **Response (201 Created)**: Stores original image in ImageKit, records SHA-256 hash in MongoDB.

---

## 5. Color Analysis (`/api/analysis`)

### 5.1 Run Analysis & Generate Digital Record
- **POST** `/analysis/:captureId/analyse`
- **Auth**: Bearer Token
- **Request Body**:
  ```json
  {
    "testId": "66f7f...",
    "capturedSamples": {
      "testRegionRgb": { "r": 190, "g": 45, "b": 210 },
      "referencePatches": {
        "white": { "r": 250, "g": 250, "b": 250 }
      }
    }
  }
  ```
- **Response (200 OK)**:
  - Returns classification: `PRESUMPTIVE_POSITIVE`, `PRESUMPTIVE_NEGATIVE`, or `INCONCLUSIVE`.
  - Automatically builds canonical `DigitalRecord` with RSA Digital Signature.

---

## 6. PDF Report Generation (`/api/reports`)

### 6.1 Download Official Evidence PDF
- **GET** `/reports/:testId`
- **Auth**: Bearer Token
- **Response**: Binary `application/pdf` stream (`TestReport_FT-2026-000001.pdf`).

---

## 7. Evidence Verification (`/api/verification`)

### 7.1 Verify Record Cryptographic Integrity
- **GET** `/verification/:recordId`
- **Auth**: Optional / Public
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Digital record integrity successfully verified.",
    "data": {
      "verificationReport": {
        "status": "VALID",
        "checks": {
          "recordExists": true,
          "canonicalHashValid": true,
          "digitalSignatureValid": true,
          "imageHashValid": true
        },
        "disclaimer": "A valid digital hash and signature confirm that stored data has not been modified since creation."
      }
    }
  }
  ```

---

## 8. Offline Synchronization (`/api/sync`)

### 8.1 Batch Sync Offline Records
- **POST** `/sync`
- **Auth**: Bearer Token
- **Request Body**:
  ```json
  {
    "deviceId": "DEVICE-MOB-9942",
    "records": [
      {
        "localTestId": "FT-2026-OFFLINE-001",
        "testProfileCode": "CP-01",
        "status": "COMPLETED",
        "capture": { ... },
        "analysis": { ... },
        "digitalRecord": { ... }
      }
    ]
  }
  ```
- **Response (200 OK)**: Idempotent sync summary (`syncedCount`, `duplicateCount`, `failedCount`).
