# TEFFEIN ordering and Kitchen MVP

The ordering foundation is merged in GitHub main at `331c22b786a304b28cbd2f985ad37c4bf2136cbc`. Its TypeScript check, production build, client tests and PostgreSQL 17 tests passed in [CI run 33764191064](https://github.com/jayendrasinh07/Teffein/actions/runs/33764191064).

This change implements the minimal Kitchen workspace and deploys its guarded database RPCs. The new frontend still needs its own CI typecheck/build and browser smoke before release; the passing foundation run does not validate these new UI files.

## Deployed database source

Connected project: Tiffein, `boeceqmjrnxpkmhppblq`.

- `supabase/migrations/20260903125901_phase1_foundation.sql`
- `supabase/migrations/20260903125913_phase2_ordering_engine.sql`
- `supabase/migrations/20260903141846_kitchen_mvp.sql`

These names match cloud migration history. Phase 1/2 remain unchanged. Kitchen was created by the Supabase CLI in the foundation CI job as `20260903135955_kitchen_mvp.sql`; after deployment its filename was synchronized with the cloud-assigned version. Cloud-generated TypeScript types include both Kitchen RPCs.

All 13 public application tables have RLS. The private Kitchen audit table has RLS and no API grants/policies, intentionally denying direct client access. Customer ordering persists immutable snapshots through the secure ordering RPC. Payment stays pending in manual-payment mode. Capacity counts non-cancelled portions per date/slot; lunch cutoff is 10:30 AM and dinner is 5:30 PM Asia/Kolkata, inclusive. Ordering supports today through six days ahead.

## Kitchen workspace

Authorized kitchen/admin accounts see a Kitchen link on desktop and mobile. The queue shows date, lunch/dinner, three preparation stages, portion totals, frozen meal/add-on names, preferences and kitchen notes. Controls permit only confirmed → preparing → ready. Changes are server-confirmed and privately audited; duplicate requests do not create duplicate events. See [Kitchen operations and verification](docs/kitchen-mvp-plan.md).

Customer addresses, phone numbers, account IDs and payment fields are excluded from the kitchen response. Free-text notes may contain customer-entered personal information and are restricted to kitchen/admin accounts. Role checks run in the database on each privileged call. Changing browser roles or Auth metadata cannot grant access.

The queue refreshes every 15 seconds while visible, on focus and on request. Failed refreshes label retained data and pause controls; revoked access clears it. Account/date/shift changes discard pending responses. Customer tracking already refreshes and maps ready to its existing PACKED presentation.

## Checks and setup

Use Node 22.18+ and Bun 1.3.10. Supply the project's publishable frontend key in a local environment file based on `.env.example`. Never use a service-role key in Vite variables.

```sh
bun install --frozen-lockfile
bun run lint
bun run build
bun run test
```

For a disposable PostgreSQL database, run `tests/bootstrap.sql`, all migrations in order, `tests/ordering.sql`, `tests/kitchen.sql`, `python3 tests/concurrency.py` and `python3 tests/kitchen_concurrency.py` with standard PG environment variables. Bootstrap and concurrency scripts are local/CI-only. The two SQL suites roll back every fixture and have also passed on connected Supabase PostgreSQL 17. Local PostgreSQL 18 concurrency and Node client suites pass.

The workflow runs the complete typecheck/build/client/database suite on pull requests and main/feature pushes.

## Activation prerequisites

The database currently has seed catalog/slots/zones, but no real users, orders or daily menus. Publish the intended daily menu and assign the existing kitchen role to the intended authenticated staff account through an authorized administrative process. Do not invent business menu choices or create test staff accounts on the live project.

Before operational use, verify the new CI run, configure the frontend key, then smoke-test customer sign-in → address → published meal → pending-payment order → Kitchen preparing/ready → refreshed customer tracking using intended accounts. No new Admin, Delivery or Corporate panel and no Razorpay integration is included.
