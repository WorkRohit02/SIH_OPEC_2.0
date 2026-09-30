# COLOR-SAFE — Smartphone-Assisted Colorimetric Field Drug Testing Backend API

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-v4.19-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](#)

**COLOR-SAFE** is a smartphone-assisted digital evidence and decision-support layer for colorimetric field-testing workflows developed for the **Smart India Hackathon (SIH)**.

> **IMPORTANT SCIENTIFIC DISCLAIMER**:
> This application is a presumptive field-testing/evidence system and does **NOT** replace laboratory confirmation.
> The system output is strictly classified as **PRESUMPTIVE POSITIVE**, **PRESUMPTIVE NEGATIVE**, or **INCONCLUSIVE**.
> All official reports and evidence records mandate **LABORATORY CONFIRMATION REQUIRED**.

---

## 1. Core Architecture & Workflow

```
[ Mobile Frontend (React Native) ]
              │
              ├── 1. Authentication (JWT / Officer Login)
              ├── 2. Initiate Field Test (Human-readable ID: FT-2026-XXXXXX)
              ├── 3. Upload Original Capture Evidence (ImageKit + SHA-256 Hash)
              ├── 4. Post Color Features (RGB / CIE-Lab / HSV)
              │
              ▼
[ COLOR-SAFE Express Backend ]
              │
              ├── 5. Calibration Service (Gain Transformation / Illumination Adaptation)
              ├── 6. Classification Service (Pluggable Rule / ML Model Interface)
              ├── 7. Canonical Record Generation (Deterministic JSON Canonicalization)
              ├── 8. SHA-256 Hashing (Original Evidence & Canonical Record Hash)
              ├── 9. Asymmetric Digital Signature (RSA-2048 Private Key Sign)
              ├── 10. PDF Report Generation (PDFKit with Legal Disclaimers)
              ├── 11. Integrity Verification Engine (Public Key & Hash Check)
              └── 12. Offline Batch Sync (Idempotent Record Resolution)
```

---

## 2. Directory Structure

```
backend/
├── config/
│   ├── db.js                 # Mongoose MongoDB connection
│   ├── env.js                # Centralized environment variable validation
│   └── imagekit.js           # ImageKit SDK initialization & fallback mode
├── controllers/
│   ├── auth.controller.js        # Auth actions (register, login, me, refresh)
│   ├── user.controller.js        # Officer profile management
│   ├── testProfile.controller.js # Colorimetric test profile management
│   ├── test.controller.js        # Field test lifecycle management
│   ├── capture.controller.js     # Evidence capture & attempt tracking
│   ├── analysis.controller.js    # Color analysis & record trigger
│   ├── report.controller.js      # PDF report generation & download
│   ├── verification.controller.js # Hash & signature verification
│   └── sync.controller.js        # Offline-first batch synchronization
├── models/
│   ├── User.js               # User accounts (OFFICER, ADMIN)
│   ├── TestProfile.js        # Test profile rules & thresholds
│   ├── CalibrationCard.js    # Color target reference patches
│   ├── Test.js               # Master field test document
│   ├── Capture.js            # Multi-attempt capture history & media refs
│   ├── Analysis.js           # Extracted features & classification output
│   ├── DigitalRecord.js      # Immutable canonical evidence record
│   ├── AuditLog.js           # Hash-chained sequential event log
│   └── ModelVersion.js       # ML/CV model version tracking
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── testProfile.routes.js
│   ├── test.routes.js
│   ├── capture.routes.js
│   ├── analysis.routes.js
│   ├── report.routes.js
│   ├── verification.routes.js
│   └── sync.routes.js
├── services/
│   ├── auth.service.js
│   ├── user.service.js
│   ├── testProfile.service.js
│   ├── test.service.js
│   ├── capture.service.js
│   ├── imagekit.service.js     # ImageKit media storage & SHA-256 calculation
│   ├── calibration.service.js  # Prototype calibration interface
│   ├── colour.service.js       # RGB, HSV, CIE-Lab, DeltaE utilities
│   ├── analysis.service.js     # Analysis pipeline orchestrator
│   ├── classification.service.js # Prototype classifier & presumptive rules
│   ├── hash.service.js         # SHA-256 buffer & object canonical hashing
│   ├── signature.service.js    # Asymmetric RSA-2048 digital signing
│   ├── record.service.js       # Canonical DigitalRecord builder
│   ├── report.service.js       # PDFKit report generator
│   ├── verification.service.js # Integrity & verification engine
│   ├── audit.service.js        # Immutable audit logger
│   └── sync.service.js         # Idempotent offline sync processor
├── middleware/
│   ├── auth.middleware.js      # JWT verification & identity injection
│   ├── role.middleware.js      # Role-Based Access Control (OFFICER, ADMIN)
│   ├── upload.middleware.js    # Multer file validation (types & sizes)
│   ├── validation.middleware.js # Express-validator payload validation
│   ├── error.middleware.js     # Centralized HTTP error handler
│   └── notFound.middleware.js  # 404 route handler
├── utils/
│   ├── generateTestId.js      # FT-YYYY-XXXXXX generator
│   ├── canonicalizeRecord.js  # Deterministic JSON serializer
│   ├── hash.js                # SHA-256 helper
│   ├── response.js            # Standardized API response wrappers
│   ├── validators.js          # Express-validator schema rules
│   └── constants.js           # Result enums & mandatory disclaimers
├── templates/
│   └── report/
│       └── reportTemplate.js  # Styling constants for PDFKit
├── docs/
│   └── API.md                 # Full REST API Documentation
├── tests/
│   └── backend.test.js        # Automated Jest test suite
├── app.js
├── server.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 3. Environment Setup (`.env`)

Copy `.env.example` to `.env` in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development

# MongoDB URI
MONGODB_URI=mongodb://127.0.0.1:27017/color_safe_db

# JWT Configuration
JWT_SECRET=super_secret_jwt_access_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=super_secret_jwt_refresh_key
JWT_REFRESH_EXPIRES_IN=30d

# ImageKit Credentials (Optional in local development; fallback mode active if missing)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

---

## 4. Quick Start & Local Execution

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Run Automated Tests
```bash
npm test
```

### Step 3: Start Server (Development Mode)
```bash
npm run dev
```

Server will start on `http://localhost:5000`. Test health status:
```bash
curl http://localhost:5000/api/health
```

---

## 5. Pluggable Computer Vision & ML Interfaces

The backend is explicitly designed **not** to tightly couple with a single CV/ML model. When the CV/ML team provides the computer vision code, update the following pluggable service modules without changing routes or controllers:

1. **`services/calibration.service.js`**: Update `calibrate(capturedSamples, calibrationCard)` with the target 3x3 transformation matrix or Bradford chromatic adaptation model.
2. **`services/classification.service.js`**: Update `classify(features, testProfile, modelVersion)` with the trained KNN, SVM, CNN, or edge-model output parser.
3. **`services/colour.service.js`**: Contains standardized conversions (`rgbToLab`, `rgbToHsv`, `calculateDeltaE76`).

---

## 6. React Native Frontend Integration Overview

The mobile application should call the APIs in this order:

1. **Login**: `POST /api/auth/login` → Store `accessToken` securely.
2. **Fetch Profiles**: `GET /api/test-profiles` → Select configured test profile (`CP-01`).
3. **Start Test**: `POST /api/tests` → Obtain human-readable `testId` (`FT-2026-000001`).
4. **Capture Evidence**: `POST /api/tests/:testId/captures` → Send image file as `multipart/form-data`.
5. **Run Analysis**: `POST /api/analysis/:captureId/analyse` → Send extracted RGB/Lab color features.
6. **Fetch PDF Report**: `GET /api/reports/:testId` → Download or preview PDF report.
7. **Verify Evidence**: `GET /api/verification/:recordId` → Display cryptographic integrity badge.
8. **Offline Sync**: When reconnecting to network, post pending offline tests to `POST /api/sync`.
