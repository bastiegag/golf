# Copilot instructions

- Use the Next.js App Router and prefer Server Components. Add Client Components only when browser interactivity or client hooks require them.
- Keep product queries in `src/features/products/queries` and database access in the server-only `src/lib/db` module. Never query PostgreSQL from a Client Component.
- Validate untrusted input with Zod and store product prices as Prisma/PostgreSQL decimals.
- Keep changes feature-oriented and avoid adding dependencies or abstractions without a concrete need.
- Run `npm run lint`, `npm run typecheck`, and `npm run test:unit` for code changes. Use `npm run test:e2e` for storefront navigation changes.
- Do not commit `.env` files or credentials. Ordinary tests and builds must not require a live database.
