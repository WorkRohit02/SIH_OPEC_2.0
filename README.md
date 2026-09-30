# OPEC — frontend prototype (v2.0)

v2.0: Guided Capture now records a real video clip. Every sampled frame is scored for sharpness and visible colour change; the best frame is selected, SHA-256 hashed and signed. The clip is hashed too.

React (Vite) + React Router, plain CSS tokens. No backend: everything in `src/mock/` is simulated.

## Run
    npm install
    npm run dev        # http://localhost:5173
    npm run build

Login accepts any non-empty ID and password.

## Demo switches
- Loading / empty / error states: append `?demo=loading|empty|error` on Evidence, Audit Trail and Help (or use the "Prototype state" chips at the bottom of each page).
- Failing capture checks: `/test/capture?fail=blur,lighting`
- Failed verification: verify record OPEC-2026-01463 (flagged as tampered).
- No camera? Guided Capture offers "Upload video clip" or "Run demo clip" (a synthetic clip with varying blur and colour).

## Logo
`public/logo-full.png` (login desktop hero) and `public/logo-mark.png` (header, login mobile, favicon), cut from your revised logo with the white background made transparent.
