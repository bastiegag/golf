# Golf

A portfolio-quality storefront foundation for learning modern full-stack Next.js. The initial release focuses on a responsive storefront, server-rendered product catalogue, and a small PostgreSQL-backed product model. It intentionally does not include cart persistence, checkout, payments, authentication, or administration.

## Technology

- Next.js App Router, React Server Components, React, and strict TypeScript
- Tailwind CSS 4, shadcn/ui-compatible primitives, and Lucide icons
- PostgreSQL, Prisma 7, and Zod
- Vitest, React Testing Library, Playwright, and Storybook
- ESLint, Prettier, npm, and GitHub Actions

## Architecture

Pages and layout live in `src/app`. Reusable layout and UI components live in `src/components`; product presentation, queries, and schemas live in `src/features/products`. Product reads go directly through the server-only data-access layer in `src/features/products/queries`, and the Prisma client is isolated in `src/lib/db`.

The products route is a Server Component and stays dynamic so it reads the current catalogue at request time. Products belong to one of the seeded categories: Clothing, Accessories, or Stationery. The catalogue supports server-side filtering with `/products?category=clothing`, `/products?category=accessories`, and `/products?category=stationery`; `/products` shows all active products. If `DATABASE_URL` is not configured, the query returns an empty catalogue so the storefront can still be previewed and built without a database. Prisma stores prices as PostgreSQL `Decimal`; formatting is centralized in the product feature.

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
| `npm run storybook`       | Start Storybook                                     |
| `npm run build-storybook` | Build Storybook                                     |

## Testing

- `npm run test:unit` runs Vitest and React Testing Library tests.
- `npm run test:e2e` applies committed migrations, seeds the deterministic catalogue, and runs the Playwright storefront tests. It requires `DATABASE_URL` and a reachable PostgreSQL database, plus Chromium installed with `npx playwright install chromium`.

Unit tests do not require a database or production credentials. Browser tests use the configured database only for deterministic migration and seed setup.

## Planned MVP

1. Product catalogue, details, and categories
2. Shopping cart
3. Simulated checkout and order confirmation
4. Basic product administration

The initial foundation deliberately stops before those features.
