# TEFFEIN ordering foundation

This working copy fixes the pre-deployment ordering audit against GitHub main commit `bf455f539e3bf7af92764d901ab631e421eac383`. The corrected Phase 1/2 migrations have been applied to the Tiffein Supabase project `boeceqmjrnxpkmhppblq` and passed transactional cloud smoke checks.

The GitHub integration rejected writes with HTTP 403, so these source changes have not reached GitHub main or the hosted frontend. The full application typecheck/build and browser checkout verification remain pending. Do not describe the frontend or Kitchen MVP as deployed.

## Deployed database source

- `supabase/migrations/20260903125901_phase1_foundation.sql`
- `supabase/migrations/20260903125913_phase2_ordering_engine.sql`

The migration filenames match the actual cloud migration history. They replace the undeployed original `20260901000001`/`20260901000002` files. Keep these deployed files immutable; future database changes belong in new migrations. `src/types/database.generated.ts` was generated from this cloud project.

All 13 application tables have RLS. Only the secure ordering RPC creates orders and their snapshots. Orders are `confirmed` with payment `pending`; no gateway charge or refund is simulated. Capacity is the sum of non-cancelled portions per delivery date and slot. Cutoffs are inclusive at 10:30 AM / 5:30 PM Asia/Kolkata. Dates are today through six days ahead.

The cloud has 5 catalog meals, 6 standard add-ons, 4 delivery slots and 3 zones. It has no customers, orders or published daily menus. Daily menu publication is an operational prerequisite; the application intentionally does not invent an orderable menu.

## Application checks

Use Node 22.18 or later. Copy `.env.example` to a local environment file and supply the project's publishable frontend key. The service-role key must never be placed in Vite environment variables.

```sh
bun install --frozen-lockfile
bun run lint
bun run build
bun run test
```

The included GitHub workflow runs these checks and PostgreSQL 17 integration tests. It has not run yet because repository writes are blocked.

## Database tests

`tests/bootstrap.sql` creates a minimal Supabase-like Auth schema for a disposable local/CI PostgreSQL database. It is not a cloud migration. Apply the migrations after bootstrap, then run `tests/ordering.sql` and `python3 tests/concurrency.py` with standard PG environment variables. The first test uses a transaction and rolls back all fixtures. The concurrency test commits temporary fixture rows in a disposable test database so independent sessions can compete, then removes its own fixtures.

Local PostgreSQL 18 checks passed for pricing, add-ons, snapshots, roles, customer RLS, serviceability, menu publication, cutoffs, portion capacity, cancellation, idempotent replay and simultaneous checkout/default-address writes. The transactional ordering test also passed against the actual Supabase PostgreSQL 17 project. Browser Auth, REST/SDK end-to-end checkout and a production app build have not been exercised in this environment.

## Kitchen preparation

See `docs/kitchen-mvp-plan.md`. The old simulated kitchen screen is disabled in this working copy. No new Admin, Delivery or Corporate panel is implemented, and Razorpay is not integrated. The Kitchen role, queue projection, transition contract and verification gate are defined, but the Kitchen migration and functioning UI still need implementation after the source/build access blocker is resolved.
