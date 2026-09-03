# Minimal Kitchen MVP — prepared after Phase 1/2 cloud verification

Phase 1/2 were deployed to Tiffein (`boeceqmjrnxpkmhppblq`) on 2026-09-03. Cloud transaction smoke tests passed and left no test users or orders. This document defines the next implementation; it does not claim the Kitchen feature is deployed.

## Scope and authorization

Use the existing `public.user_roles.role = 'kitchen'`; allow `admin` for support. Do not introduce manager/staff subroles. Read roles from the database on each privileged request. A browser role switch or user-editable Auth metadata must never grant access.

Replace the static KitchenDashboard with a date and lunch/dinner queue. The current prototype is disabled in the prepared source to avoid presenting invented batches, temperatures, chefs or successful status updates.

## Server contract

Create a new migration with `supabase migration new kitchen_mvp`, after checking CLI help. The CLI is unavailable locally and the GitHub integration currently rejects repository writes, so no hand-invented migration version is supplied. Keep the deployed Phase 1/2 files immutable.

- `get_kitchen_orders(p_order_date date, p_meal_type text)` checks `auth.uid()` and the kitchen/admin database role. Return orders in `confirmed`, `preparing`, `ready`, ordered by slot and creation time. Return only order ID/reference, date, meal type, slot label, status, meal-name snapshots, portion quantities, add-on snapshots, preparation preferences and kitchen notes. Do not expose customer account IDs, payment details, phone numbers or the full delivery address in the kitchen projection. Free-text notes may contain customer-provided personal information; show them only to authorized kitchen staff.
- `update_kitchen_order_status(p_order_id uuid, p_expected_status text, p_next_status text)` checks the same role and locks the order. Permit only `confirmed → preparing → ready`. Reject a stale expected status, skipped stages, backward transitions, cancellations and delivery transitions. Permit an exact retry of an already-completed requested transition. Never change payment status, quantity, prices or snapshots. Keep confirmation and payment independent: unpaid `pending` orders can be prepared in the current manual-payment operational mode.
- Prefer a private, non-exposed role helper. Both RPCs use a fixed empty search path and fully qualified relations. Revoke default PUBLIC/anon execution, grant authenticated execution, and enforce role membership inside the function. Customer RLS remains unchanged. Do not give kitchen users unrestricted order table SELECT/UPDATE; use the minimal projection and restricted status RPC.
- Add an append-only status event table with RLS and no client mutation grants if transition actor/history is required. Otherwise retain order `updated_at` for this first MVP and explicitly state that per-transition audit history is not yet implemented.

## Interface

Show the current date in Asia/Kolkata, lunch/dinner selector, queue counts in portions, and cards containing frozen meal names, quantities, add-ons and preferences. Show notes separately. Buttons are “Start preparing” and “Mark ready”; disable them while a request is pending. Update only from the server response. On a stale-state error, reload the queue and explain that another staff member changed the order. Refresh on focus and every 15 seconds; show the last successful refresh time and a connection error instead of inventing a fresh state.

Customer tracking already maps database `ready` to the existing UI `PACKED` status and refreshes from the database. Preserve the six-step customer ordering route.

## Required verification before activation

1. CI typecheck and production build of the customer fixes; browser smoke through sign-in, address save, published menu, pending-payment checkout and order history. A publishable frontend key and a deliberately published daily menu are prerequisites. Do not automatically publish business menus or create staff privileges merely to fill the queue.
2. Transactional database checks: anon/customer denied; kitchen/admin accepted; other roles denied; correct snapshot projection; valid transitions; duplicate retry; stale two-staff updates; skip/backward/status/payment/quantity tampering denied; customer RLS unchanged.
3. Deploy the separately verified Kitchen migration, regenerate cloud TypeScript types, run cloud transaction checks, and then activate the minimal interface. Do not implement Admin, Delivery or Corporate panels or Razorpay.

## Database advisor follow-up

The foundational database has no ERROR-level advisor findings. Function-callability warnings describe the intentionally exposed, guarded RPCs and aggregate occupancy endpoint. `is_admin(uuid)` is also exposed for existing RLS policies; moving that helper to a private schema would remove the public role-check endpoint. Performance follow-up is to scope policies to appropriate roles, use `(select auth.uid())`, and split overlapping admin ALL policies into command-specific policies. Preserve and rerun RLS tests when making those changes. Unused-index notices are expected on a database with no customer data and do not justify deleting supporting indexes.
