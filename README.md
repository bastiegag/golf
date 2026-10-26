# Golf

A portfolio-quality storefront foundation for learning modern full-stack Next.js. The current release focuses on a responsive storefront, server-rendered product catalogue, product categories, a persistent client-side shopping cart, simulated checkout with PostgreSQL orders, and a protected administrator dashboard. It intentionally does not include real payments or administration CRUD.

## Technology

- Next.js App Router, React Server Components, React, and strict TypeScript
- Tailwind CSS 4, shadcn/ui-compatible primitives, and Lucide icons
- PostgreSQL, Prisma 7, and Zod
- Vitest, React Testing Library, Playwright, and Storybook
- ESLint, Prettier, npm, and GitHub Actions

## Architecture

Pages and layout live in `src/app`. Reusable layout and UI components live in `src/components`; product presentation, queries, and schemas live in `src/features/products`. Product reads go directly through the server-only data-access layer in `src/features/products/queries`, and the Prisma client is isolated in `src/lib/db`.

The products route is a Server Component and stays dynamic so it reads the current catalogue at request time. Products belong to one of the seeded categories: Clothing, Accessories, or Stationery. The catalogue supports server-side filtering with `/products?category=clothing`, `/products?category=accessories`, and `/products?category=stationery`; `/products` shows all active products. The cart is managed in a dedicated React Context with a pure reducer and persisted as validated, versioned localStorage data. Cart prices use integer cents for calculations. Checkout uses a Server Action to re-fetch active products and authoritative Decimal prices, calculate integer-cent totals, and create an atomic Order/OrderItem transaction. Persisted cart data is untrusted and is never authoritative for order pricing. If `DATABASE_URL` is not configured, the query returns an empty catalogue so the storefront can still be previewed and built without a database. Prisma stores prices as PostgreSQL `Decimal`; formatting is centralized in the product feature.

## Local setup

Requirements: Node.js 22.12 or newer, npm, and PostgreSQL.

1. Install packages: `npm install`
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to your local PostgreSQL database.
3. Apply versioned migrations without resetting existing data: `npm run db:migrate`
4. Add or update the sample catalogue and categories: `npm run db:seed`
5. Start the development server: `npm run dev`

The storefront is available at [http://localhost:3000](http://localhost:3000). Without PostgreSQL configuration, the homepage and empty products state still work.

## Development commands

| Command                   | Description                                         |
| ------------------------- | --------------------------------------------------- |
| `npm run dev`             | Start the Next.js development server                |
| `npm run build`           | Generate Prisma Client and build the production app |
| `npm run start`           | Serve the production build                          |
| `npm run lint`            | Run ESLint                                          |
| `npm run typecheck`       | Check TypeScript                                    |
| `npm run format`          | Format supported source and config files            |
| `npm run format:check`    | Check formatting without changing files             |
| `npm run db:generate`     | Generate Prisma Client                              |
| `npm run db:migrate`      | Create and apply local Prisma migrations            |
| `npm run db:migrate:deploy` | Apply committed Prisma migrations without reset    |
| `npm run db:push`         | Push the Prisma schema; avoid this for shared data  |
| `npm run db:seed`         | Upsert the deterministic catalogue and categories   |
| `npm run test:integration` | Migrate, seed, and run PostgreSQL order integration tests against `E2E_DATABASE_URL` |
| `npm run admin:create`     | Provision one administrator interactively            |
| `npm run storybook`       | Start Storybook                                     |
| `npm run build-storybook` | Build Storybook                                     |

## Testing

- `npm run test:unit` runs Vitest and React Testing Library tests.
- `npm run test:e2e` applies committed migrations, seeds the deterministic catalogue, and runs the Playwright storefront and cart tests. It requires `E2E_DATABASE_URL` (preferred) or `DATABASE_URL` pointing to a dedicated test database, plus Chromium installed with `npx playwright install chromium`. Playwright preparation is explicit in `e2e/global-setup.ts` and runs even when a development server is reused.

Unit tests do not require a database or production credentials. Browser tests use the configured database only for deterministic migration and seed setup.

## Checkout and orders

Checkout is simulated: it does not process payments, taxes, or shipping charges. Submitting checkout creates a `CONFIRMED` `Order` and its `OrderItem` snapshots in PostgreSQL inside one Prisma transaction. The server compares the submitted accepted total with freshly read database prices before creating the order, so stale checkout totals are rejected. Each request also stores a SHA-256 fingerprint of the normalized checkout fields, cart, and accepted total. A retry with the same idempotency key and fingerprint returns the existing order; reusing a key for different details is rejected without exposing the existing confirmation token. Order items retain product names, slugs, unit prices, quantities, and line totals as historical snapshots.

Product deletion is restricted when an order item references it. This preserves the product relation while the snapshots preserve historical display data if the product is later changed. Confirmation pages require both the human-readable order number and a random confirmation token; the order number alone is not sufficient access.

Use `E2E_DATABASE_URL` for a dedicated checkout test database when running `npm run test:e2e`. Playwright applies committed migrations and runs the idempotent seed in [e2e/global-setup.ts](./e2e/global-setup.ts) before tests, including when a development server is reused.

The PostgreSQL integration suite uses the same explicit preparation flow:
`E2E_DATABASE_URL=postgresql://... npm run test:integration`. Use a disposable or dedicated test database; the suite removes only orders whose idempotency keys were generated by the integration run. It covers authoritative totals, persisted snapshots, stale-price rejection, idempotent retries, and concurrent same-key submissions. Never point either E2E or integration commands at a production database.

## Administrator authentication

Administrator authentication uses Auth.js `next-auth@5.0.0-beta.32` with a Credentials provider. Passwords are hashed with Node's built-in scrypt implementation and stored only as password hashes in the `User` table. Auth.js uses encrypted, expiring JWT sessions in HTTP-only cookies; session tokens are never stored in localStorage. The protected `/admin` route group verifies the session and re-checks the active administrator in PostgreSQL through `requireAdmin()` before rendering or performing future server operations.

Set `AUTH_SECRET` in `.env` using `npx auth secret` (or another secure random-value generator). Apply the user migration with `npm run db:migrate`, then provision the first administrator locally with `npm run admin:create`. The command prompts for an email and hidden password input, rejects weak passwords, and never overwrites an existing account. `ADMIN_EMAIL` and `ADMIN_PASSWORD` may be supplied only for controlled local automation; do not commit them or use them in production logs.

There is no public registration flow. The login page is `/admin/login`; unauthenticated requests to other `/admin` paths are redirected there, and signed-in administrators are redirected to the dashboard when visiting the login page. Admin responses are dynamic, marked `no-store`, and sent with `noindex, nofollow` and `no-referrer` headers. The current limitation is that login-attempt rate limiting is deployment-specific and is not represented by an ineffective in-memory limiter; production deployment should add an edge or durable rate-limit service.

Authentication E2E and PostgreSQL integration tests also require `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, and `AUTH_SECRET`. The test setup creates the administrator only when it is absent and rejects mismatched existing credentials; it never silently changes an existing password.

## Planned MVP

1. Product catalogue, details, and categories
2. Shopping cart
3. Simulated checkout and order confirmation
4. Basic product administration

The initial foundation deliberately stops before those features.
