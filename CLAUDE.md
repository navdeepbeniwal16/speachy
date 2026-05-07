# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Client (React)
```bash
cd client && npm start        # Dev server on :3000
cd client && npm test         # Run Jest tests (watch mode)
cd client && npm run build    # Production build + Sentry sourcemap upload
```

### Server (Node.js/Express)
```bash
cd server && node server.js          # Start server on :3000
cd server && npx nodemon server.js   # Dev mode with auto-reload
```

### Docker (Full Stack)
```bash
docker-compose -f docker-compose.dev.yml up    # Dev environment
docker-compose -f docker-compose.prod.yml up   # Prod environment
```

In production/Docker, the Express server serves the React build statically and handles API routes.

## Architecture Overview

### Monorepo Structure
Two independent npm projects (`client/` and `server/`) with no shared workspace tooling. Client proxies API calls to backend in development (`"proxy": "http://localhost:3000"` in client/package.json).

### Auth Flow
1. Firebase Authentication (email/password) handles login on the client
2. `auth.onAuthStateChanged` in the `requireAuth(Component)` HOC (App.js) guards protected routes
3. `backendApiClient` (axios instance in `client/src/services/backendAPIClient.js`) auto-attaches the Firebase ID token as `Bearer <token>` on every request
4. `verifyToken` middleware in `server/server.js` verifies the token via Firebase Admin SDK before all protected Express routes
5. Admin-only routes additionally use `requireAdmin(Component)` HOC — checks Firebase Custom Claim `admin: true` (set via `node server/scripts/set-admin-claim.js <uid>`)

### API & Service Layer
- All API calls go through `backendApiClient` — never use raw axios or fetch
- Client-side service classes in `client/src/services/*.js` contain static async methods wrapping `backendApiClient`
- Server routes in `server/routes/` are protected by `verifyToken` except `/payments` (Stripe webhooks need raw body)
- The Stripe webhook route at `/payments/webhook` has special body-parser bypass logic in server.js

### State Management
No Redux. Uses React Context (`client/src/components/AppContext.js`) for:
- Global snackbar/toast notifications via `showSnackbar(type, message)`
- Feature flags (`isInterviewPracticeEnabled`, `isImpromptuSpeakingEnabled`)

Global API errors are automatically shown as snackbars via an interceptor registered in AppContext.

### Firebase Admin SDK
Service account is stored as a base64-encoded JSON string in `FB_DEV_BASE64_ENCODED_SERVICE_ACCOUNT` env var. Decoded in `server/configs/firebase-admin.js`. Always call `admin.auth(firebaseAdminApp)` — pass the app instance explicitly.

## Design Tokens
Use these consistently for all new UI components:
```
PAGE_BG:        #fff4ef
SURFACE_BG:     #ffffff
PRIMARY:        #FA735B
SURFACE_BORDER: 1px solid rgba(252,150,120,0.12)
SURFACE_SHADOW: 0 18px 36px rgba(252,150,120,0.15)
HEADING_COLOR:  #2f170f
BODY_COLOR:     rgba(60,32,25,0.78)
MUTED_COLOR:    rgba(60,32,25,0.45)
```

## Key Conventions
- Protected route HOC: wrap components with `requireAuth(Component)` in App.js
- Logging on the server: use Winston logger (see any route file for the pattern), not `console.log`
- Sentry is only initialized client-side in production (`REACT_APP_ENV === 'production'`)
- CI/CD: `development` branch deploys to `navdeep16/speachy:dev`; `main` branch deploys to `navdeep16/speachy:prod` via GitHub Actions
