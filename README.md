# Golf

A portfolio-quality storefront foundation for learning modern full-stack Next.js. The current release focuses on a responsive storefront, server-rendered product catalogue, category administration, a persistent client-side shopping cart, simulated checkout with PostgreSQL orders, and protected product and order administration.

## Technology

- Next.js App Router, React Server Components, React, and strict TypeScript
- Tailwind CSS 4, shadcn/ui-compatible primitives, and Lucide icons
- PostgreSQL, Prisma 7, and Zod
- Vitest, React Testing Library, Playwright, and Storybook
- ESLint, Prettier, npm, and GitHub Actions

## Architecture

Pages and layout live in `src/app`. Reusable layout and UI components live in `src/components`; product presentation, queries, and schemas live in `src/features/products`. Product reads go directly through the server-only data-access layer in `src/features/products/queries`, and the Prisma client is isolated in `src/lib/db`.

The products route is a Server Component and stays dynamic so it reads the current catalogue at request time. Products belong to one of the seeded categories: Clothing, Accessories, or Stationery. The catalogue supports server-side filtering with `/products?category=clothing`, `/products?category=accessories`, and `/products?category=stationery`; `/products` shows all active products. The cart is managed in a dedicated React Context with a pure reducer and persisted as validated, versioned localStorage data. Cart prices use integer cents for calculations. Checkout uses a Server Action to re-fetch active products and authoritative Decimal prices, calculate integer-cent totals, and create an atomic Order/OrderItem transaction. Persisted cart data is untrusted and is never authoritative for order pricing. If `DATABASE_URL` is not configured, the query returns an empty catalogue so the storefront can still be previewed and built without a database. Prisma stores prices as PostgreSQL `Decimal`; formatting is centralized in the product feature.

## Product administration

Administrators with an active `ADMIN` account can manage products at `/admin/products`, create products at `/admin/products/new`, and edit products at `/admin/products/[id]/edit`. The list includes active and inactive products with server-side search, status/category filters, and pagination. Product mutations use authenticated Server Actions, server-side Zod validation, unique slug handling, category relation checks, and Prisma Decimal prices. Activation/deactivation only changes storefront visibility; it never deletes products or changes historical orders. Order items retain their original name, slug, price, quantity, and totals when a product is edited.

Product images currently accept local paths such as `/products/placeholder.svg`; external image hosts and uploads are intentionally unsupported. Product forms select from existing categories; category creation and editing are handled in the category administration interface described below. The validation and authorization behavior is covered by the unit/integration test suites; run `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`, `npm run test:integration`, and `npm run test:e2e` for the full check. The remaining limitations are inventory, variants, uploads, and payment processing.

The product form uses one controlled typed state object, synchronized with the
React 19 Server Action response, so values remain editable after validation
errors. New product names suggest a normalized slug until the administrator
edits the slug; edit forms preserve existing slugs. The admin list uses
server-side offset pagination with a ten-product page size. Invalid pages are
normalized after the filtered count is calculated, and navigation preserves
search, status, and category filters. Product updates invalidate both the
original and new public detail URLs, as well as the catalogue and admin list.

Integration tests run against the dedicated `golf_test` database selected by
`E2E_DATABASE_URL`; they use test-owned product fixtures and clean them up
without touching seeded products. Playwright product tests use unique slugs
and a server-side cleanup helper. Both test environments refuse to fall back
to `DATABASE_URL`.

## Category administration

Active administrators can manage categories at `/admin/categories`, create
categories at `/admin/categories/new`, and edit them at
`/admin/categories/[id]/edit`. Category administration uses the same
Server Action, Zod validation, controlled form, and authorization patterns as
product administration. Categories show their complete product count,
including inactive products, and link directly to the filtered product admin
list. Categories cannot be permanently deleted.

Deactivating a category hides its individually active products from the public
catalogue, category filters, product detail pages, checkout quotes, and order
creation. It does not change the products' individual `isActive` values or
historical orders. Reactivating the category restores visibility for products
that are still individually active; individually inactive products remain
hidden. Product administration continues to show products assigned to
inactive categories, labels those categories clearly, and permits existing
assignments while preventing new assignments to inactive categories.

The `Category.isActive` field was added through a versioned Prisma migration.
Repeated seeding updates category names but preserves an administrator's
active/inactive choice. Category integration tests use only `golf_test`, and
category E2E cleanup validates the database through the centralized test
environment helper before removing test-owned products and categories.

## Order administration

Active administrators can review orders at `/admin/orders` and open an order
at `/admin/orders/[id]`. The list uses server-side offset pagination and
supports search by order number, customer name, or customer email, plus
fulfillment-status and UTC calendar-date filters. Invalid page values are
normalized, and pagination preserves the active filters.

Orders use the fulfillment statuses `PENDING`, `PROCESSING`, `SHIPPED`,
`DELIVERED`, and `CANCELLED`. The allowed manual transitions are:

- `PENDING` to `PROCESSING` or `CANCELLED`
- `PROCESSING` to `SHIPPED` or `CANCELLED`
- `SHIPPED` to `DELIVERED`

Delivered and cancelled orders are terminal. Each successful status change is
written to `OrderStatusHistory` in the same transaction as the order update.
The update uses a conditional status write, so a stale administrator receives
a conflict message instead of creating misleading history. The form also
submits an untrusted `expectedStatus` value representing the status displayed
when the page was loaded; the server compares it with PostgreSQL before
validating the transition and retains the conditional write for races after
that check. Stale forms must be refreshed and are never silently reinterpreted.
Existing legacy `CONFIRMED` rows are migrated to `PENDING`; checkout remains
simulated and new orders start as `PENDING`.

Order date filters accept strict `YYYY-MM-DD` calendar dates, use UTC
half-open day boundaries, and safely normalize reversed ranges. Invalid dates
such as February 30 are ignored rather than sent to Prisma. Playwright order
tests cover fulfillment, cancellation confirmation and dismissal, stale
administrator forms, access control, filtering, and unknown orders. Fixtures
use unique UUID markers and the validated `E2E_DATABASE_URL`; cleanup removes
only the matching test order and product, even when an ID was not captured.

Order detail pages render persisted customer, total, and `OrderItem` snapshot
values. Product edits, repricing, deactivation, and category changes do not
alter historical order details. This phase intentionally does not include
payments, refunds, shipping carriers, notifications, inventory, customer
accounts, or order deletion.

## Local development with Docker Compose

Prerequisites: Node.js 22.12 or newer, npm, and Docker Desktop (or Docker Engine with
Compose). Next.js runs locally; Docker runs only PostgreSQL.

1. Install packages: `npm install`.
2. Copy `.env.example` to `.env`. Use local-only placeholder values for
   `POSTGRES_PASSWORD`, `AUTH_SECRET`, and `E2E_ADMIN_PASSWORD`; do not commit `.env`.
3. Start PostgreSQL: `npm run db:up`.
4. Verify health with `docker compose ps` and inspect logs with `npm run db:logs`.
5. Confirm both databases exist:
   `docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d postgres -c "\l"'`.
   The databases are `golf` and `golf_test`.
6. Apply committed Prisma migrations to development: `npm run db:migrate:deploy`.
7. Seed development data: `npm run db:seed`.
8. Provision the local administrator interactively: `npm run admin:create`.
9. Start Next.js locally: `npm run dev`. The storefront is available at
   [http://localhost:3000](http://localhost:3000).
10. Run PostgreSQL integration tests: `npm run test:integration`.
11. Run Playwright tests: `npm run test:e2e`. Install Chromium once with
   `npx playwright install chromium` if needed.
12. Stop PostgreSQL without deleting its volume: `npm run db:down`.

The Compose service uses host port `5433`, development database `golf`, and test
database `golf_test`. The initialization SQL creates `golf_test` only when the
named volume is initialized for the first time; initialization scripts do not run
again for an existing volume. Prisma migrations and seed scripts manage application
schema and data, not the PostgreSQL initialization script.

`.env.example` documents the local variables required by the application:
`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`,
`DATABASE_URL`, `E2E_DATABASE_URL`, `AUTH_SECRET`, `E2E_ADMIN_EMAIL`, and
`E2E_ADMIN_PASSWORD`. Values in that file are placeholders only. Production
must provide a strong unique `AUTH_SECRET` and separate production database
credentials through the process environment or a secret manager; never expose
server secrets through `NEXT_PUBLIC_*`.

The Compose volume is independent from any manually created PostgreSQL container,
so it does not automatically contain that container's data. Do not delete the old
container or volume as a default troubleshooting step. If migration from it is
needed, first make an explicit backup with `pg_dump`, start this Compose database,
and restore deliberately with `pg_restore` or `psql` after reviewing the target.

### Docker Compose troubleshooting

- **Missing environment variables:** Copy `.env.example` to `.env` and ensure
  `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, and `POSTGRES_PORT` are set.
  Test commands require `E2E_DATABASE_URL` and never fall back to `DATABASE_URL`.
- **Port conflict:** Keep `POSTGRES_PORT=5433`, or choose another unused local port
  and update both database URLs. The application and tests must use the same port.
- **Existing manually created PostgreSQL container:** Compose does not manage or
  import it. Leave it untouched, use the new Compose port, or perform a separately
  reviewed backup-and-restore workflow. Compose commands use the `postgres` service
  name and do not remove volumes.

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
| `npm run db:up`           | Start PostgreSQL with Docker Compose                |
| `npm run db:down`         | Stop PostgreSQL without deleting its volume        |
| `npm run db:logs`         | Follow PostgreSQL container logs                    |
| `npm run db:migrate`      | Create and apply local Prisma migrations            |
| `npm run db:migrate:deploy` | Apply committed Prisma migrations without reset  |
| `npm run db:push`         | Push the Prisma schema; avoid this for shared data  |
| `npm run db:seed`         | Upsert the deterministic catalogue and categories   |
| `npm run test:integration` | Prepare `golf_test` and run PostgreSQL integration tests |
| `npm run test:e2e`        | Prepare `golf_test` and run Playwright tests        |
| `npm run admin:create`     | Provision one administrator interactively           |
| `npm run storybook`       | Start Storybook                                     |
| `npm run build-storybook` | Build Storybook                                     |

Use `npm run db:migrate:deploy` for production schema changes after reviewing
the migration and taking the normal database backup. Do not use
`prisma db push`, `prisma migrate reset`, test cleanup scripts, or the
development seed against production. The seed explicitly refuses to run when
`NODE_ENV=production`.

## Storybook UI primitives

Run `npm run storybook` to start Storybook locally or
`npm run build-storybook` to create the static Storybook build. Reusable
primitives and their colocated stories live in `src/components/ui`; the
current inventory contains the shared `Button` primitive. Stories are
discovered from that directory and use the same `src/app/globals.css`
Tailwind CSS 4 tokens as the Next.js application.

Add a new primitive story beside its component, use the `UI/` category
structure, expose only genuine public props through Controls, and include
keyboard or state interaction coverage where behavior warrants it. The
Storybook accessibility addon is enabled for automated checks; manual
keyboard and focus review is still required.

This phase intentionally excludes business components and complete pages,
including product, cart, checkout, and administration stories. Those stories
will be added only after the storefront design is finalized by the developer.

## Design System foundations

The shared Design System foundation lives in `src/app/globals.css`. Base
palettes (`--palette-*`) provide reusable color scales, while semantic tokens
such as `--primary`, `--background`, and `--muted-foreground` are the API
consumed by components. The semantic tokens support light mode by default and
dark mode when a `.dark` class is applied to an ancestor. The default colors
and typography are temporary foundations; the developer owns the final Parrr!
visual identity.

The CSS uses Tailwind CSS 4 `@theme inline` mappings, so Tailwind utilities
and components automatically follow token changes. Typography uses the
`text-display`, `text-heading-*`, `text-body*`, and `text-caption` scale.
Spacing continues to use Tailwind's standard scale, with shared control
heights, radii, shadows, and focus-ring tokens defined centrally. Reduced
motion preferences disable transitions and smooth scrolling.

The reusable layout primitives are `Stack` and `Container` in
`src/components/layout`. They intentionally expose a small set of typed,
forwarding props rather than recreating the full Flexbox or layout API.
Foundations stories under `src/components/foundations` show the live colors,
typography, spacing, radius, and shadow tokens in Storybook. The Storybook
toolbar can switch between light and dark previews.

To customize the brand later, update the base palette and semantic token
values in `globals.css`; components should continue consuming semantic
utilities rather than raw palette colors. Add future generic primitives next
to their implementation with a colocated story and focused behavioral tests.

## Form primitives

Native form primitives live in `src/components/ui`:

- `Input`, `Textarea`, and `Select` wrap the corresponding HTML controls.
- `Checkbox` preserves native checkbox semantics and supports an
  indeterminate visual state.
- `Label` renders a semantic label with `htmlFor` support.
- `Field`, `FieldLabel`, `FieldDescription`, and `FieldError` provide
  explicit composition for labels, descriptions, and server-returned errors.

These components support refs, controlled and uncontrolled values, standard
`name`/`defaultValue` submission, native validation, and React 19
`useActionState`/Server Action forms without owning form state. For example:

```tsx
<form action={serverAction}>
  <Field>
    <FieldLabel htmlFor="name">Name</FieldLabel>
    <Input id="name" name="name" />
  </Field>
  <Button type="submit">Save</Button>
</form>
```

Field relationships are explicit: controls should use matching `id` and
`htmlFor` values, and `aria-describedby`/`aria-errormessage` should reference
the relevant description or error IDs. Unchecked native checkboxes are not
included in `FormData`; checked boxes submit their `name` and value. Zod
validation remains on the server in feature-specific code. No form-state
library is used or required.

Form stories are under `UI/Forms` in Storybook and include disabled, invalid,
required, description, error, native submission, and indeterminate examples.
The accessibility addon checks stable stories, while manual keyboard and
focus review remains necessary.

## Testing

- `npm run test:unit` runs Vitest and React Testing Library tests.
- `npm run test:e2e` applies committed migrations, seeds the deterministic catalogue, and runs the Playwright suite against `golf_test`. It requires `E2E_DATABASE_URL`, `AUTH_SECRET`, and Chromium installed with `npx playwright install chromium`. Playwright uses a dedicated server on port 3100 and never reuses a running development server.

Unit tests do not require a database or production credentials. Browser tests use the configured database only for deterministic migration and seed setup.

## Checkout and orders

Checkout is simulated: it does not process payments, taxes, or shipping charges. Submitting checkout creates a `PENDING` `Order` and its `OrderItem` snapshots in PostgreSQL inside one Prisma transaction. The server compares the submitted accepted total with freshly read database prices before creating the order, so stale checkout totals are rejected. Each request also stores a SHA-256 fingerprint of the normalized checkout fields, cart, and accepted total. A retry with the same idempotency key and fingerprint returns the existing order; reusing a key for different details is rejected without exposing the existing confirmation token. Order items retain product names, slugs, unit prices, quantities, and line totals as historical snapshots.

Product deletion is restricted when an order item references it. This preserves the product relation while the snapshots preserve historical display data if the product is later changed. Confirmation pages require both the human-readable order number and a random confirmation token; the order number alone is not sufficient access.

Use `E2E_DATABASE_URL` for the dedicated `golf_test` database when running `npm run test:e2e`. Playwright applies committed migrations and runs the idempotent seed in [e2e/global-setup.ts](./e2e/global-setup.ts) before tests.

The PostgreSQL integration suite uses the same explicit preparation flow:
`npm run test:integration` loads `.env`, validates `E2E_DATABASE_URL`, applies migrations, seeds, provisions the configured test administrator, and runs the suite. It removes only orders whose idempotency keys were generated by the integration run. Never point either test command at a production database.

## Administrator authentication

Administrator authentication uses Auth.js `next-auth@5.0.0-beta.32` with a Credentials provider. Passwords are hashed with Node's built-in scrypt implementation and stored only as password hashes in the `User` table. Auth.js uses encrypted, expiring JWT sessions in HTTP-only cookies; session tokens are never stored in localStorage. The protected `/admin` route group verifies the session and re-checks the active administrator in PostgreSQL through `requireAdmin()` before rendering or performing future server operations.

Set `AUTH_SECRET` in `.env` using `npx auth secret` (or another secure random-value generator). Apply the user migration with `npm run db:migrate`, then provision the first administrator locally with `npm run admin:create`. The command prompts for an email and hidden password input, rejects weak passwords, and never overwrites an existing account. `ADMIN_EMAIL` and `ADMIN_PASSWORD` may be supplied only for controlled local automation; do not commit them or use them in production logs.

There is no public registration flow. The login page is `/admin/login`; unauthenticated requests to other `/admin` paths are redirected there, and signed-in administrators are redirected to the dashboard when visiting the login page. Admin responses are dynamic, marked `no-store`, and sent with `noindex, nofollow` and `no-referrer` headers. Failed login attempts are throttled in PostgreSQL to five attempts per email-keyed 15-minute window across application instances; successful authentication clears the window. This is bounded throttling, not a permanent account lockout.

All responses include `X-Content-Type-Options: nosniff` and a restrictive
`Permissions-Policy`. Production responses also include HSTS; local development
does not enable HSTS. A restrictive Content Security Policy is intentionally
not enabled until the Next.js, Auth.js, and Storybook asset requirements are
validated together.

Authentication E2E and PostgreSQL integration tests also require `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, and `AUTH_SECRET`. The test setup creates the administrator only when it is absent and rejects mismatched existing credentials; it never silently changes an existing password.

## Planned MVP

1. Product catalogue, details, and categories
2. Shopping cart
3. Simulated checkout and order confirmation
4. Basic product administration

The initial foundation deliberately stops before those features.
