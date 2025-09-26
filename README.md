# HireFlow — Recruitment Prototype (Next.js + TypeScript + Tailwind v4 + Prisma + Postgres)

1. Setup instructions
2. API documentation and database schema
3. Short explanation covering:
   - Architectural choices
   - Authentication & security measures
   - Error-handling approach
   - Suggestions for scaling / improving the system

---

## 1) Quick overview

HireFlow is a small recruitment platform prototype that demonstrates:

- Register / Login with JWT (cookie-only) and logout
- Minimal user profile page (Next.js App Router + React)
- Prisma ORM with Postgres for persistence
- Tailwind v4 CSS-first UI (no `tailwind.config.*` required)
- Server-side cookie-based authentication (HttpOnly cookie)
- Simple, clear API design and validation using Zod

---

## 2) Prerequisites

- Node.js v18+ (LTS recommended)
- npm (or pnpm/yarn)
- PostgreSQL running and accessible

---

## 3) Files included (important project files)

```
/app
  /api/auth/register/route.ts
  /api/auth/login/route.ts
  /api/auth/me/route.ts
  /api/auth/logout/route.ts
  /(auth)/register/page.tsx
  /(auth)/login/page.tsx
  /page.tsx (profile)
  /globals.css (Tailwind v4 CSS-first)
/app/components
  Navbar.tsx, Card.tsx, Input.tsx, Button.tsx
/lib
  /prisma.ts
  /hash.ts
  /jwt.ts
/prisma/schema.prisma
/package.json
/README.md ← (this file)
.env.example
```

---

## 4) Environment variables

Copy `.env.example` to `.env` and set values:

```bash
cp .env.example .env
# Edit .env:
DATABASE_URL=postgresql://postgres:password@localhost:5432/recruitment_db?schema=public
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=3600s
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

**Important:** Use a long random SECRET in production (store in secrets manager).

---

## 5) Setup & run (complete)

1. Install dependencies:

```bash
npm install
# or pnpm install / yarn install
```

2. Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

3. Run the development server:

```bash
npm run dev
# open http://localhost:3000
```

4. Test the flow:

- Register: `http://localhost:3000/register`
- Login: `http://localhost:3000/login`
- Home/profile: `http://localhost:3000`

Notes:

- The login endpoint sets an **HttpOnly cookie** `token`. The app uses cookie-only auth — **no** `localStorage` token usage.
- Logout calls `POST /api/auth/logout` which clears the HttpOnly cookie on the server.

---

## 6) PostCSS / Tailwind v4 notes

This project uses Tailwind v4 CSS-first approach. Theme tokens are defined inside `app/globals.css` with `@theme` and Tailwind built via `@tailwindcss/postcss` plugin defined in `postcss.config.mjs`. No `tailwind.config.js` is required, but you may still add one if you want plugin logic or JS-based configs.

---

## 7) Database schema (Prisma)

`prisma/schema.prisma` (model):

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  bio       String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

- Password stores **bcrypt-hashed** value only.
- `email` is unique; timestamps added for auditing.

---

## 8) API documentation (endpoints, request/response examples)

All routes are under `/api/auth/*` (Next.js App Router route handlers). API returns JSON and uses HTTP status codes to indicate errors.

### `POST /api/auth/register`

- Purpose: register a new user
- Request body (JSON):

```json
{ "email": "user@example.com", "password": "strongpass", "name": "Alice" }
```

- Success response: `201`

```json
{ "user": { "id": "...", "email": "...", "name": "...", "createdAt": "..." } }
```

- Errors:
  - `409` — Email already in use
  - `422` — Validation errors (Zod issues)
  - `500` — Server error

### `POST /api/auth/login`

- Purpose: authenticate user and set HttpOnly cookie
- Request body (JSON):

```json
{ "email": "user@example.com", "password": "strongpass" }
```

- Success response: `200` — returns minimal user + server sets cookie `token` (HttpOnly)

```json
{ "token": "<jwt>", "user": { "id": "...", "email": "...", "name": "..." } }
```

> Note: The `token` is returned in response for API clients, but the browser relies on the HttpOnly cookie for authentication. The app **does not** store token in `localStorage`.

- Errors:
  - `401` — Invalid credentials
  - `422` — Validation errors
  - `500` — Server error

### `GET /api/auth/me`

- Purpose: return current authenticated user
- Auth: reads cookie `token` or `Authorization: Bearer <token>` header (fallback)
- Success: `200`

```json
{ "user": { "id": "...", "email": "...", "name": "...", "bio": "..." } }
```

- Errors:
  - `401` — Unauthorized (missing/invalid token)
  - `404` — User not found

### `POST /api/auth/logout`

- Purpose: clear server cookie and logout
- No request body required
- Server clears cookie `token` by setting cookie with `maxAge: 0`
- Success: `200` `{ "ok": true, "message": "Logged out" }`

---

## 9) Example curl commands

Register:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test"}'
```

Login (store cookies in cookies.txt):

```bash
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Get current user (using saved cookie):

```bash
curl -b cookies.txt http://localhost:3000/api/auth/me
```

Logout (clears cookie on server):

```bash
curl -b cookies.txt -X POST http://localhost:3000/api/auth/logout
```

(If using JS `fetch` in the app, use `credentials: 'include'` for cross-origin cookie sending — in same-origin setups it's usually not needed but explicit is safe.)

---

## 10) Short written explanation

### Architectural choices

- **Monorepo with Next.js App Router**: Frontend and API live together, allowing shared types, helpers, and fast iteration. App Router route handlers simplify server code placement next to UI.
- **Prisma + Postgres**: Prisma provides type-safe DB access and quick developer ergonomics; Postgres is reliable for relational user data and migrations.
- **Tailwind v4 CSS-first**: Easier single-file theme management (via `@theme`), fewer config files for prototypes.
- **Cookie-only auth**: HttpOnly cookie for session tokens (JWT) to reduce JS surface area and mitigate token theft via XSS for browser users.

### Authentication & security measures

- **Passwords**: hashed with `bcrypt` (salt + work factor). Only hash stored on DB.
- **JWT**: signed with `JWT_SECRET`; expirations configured via `JWT_EXPIRES_IN`.
- **HttpOnly cookie**: token stored in HttpOnly cookie named `token` and `secure` flag used in production; app uses cookie for authentication automatically.
- **Validation**: `zod` validates inputs and returns structured 422 errors.
- **Logout**: server clears cookie (maxAge 0) — works across tabs when cookie invalidated.
- **Production notes**: use HTTPS, rotate secrets, store secrets in secret manager, add refresh tokens + rotation + revocation store (Redis/DB), add rate-limiting and account lockouts to protect from brute-force attacks.

### Error-handling approach

- **Validation errors (422)**: use Zod to return `issues` to clients for user-friendly messages.
- **Auth errors (401)**: returned for invalid credentials or missing/invalid token.
- **Conflict (409)**: returned when registration attempts to reuse an existing email.
- **Server errors (500)**: unexpected errors logged server-side; generic `Server error` returned to client.
- **Frontend handling**: client checks response status and `error` field; displays friendly messages and fallback UI for unauthenticated users.

### Suggestions for scaling & improvements

- **Auth**: implement short-lived access tokens + refresh tokens (refresh stored as HttpOnly cookie). Use rotating refresh tokens and a revocation list stored in Redis/DB.
- **DB scaling**: use managed Postgres (RDS/Cloud SQL), connection pooling (PgBouncer), read replicas for heavy read traffic. Apply indexing for queries (e.g., email index already unique).
- **API scaling**: separate backend into services or serverless functions; containerize (Docker) and orchestrate with Kubernetes / managed services; add load balancer + autoscaling.
- **Caching & CDN**: cache static assets on CDN; use Redis for session/cache and rate-limiting counters.
- **Security hardening**: CSP, HSTS, proper CORS, CSRF protection (double-submit token for cookie-based POST endpoints), vulnerability scanning and regular pentests.
- **Observability**: structured logs, metrics (Prometheus), tracing (OpenTelemetry), error tracking (Sentry).
- **CI/CD & testing**: add automated tests (unit/integration), database migration checks, and automated deployments with secrets management.

---
